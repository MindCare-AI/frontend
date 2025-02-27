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
  Alert,
} from "react-native";
import { NavigationProp } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import Logo from "../../assets/images/logo_mindcare.svg"; // Fixed path

type ForgotPasswordScreenProps = {
  navigation: NavigationProp<any>;
};

const ForgotPasswordScreen = ({ navigation }: ForgotPasswordScreenProps) => {
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showResetInstructions, setShowResetInstructions] = useState(false);
  
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleChange = (value: string) => {
    setEmail(value);
    
    if (value.length > 0) {
      setIsEmailValid(validateEmail(value));
    } else {
      setIsEmailValid(null);
    }
    
    // Clear any messages when user starts typing again
    if (error) setError(null);
    if (successMessage) {
      setSuccessMessage(null);
      setShowResetInstructions(false);
    }
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

  const handleSendResetLink = async () => {
    // Check for empty email
    if (!email) {
      setError("Please enter your email address");
      shakeError();
      return;
    }
  
    // Check email format
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      shakeError();
      return;
    }
  
    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/auth/password/reset/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        setSuccessMessage("Password reset link sent to your email");
        setShowResetInstructions(true);
      } else {
        const data = await response.json();
        console.log("Response data:", data);
        setError(data.detail || "Failed to send reset link");
        shakeError();
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred. Please try again.");
      shakeError();
    }
  };

  const handleManualReset = () => {
    navigation.navigate("ManualResetEntry");
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
            styles.formContainer,
            { transform: [{ translateX: shakeAnimation }] },
          ]}
        >
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a link to reset your password
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="Email Address"
              placeholderTextColor="#888888"
              keyboardType="email-address"
              value={email}
              onChangeText={handleChange}
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

          {error && <Text style={styles.errorText}>{error}</Text>}
          {successMessage && <Text style={styles.successText}>{successMessage}</Text>}
          
          {showResetInstructions && (
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsText}>
                1. Check your email inbox for the reset link
              </Text>
              <Text style={styles.instructionsText}>
                2. Open the link and copy the UID and token values from the URL
              </Text>
              <Text style={styles.instructionsText}>
                3. Return to this app to complete the password reset
              </Text>
              <TouchableOpacity 
                style={styles.manualResetButton} 
                onPress={() => navigation.navigate("SetNewPassword", { uid: "", token: "" })}
              >
                <Text style={styles.manualResetButtonText}>Enter Reset Information</Text>
              </TouchableOpacity>
            </View>
          )}

          {!showResetInstructions && (
            <TouchableOpacity style={styles.button} onPress={handleSendResetLink}>
              <Text style={styles.buttonText}>SEND RESET LINK</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.backToLogin}>Back to Login</Text>
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
  formContainer: {
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
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
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
  successText: {
    color: "#27AE60",
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
  },
  instructionsContainer: {
    marginTop: 20,
  },
  instructionsText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  manualResetButton: {
    backgroundColor: "#002D62",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  manualResetButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  button: {
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
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backToLogin: {
    color: "#002D62",
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
});

export default ForgotPasswordScreen;