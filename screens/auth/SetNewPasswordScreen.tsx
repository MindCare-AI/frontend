//screens/auth/SetNewPasswordScreen.tsx
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
} from "react-native";
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from "../../types/navigation";
import { gsap } from 'gsap';

type SetNewPasswordScreenProps = StackScreenProps<AuthStackParamList, 'SetNewPassword'>;

const SetNewPasswordScreen: React.FC<SetNewPasswordScreenProps> = ({ route, navigation }) => {
  const { uid, token } = route.params;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    // Initial animation timeline
    const tl = gsap.timeline();
    
    tl.from(titleRef.current, {
      y: -30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    })
    .from(formRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.4");
  }, []);

  const shakeError = () => {
    gsap.to(formRef.current, {
      x: 10,
      duration: 0.1,
      repeat: 3,
      yoyo: true,
      ease: "power2.inOut"
    });
  };

  const handleSetNewPassword = async () => {
    if (!password || !confirmPassword) {
      setError("Please enter both password fields");
      shakeError();
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      shakeError();
      return;
    }

    try {
      // Add button press animation
      gsap.to(formRef.current, {
        scale: 0.98,
        duration: 0.1,
        yoyo: true,
        repeat: 1
      });

      const response = await fetch("http://127.0.0.1:8000/api/v1/auth/password/reset/confirm/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, token, new_password1: password, new_password2: confirmPassword }),
      });

      if (response.ok) {
        setSuccessMessage("Password reset successful!");
        // Success animation
        gsap.to(formRef.current, {
          y: -20,
          opacity: 0,
          duration: 0.5,
          ease: "power2.in",
          onComplete: () => {
            setTimeout(() => {
              navigation.navigate("Login" as never);
            }, 1000);
          }
        });
      } else {
        const data = await response.json();
        setError(data.detail || "Password reset failed");
        shakeError();
      }
    } catch (error) {
      setError("Network error, please try again.");
      shakeError();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text ref={titleRef} style={styles.title}>Set New Password</Text>
        
        <View ref={formRef} style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="New Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}
          {successMessage && <Text style={styles.successText}>{successMessage}</Text>}

          <TouchableOpacity style={styles.button} onPress={handleSetNewPassword}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E4F0F6" },
  scrollContainer: { flexGrow: 1, padding: 20 },
  formContainer: { backgroundColor: "#fff", padding: 20, borderRadius: 10 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: { height: 50, borderWidth: 1, paddingHorizontal: 10, marginBottom: 10 },
  errorText: { color: "red", textAlign: "center", marginBottom: 10 },
  successText: { color: "green", textAlign: "center", marginBottom: 10 },
  button: { backgroundColor: "#002D62", padding: 15, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default SetNewPasswordScreen;
