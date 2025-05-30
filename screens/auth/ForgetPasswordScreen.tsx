//screens/auth/ForgetPasswordScreen.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { NavigationProp } from "@react-navigation/native"; import { globalStyles } from "../../styles/global";
import Icon from "react-native-vector-icons/FontAwesome";
import Logo from "../../assets/images/logo_mindcare.svg";
import { gsap } from 'gsap';

type ForgotPasswordScreenProps = {
  navigation: NavigationProp<any>;
};

const ForgotPasswordScreen = ({ navigation }: ForgotPasswordScreenProps) => {
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState < boolean | null > (null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showResetInstructions, setShowResetInstructions] = useState(false);

  const formRef = useRef(null);
  const logoRef = useRef(null);
  const titleRef = useRef(null);

  // Add initial animation
  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.from(logoRef.current, {
      y: -30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    })
      .from(formRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      }, "-=0.4")
      .from(titleRef.current, {
        scale: 0.9,
        opacity: 0,
        duration: 0.4,
        ease: "back.out",
      }, "-=0.3");
  }, []);

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

    if (error) setError(null);
    if (successMessage) {
      setSuccessMessage(null);
      setShowResetInstructions(false);
    }
  };
  
  // Replace shakeError with GSAP version
  const shakeError = () => {
    gsap.to(formRef.current, {
      x: 10,
      duration: 0.1,
      repeat: 3,
      yoyo: true,
      ease: "power2.inOut",
    });
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
  
    try{
      // Add button press animation
      gsap.to(formRef.current, {
        scale: 0.98,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
      });

      const response = await fetch("http://127.0.0.1:8000/api/v1/auth/password/reset/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      console.log("Response status:", response.status);

      if(response.ok) {
        gsap.to(formRef.current, {
          y: -10,
          opacity: 0.8,
          duration: 0.3,
          ease: "power2.inOut",
          yoyo: true,
          repeat: 1,
        });
        setSuccessMessage("Password reset link sent to your email");
        setShowResetInstructions(true);
      } else {
        const data = await response.json();
        console.log("Response data:", data);
        setError(data.detail || "Failed to send reset link");
        shakeError();
      }
    } catch(error) {
      console.error("Error:", error);
      setError("An error occurred. Please try again.");
      shakeError();
    }
  };
  
  const handleManualReset = () => {
    navigation.navigate("ManualResetEntry");
  };

  return (
      <SafeAreaView style={[styles.container, { backgroundColor: globalStyles.colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View ref={logoRef} style={styles.logoContainer}>
            <Logo width={120} height={120} />
            <Text style={[styles.logoText, globalStyles.title]}>MindCare AI</Text>
          </View>

          <View ref={formRef} style={[styles.formContainer, {
            backgroundColor: globalStyles.colors.white,
            shadowColor: globalStyles.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 3,
          }]}>
            <Text ref={titleRef} style={[styles.title, globalStyles.title]}>Forgot Password</Text>
            <Text style={[styles.subtitle, globalStyles.subtitle]}>
              Enter your email and we'll send you a link to reset your password
            </Text>

            <View style={[styles.inputContainer, { borderColor: globalStyles.colors.border }]}>
              <TextInput
                style={[styles.input, globalStyles.body, error ? styles.inputError : null]}
                placeholder="Email Address"
                placeholderTextColor={globalStyles.colors.textPlaceholder}
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

            {error && <Text style={[styles.errorText, { color: globalStyles.colors.error }]}>{error}</Text>}
            {successMessage && <Text style={[styles.successText, { color: globalStyles.colors.success }]}>{successMessage}</Text>}

            {showResetInstructions && (
              <View style={styles.instructionsContainer}>
                <Text style={[styles.instructionsText, { color: globalStyles.colors.textSecondary }]}>
                  1. Check your email inbox for the reset link
                </Text>
                <Text style={[styles.instructionsText, { color: globalStyles.colors.textSecondary }]}>
                  2. Open the link and copy the UID and token values from the URL
                </Text>
                <Text style={[styles.instructionsText, { color: globalStyles.colors.textSecondary }]}>
                  3. Return to this app to complete the password reset
                </Text>
                <TouchableOpacity
                  style={[styles.manualResetButton, { backgroundColor: globalStyles.colors.primary }]}
                  onPress={() => navigation.navigate("SetNewPassword", { uid: "", token: "" })}
                >
                  <Text style={[styles.manualResetButtonText, globalStyles.bodyBold, { color: globalStyles.colors.white }]}>Enter Reset Information</Text>
                </TouchableOpacity>
              </View>
            )}

            {!showResetInstructions && (
              <TouchableOpacity style={[styles.button, {
                backgroundColor: globalStyles.colors.primary,
                shadowColor: globalStyles.colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 1.5,
                elevation: 3,
              }]} onPress={handleSendResetLink}>
                <Text style={[styles.buttonText, globalStyles.bodyBold, { color: globalStyles.colors.white }]}>SEND RESET LINK</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={[styles.backToLogin, { color: globalStyles.colors.primary }]}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: globalStyles.spacing.md,
    },
    logoContainer: {
      alignItems: "center",
      marginTop: globalStyles.spacing.xxl,
      marginBottom: globalStyles.spacing.xl,
    },
    logoText: {
      marginTop: globalStyles.spacing.xs,
    },
    formContainer: {
      padding: globalStyles.spacing.md,
      borderRadius: globalStyles.spacing.sm,
    },
    title: {
      marginBottom: globalStyles.spacing.xs,
      textAlign: "center",
    },
    subtitle: {
      marginBottom: globalStyles.spacing.md,
      textAlign: "center",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: globalStyles.spacing.sm,
      backgroundColor: globalStyles.colors.white,
      borderWidth: 1,
      borderRadius: globalStyles.spacing.sm,
    },
    input: {
      flex: 1,
      height: 50,
      paddingHorizontal: globalStyles.spacing.md,
    },
    inputIcon: {
      padding: globalStyles.spacing.xs,
    },
    inputError: {
      borderColor: globalStyles.colors.error,
    },
    errorText: {
      marginBottom: globalStyles.spacing.sm,
      textAlign: "center",
    },
    successText: {
      marginBottom: globalStyles.spacing.sm,
      textAlign: "center",
    },
    instructionsContainer: {
      marginTop: globalStyles.spacing.md,
    },
    instructionsText: {
      marginBottom: globalStyles.spacing.xs,
    },
    manualResetButton: {
      padding: globalStyles.spacing.xs,
      borderRadius: globalStyles.spacing.xxs,
      alignItems: "center",
      marginTop: globalStyles.spacing.xs,
    },
    manualResetButtonText: {},
    button: {
      width: "100%",
      padding: globalStyles.spacing.sm,
      borderRadius: globalStyles.spacing.sm,
      alignItems: "center",
    },
    buttonText: {},
    backToLogin: {
      textAlign: "center",
      marginTop: globalStyles.spacing.md,
    },
  });

  export default ForgotPasswordScreen;