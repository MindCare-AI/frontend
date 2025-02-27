import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  Image,
} from "react-native";
import { NavigationProp } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import Logo from "../../assets/images/logo_mindcare.svg";

type LoginScreenProps = {
  navigation: NavigationProp<any>;
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
    // Log current form data for debugging
    console.log("Login data:", formData);
    
    // Check for empty fields
    if (!formData.email || !formData.password) {
      setLoginError("Please fill in all fields");
      shakeError();
      return;
    }
  
    // Check email format
    if (!validateEmail(formData.email)) {
      setLoginError("Please enter a valid email address");
      shakeError();
      return;
    }
  
    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log("Login success:", data);
        // Store authentication tokens if returned from the API
        // AsyncStorage.setItem("authToken", data.token);
        navigation.navigate("Home"); // If Home is in the same navigator
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } else {
        setLoginError(data.message || "Login failed");
        shakeError();
      }
    } catch (error) {
      console.error("Network error:", error);
      setLoginError("Network error, please try again");
      shakeError();
    }
  };

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

          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgotPassword}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
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
  },
  loginContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#002D62",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CFCFCF",
    borderRadius: 10,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#333",
  },
  inputIcon: {
    padding: 10,
  },
  inputError: {
    borderColor: "#E74C3C",
  },
  errorText: {
    color: "#E74C3C",
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
  },
  forgotPassword: {
    color: "#002D62",
    textAlign: "center",
    marginTop: 15,
    fontSize: 14,
    textDecorationLine: "underline",
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#002D62",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  createAccount: {
    color: "#002D62",
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
});

export default LoginScreen;
