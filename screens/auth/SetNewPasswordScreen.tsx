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
import { NavigationProp, RouteProp, ParamListBase } from "@react-navigation/native";
import Logo from "../../assets/images/logo_mindcare.svg"; // Fixed path

// Define a more comprehensive parameter list for all screens
type RootStackParamList = {
  SetNewPassword: {
    uid: string;
    token: string;
  };
  Login: undefined;
  ForgotPassword: undefined;
  Signup: undefined;
  Welcome: undefined;
  InitialLoading: undefined;
  Splash: undefined;
  Onboarding: undefined;
  // Add any other screens as needed
};

// Update props definition with the expanded type
type SetNewPasswordScreenProps = {
  navigation: NavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'SetNewPassword'>;
};

const SetNewPasswordScreen = ({ navigation, route }: SetNewPasswordScreenProps) => {
  // Get uid and token from params, but allow them to be empty for manual entry
  const { uid: initialUid = "", token: initialToken = "" } = route.params;
  
  const [uid, setUid] = useState(initialUid);
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const handleChangeUid = (value: string) => {
    setUid(value);
    if (error) setError(null);
  };

  const handleChangeToken = (value: string) => {
    setToken(value);
    if (error) setError(null);
  };

  const handleChangePassword = (value: string) => {
    setPassword(value);
    if (error) setError(null);
    if (successMessage) setSuccessMessage(null);
  };

  const handleChangeConfirmPassword = (value: string) => {
    setConfirmPassword(value);
    if (error) setError(null);
    if (successMessage) setSuccessMessage(null);
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

  const handleSetNewPassword = async () => {
    // Check for empty fields
    if (!uid || !token) {
      setError("Please enter both UID and token from the reset link");
      shakeError();
      return;
    }

    // Check for empty passwords
    if (!password || !confirmPassword) {
      setError("Please enter both password fields");
      shakeError();
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      shakeError();
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/auth/password/reset/confirm/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid, token, new_password1: password, new_password2: confirmPassword }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (response.ok) {
        setSuccessMessage("Password has been reset successfully");
        // Navigate to login after a short delay
        setTimeout(() => {
          navigation.navigate("Login");
        }, 2000);
      } else {
        const data = await response.json();
        console.log("Response data:", data);
        setError(data.detail || "Failed to reset password");
        shakeError();
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred. Please try again.");
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
            styles.formContainer,
            { transform: [{ translateX: shakeAnimation }] },
          ]}
        >
          <Text style={styles.title}>Set New Password</Text>
          
          {/* Only show these fields if they weren't provided in navigation */}
          {(!initialUid || !initialToken) && (
            <>
              <Text style={styles.subtitle}>
                Enter the UID and token from your password reset link
              </Text>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, error && styles.inputError]}
                  placeholder="UID (from reset link)"
                  placeholderTextColor="#888888"
                  value={uid}
                  onChangeText={handleChangeUid}
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, error && styles.inputError]}
                  placeholder="Token (from reset link)"
                  placeholderTextColor="#888888"
                  value={token}
                  onChangeText={handleChangeToken}
                />
              </View>
            </>
          )}

          <Text style={styles.subtitle}>
            Enter your new password below
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="New Password"
              placeholderTextColor="#888888"
              secureTextEntry
              value={password}
              onChangeText={handleChangePassword}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="Confirm New Password"
              placeholderTextColor="#888888"
              secureTextEntry
              value={confirmPassword}
              onChangeText={handleChangeConfirmPassword}
            />
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}
          {successMessage && <Text style={styles.successText}>{successMessage}</Text>}

          <TouchableOpacity style={styles.button} onPress={handleSetNewPassword}>
            <Text style={styles.buttonText}>SET NEW PASSWORD</Text>
          </TouchableOpacity>

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

export default SetNewPasswordScreen;