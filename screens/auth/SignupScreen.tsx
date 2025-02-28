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
} from "react-native";
import { NavigationProp } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import Logo from "../../assets/images/logo_mindcare.svg";

type SignupScreenProps = {
  navigation: NavigationProp<any>;
};

const SignupScreen = ({ navigation }: SignupScreenProps) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password1: "",
    password2: "",
    first_name: "",
    last_name: "",
  });
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);

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
    if (signupError) setSignupError(null);
  };

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: false,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: false,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: false,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleSignup = async () => {
    console.log("Form data:", formData);

    // Basic validation
    if (
      !formData.username ||
      !formData.email ||
      !formData.password1 ||
      !formData.password2 ||
      !formData.first_name ||
      !formData.last_name
    ) {
      setSignupError("Please fill in all fields");
      shakeError();
      return;
    }

    // Email validation
    if (!validateEmail(formData.email)) {
      setSignupError("Please enter a valid email address");
      shakeError();
      return;
    }

    // Password matching
    if (formData.password1 !== formData.password2) {
      setSignupError("Passwords do not match");
      shakeError();
      return;
    }

    // Prepare payload as expected by the backend's CustomRegisterSerializer
    const payload = {
      username: formData.username,
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      password1: formData.password1,
      password2: formData.password2,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Signup success:", data);
        // Navigate to Login screen after successful registration
        navigation.navigate("Login");
      } else {
        console.error("Signup error details:", data);
        setSignupError(
          data.detail ||
            data.email ||
            data.username ||
            "Signup failed"
        );
        shakeError();
      }
    } catch (error) {
      console.error("Network error during signup:", error);
      setSignupError("Network error, please try again");
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
            styles.signupContainer,
            { transform: [{ translateX: shakeAnimation }] },
          ]}
        >
          <Text style={styles.title}>Create Your Account</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#888888"
              value={formData.username}
              onChangeText={(value) => handleChange("username", value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
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
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#888888"
              value={formData.first_name}
              onChangeText={(value) => handleChange("first_name", value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#888888"
              value={formData.last_name}
              onChangeText={(value) => handleChange("last_name", value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#888888"
              secureTextEntry={!showPassword1}
              value={formData.password1}
              onChangeText={(value) => handleChange("password1", value)}
            />
            <TouchableOpacity
              onPress={() => setShowPassword1(!showPassword1)}
              style={styles.inputIcon}
            >
              <Icon
                name={showPassword1 ? "eye-slash" : "eye"}
                size={20}
                color="#888888"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#888888"
              secureTextEntry={!showPassword2}
              value={formData.password2}
              onChangeText={(value) => handleChange("password2", value)}
            />
            <TouchableOpacity
              onPress={() => setShowPassword2(!showPassword2)}
              style={styles.inputIcon}
            >
              <Icon
                name={showPassword2 ? "eye-slash" : "eye"}
                size={20}
                color="#888888"
              />
            </TouchableOpacity>
          </View>

          {signupError && <Text style={styles.errorText}>{signupError}</Text>}

          <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
            <Text style={styles.signupButtonText}>CREATE ACCOUNT</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginLink}>
              Already have an account? Sign In
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
  signupContainer: {
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
  errorText: {
    color: "#E74C3C",
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
  },
  signupButton: {
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
  signupButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginLink: {
    color: "#002D62",
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
});

export default SignupScreen;