// LoginScreen.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  Alert,
  Linking,
} from "react-native";
import { NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../../types/navigation"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome";
import Logo from "../../assets/images/logo_mindcare.svg";
import { API_BASE_URL, SOCIAL_LOGIN_URLS, GOOGLE_CLIENT_ID, GITHUB_CLIENT_ID, OAUTH_CONFIG } from "../../config";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

type LoginScreenProps = {
  navigation: NavigationProp<RootStackParamList>;
};

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });

    if (field === "email") {
      if (value.length > 0) {
        setIsEmailValid(validateEmail(value));
      } else {
        setIsEmailValid(null);
      }
    }

    // Clear any error when user starts typing again
    if (loginError) setLoginError(null);
  };

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setLoginError("Please fill in all fields.");
      shakeError();
      return;
    }

    if (!validateEmail(formData.email)) {
      setLoginError("Please enter a valid email address.");
      shakeError();
      return;
    }

    try {
      console.log("Login data:", { email: formData.email, password: formData.password });
      
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (response.ok) {
        // Fix token storage: Use consistent key names
        await AsyncStorage.setItem("accessToken", data.access); // Match auth.tsx
        if (data.refresh) {
          await AsyncStorage.setItem("refreshToken", data.refresh);
        }

        console.log("Tokens saved successfully");
        
        navigation.reset({
          index: 0,
          routes: [{ 
            name: 'App',
            params: { screen: 'Home' } // Changed from 'Welcome' to 'Home'
          }],
        });
      } else {
        setLoginError(data.detail || "Invalid email or password.");
        shakeError();
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("An error occurred during login. Please try again.");
      shakeError();
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Generate secure state
      const state = uuidv4().replace(/-/g, '');
      await AsyncStorage.setItem('oauth_state', state);

      const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: OAUTH_CONFIG.redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        state: state,
        access_type: 'offline',
        prompt: 'consent'
      });

      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
      await Linking.openURL(googleAuthUrl);
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert('Error', 'Failed to initiate Google sign in');
    }
  };

  const handleGithubLogin = async () => {
    try {
      // Generate secure state for CSRF protection
      const state = uuidv4().replace(/-/g, '');
      await AsyncStorage.setItem('oauth_state', state);

      // Construct GitHub OAuth URL with correct redirect URI
      const params = new URLSearchParams({
        client_id: GITHUB_CLIENT_ID,
        redirect_uri: 'com.mindcareai.app:/oauth2redirect',
        scope: OAUTH_CONFIG.githubAuth.scope,
        state: state,
        allow_signup: OAUTH_CONFIG.githubAuth.allowSignup.toString()
      });

      const githubAuthUrl = `https://github.com/login/oauth/authorize?${params}`;
      await Linking.openURL(githubAuthUrl);
    } catch (error) {
      console.error('GitHub login error:', error);
      Alert.alert(
        'Login Error',
        'Failed to initiate GitHub login. Please try again.'
      );
    }
  };

  useEffect(() => {
    // Create subscription object to handle cleanup
    let subscription: any;

    const setupDeepLinkHandler = () => {
      subscription = Linking.addEventListener('url', handleDeepLink);
    };

    const handleDeepLink = async ({ url }: { url: string }) => {
      if (url.includes('oauth_callback')) {
        try {
          const params = new URLSearchParams(url.split('?')[1]);
          const code = params.get('code');
          const state = params.get('state');
          const storedState = await AsyncStorage.getItem('oauth_state');

          // Verify state parameter to prevent CSRF attacks
          if (!code || state !== storedState) {
            throw new Error('Invalid authentication response');
          }

          // Determine OAuth provider and handle authentication
          const isGoogle = url.toLowerCase().includes('google');
          const endpoint = isGoogle ? 
            `${API_BASE_URL}/api/v1/auth/login/google/callback/` :
            `${API_BASE_URL}/api/v1/auth/login/github/callback/`;

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, state })
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.detail || 'OAuth login failed');
          }

          // Store tokens atomically
          await AsyncStorage.multiSet([
            ['accessToken', data.access],
            ['refreshToken', data.refresh]
          ]);

          // Navigate to app
          navigation.reset({
            index: 0,
            routes: [{ 
              name: 'App',
              params: { screen: 'Home' } // Changed from 'Welcome' to 'Home'
            }]
          });
        } catch (error) {
          console.error('OAuth callback error:', error);
          Alert.alert(
            'Login Error',
            'Failed to complete authentication. Please try again.'
          );
          navigation.navigate('Auth', { screen: 'Login' });
        } finally {
          await AsyncStorage.removeItem('oauth_state');
        }
      }
    };

    setupDeepLinkHandler();

    // Cleanup function
    return () => {
      if (subscription?.remove) {
        subscription.remove();
      }
    };
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Logo width={120} height={120} />
          <Text style={styles.logoText}>MindCare AI</Text>
        </View>

        <Animated.View
          style={[
            styles.loginContainer,
            { transform: [{ translateX: shakeAnimation }] },
          ]}
        >
          <Text style={styles.title}>Sign In</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, loginError && styles.inputError]}
              placeholder="Email Address"
              placeholderTextColor="#888888"
              keyboardType="email-address"
              value={formData.email}
              onChangeText={(value) => handleChange("email", value)}
            />
            {isEmailValid !== null && (
              <Icon
                name={isEmailValid ? "check" : "times"}
                size={20}
                color={isEmailValid ? "#27AE60" : "#E74C3C"}
                style={styles.inputIcon}
              />
            )}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, loginError && styles.inputError]}
              placeholder="Password"
              placeholderTextColor="#888888"
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={(value) => handleChange("password", value)}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.inputIcon}
            >
              <Icon
                name={showPassword ? "eye-slash" : "eye"}
                size={20}
                color="#888888"
              />
            </TouchableOpacity>
          </View>

          {loginError && <Text style={styles.errorText}>{loginError}</Text>}

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>SIGN IN</Text>
          </TouchableOpacity>

          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={handleGoogleLogin}
            >
              <Icon name="google" size={20} color="#DB4437" />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.socialButton}
              onPress={handleGithubLogin}
            >
              <Icon name="github" size={20} color="#333" />
              <Text style={styles.socialButtonText}>Continue with GitHub</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("Auth", { screen: "ForgotPassword" })}
          >
            <Text style={styles.forgotPassword}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Auth", { screen: "Signup" })}>
            <Text style={styles.createAccount}>
              Don't have an account? Sign Up
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E4F0F6",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40, // Add more bottom padding for better scrolling experience
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 30,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#002D62",
    marginTop: 10,
    letterSpacing: 0.5, // Add letter spacing for better readability
  },
  loginContainer: {
    backgroundColor: "#fff",
    padding: 24, // Increase padding for better spacing
    borderRadius: 12, // Slightly increase border radius
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 }, // Enhance shadow effect
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5, // Increase elevation for better material design
    marginHorizontal: 2, // Add slight horizontal margin
  },
  title: {
    fontSize: 26, // Slightly larger font
    fontWeight: "bold",
    color: "#002D62",
    marginBottom: 24, // Increase spacing
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18, // Increase spacing between inputs
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CFCFCF",
    borderRadius: 10,
  },
  input: {
    flex: 1,
    height: 54, // Slightly taller inputs
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#333",
  },
  inputIcon: {
    padding: 12, // Increase touch target size
  },
  inputError: {
    borderColor: "#E74C3C",
    borderWidth: 1.5, // Make error border slightly thicker
  },
  errorText: {
    color: "#E74C3C",
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "500", // Make error text slightly bolder
  },
  forgotPassword: {
    color: "#002D62",
    textAlign: "center",
    marginTop: 18, // Increase spacing
    fontSize: 15, // Slightly larger
    textDecorationLine: "underline",
    fontWeight: "500", // Make it slightly bolder
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#002D62",
    padding: 16, // Slightly taller button
    borderRadius: 10,
    alignItems: "center",
    elevation: 4, // Enhance elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    marginTop: 6, // Add some spacing from the input
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5, // Add letter spacing for better readability
  },
  createAccount: {
    color: "#002D62",
    textAlign: "center",
    marginTop: 22, // Increase spacing
    marginBottom: 8, // Add bottom margin
    fontSize: 15, // Slightly larger
    fontWeight: "500", // Make it slightly bolder
  },
  socialButtonsContainer: {
    marginTop: 24, // Increase spacing
    marginBottom: 4, // Add bottom margin
    width: '100%',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14, // Increase padding
    borderRadius: 10, // Match login button radius
    borderWidth: 1,
    borderColor: '#CFCFCF',
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
    elevation: 1, // Add subtle elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  socialButtonText: {
    marginLeft: 12, // Increase spacing from icon
    color: '#002D62',
    fontWeight: '500',
    fontSize: 16,
  },
});

export default LoginScreen;