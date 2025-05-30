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
  Modal,
  ActivityIndicator,
} from "react-native";
import { NavigationProp, CommonActions } from "@react-navigation/native";
import { RootStackParamList } from "../../types/navigation"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome";
import Logo from "../../assets/images/logo_mindcare.svg";
import { API_BASE_URL, SOCIAL_LOGIN_URLS, GOOGLE_CLIENT_ID, GITHUB_CLIENT_ID, OAUTH_CONFIG } from "../../config";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../contexts/AuthContext';
import { gsap } from 'gsap';
import { resetOnboardingStatus } from '../../lib/onboarding';
import { setCachedToken } from '../../lib/utils';
import { createShadow } from '../../styles/global';

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
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Logging in...");

  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const { signIn } = useAuth();

  const logoRef = useRef<View | null>(null);
  const formRef = useRef<View | null>(null);
  const socialButtonsRef = useRef<View | null>(null);

  useEffect(() => {
    // Log all available route names for debugging
    try {
      const state = navigation.getState();
      console.log("Available routes in this navigator:", state.routeNames);
      
      // Also log the current navigation state
      console.log("Current navigation state:", JSON.stringify(state, null, 2));
    } catch (error) {
      console.error("Error inspecting navigation:", error);
    }
  }, [navigation]);

  useEffect(() => {
    // Initial animation timeline
    const tl = gsap.timeline();
    
    tl.from(logoRef.current, {
      y: -50,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    })
    .from(formRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.5");
    // Remove or comment out the following tween since React Native does not use traditional CSS selectors
    // .from('.socialButton', {
    //   y: 20,
    //   opacity: 0,
    //   duration: 0.4,
    //   stagger: 0.1,
    //   ease: "power2.out"
    // }, "-=0.3");
  }, []);

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
    gsap.to(formRef.current, {
      x: 10,
      duration: 0.1,
      repeat: 3,
      yoyo: true,
      ease: "power2.inOut"
    });
  };

  // Check if the user has seen the onboarding
  const checkAndNavigate = async (userProfile?: any) => {
    try {
      console.log("Navigating with profile:", userProfile);
      
      // If user_type is empty or undefined, always show onboarding
      if (!userProfile?.user_type || userProfile.user_type.trim() === "") {
        console.log("User has no user_type, navigating to onboarding");
        setLoadingMessage("Preparing onboarding...");
        
        // Reset the onboarding flag first
        await resetOnboardingStatus();
        
        // Hide loading before navigation to prevent overlay issues
        setIsLoading(false);
        
        // Navigate to onboarding
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Onboarding' }],
          })
        );
        
        return;
      }
      
      // For users with a user_type
      console.log("User has user_type:", userProfile.user_type, "going to Home");
      setLoadingMessage("Loading home screen...");
      
      // Hide loading before navigation to prevent overlay issues
      setIsLoading(false);
      
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{
            name: 'App',
            params: { screen: 'Home' }
          }],
        })
      );
    } catch (error) {
      console.error("Error in navigation:", error);
      setIsLoading(false);
      Alert.alert(
        'Navigation Error',
        'An error occurred during login navigation. Please check logs.'
      );
    }
  };

  const handleLoginAsync = async () => {
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
      // Animate button press
      gsap.to(formRef.current, {
        scale: 0.98,
        duration: 0.1,
        yoyo: true,
        repeat: 1
      });

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
        // Show loading overlay immediately after successful login
        setIsLoading(true);
        setLoadingMessage("Authenticating...");
        
        // Success animation
        gsap.to(formRef.current, {
          y: -20,
          opacity: 0,
          duration: 0.5,
          ease: "power2.in",
          onComplete: () => {
            // Execute async operations after animation completes
            (async () => {
              try {
                await signIn({
                  access: data.access,
                  refresh: data.refresh,
                });
                // Cache the access token synchronously for use in WebSocket connection, etc.
                setCachedToken(data.access);
                
                setLoadingMessage("...");
                
                try {
                  const profileResponse = await fetch(`${API_BASE_URL}/api/v1/users/me/`, {
                    method: "GET",
                    headers: {
                      "Authorization": `Bearer ${data.access}`,
                      "Content-Type": "application/json"
                    }
                  });
                  const profileData = await profileResponse.json();
                  console.log("User profile:", profileData);
                  // Pass profileData so that checkAndNavigate can test user_type
                  checkAndNavigate(profileData);
                } catch (profileError) {
                  console.error("Error fetching user profile:", profileError);
                  // Hide loading in case of error
                  setIsLoading(false);
                  // In case of error, you can decide what to do (default to onboarding, for example)
                  checkAndNavigate();
                }
              } catch (error) {
                console.error("Authentication error:", error);
                setIsLoading(false);
              }
            })();
          }
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

  // Synchronous wrapper function
  const handleLogin = () => {
    handleLoginAsync().catch(err => {
      console.error("Unhandled login error:", err);
    });
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

          // Fetch user profile before navigating
          try {
            const profileResponse = await fetch(`${API_BASE_URL}/api/v1/users/me/`, {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${data.access}`,
                "Content-Type": "application/json"
              }
            });
            const profileData = await profileResponse.json();
            console.log("OAuth user profile:", profileData);

            // Use signIn from AuthContext to properly set the tokens
            await signIn({
              access: data.access,
              refresh: data.refresh,
            });

            // Check profile and navigate accordingly
            if (!profileData?.user_type || profileData.user_type.trim() === "") {
              console.log("OAuth user has no user_type, navigating to onboarding");
              await resetOnboardingStatus();
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Onboarding' }],
                })
              );
            } else {
              console.log("OAuth user has user_type, going to Home");
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{
                    name: 'App',
                    params: { screen: 'Home' }
                  }],
                })
              );
            }
          } catch (profileError) {
            console.error("Error fetching OAuth user profile:", profileError);
            // Default to standard checkAndNavigate
            await checkAndNavigate();
          }
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
        <View ref={logoRef} style={styles.logoContainer}>
          <Logo width={120} height={120} />
          <Text style={styles.logoText}>MindCare AI</Text>
        </View>

        <View ref={formRef} style={styles.loginContainer}>
          <Text style={styles.title}>Sign In</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, loginError ? styles.inputError : undefined]}
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
              style={[styles.input, loginError ? styles.inputError : undefined]}
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

          <View ref={socialButtonsRef} style={styles.socialButtonsContainer}>
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
        </View>
      </ScrollView>
      
      {/* Loading overlay */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isLoading}
        onRequestClose={() => {}}
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#002D62" />
            <Text style={styles.loadingText}>{loadingMessage}</Text>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 40,
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
    letterSpacing: 0.5,
  },
  loginContainer: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    ...createShadow(5),
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#002D62",
    marginBottom: 24,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CFCFCF",
    borderRadius: 10,
  },
  input: {
    flex: 1,
    height: 54,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#333",
  },
  inputIcon: {
    padding: 12,
  },
  inputError: {
    borderColor: "#E74C3C",
    borderWidth: 1.5,
  },
  errorText: {
    color: "#E74C3C",
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "500",
  },
  forgotPassword: {
    color: "#002D62",
    textAlign: "center",
    marginTop: 18,
    fontSize: 15,
    textDecorationLine: "underline",
    fontWeight: "500",
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#002D62",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    ...createShadow(4),
    marginTop: 6,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  createAccount: {
    color: "#002D62",
    textAlign: "center",
    marginTop: 22,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: "500",
  },
  socialButtonsContainer: {
    marginTop: 24,
    marginBottom: 4,
    width: '100%',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CFCFCF',
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
    ...createShadow(1, '#000', 0.1),
  },
  socialButtonText: {
    marginLeft: 12,
    color: '#002D62',
    fontWeight: '500',
    fontSize: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    maxWidth: 300,
    ...createShadow(5),
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#002D62',
    textAlign: 'center',
  },
});

export default LoginScreen;