  import React from "react";
  import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Image,
  } from "react-native";
  import { useNavigation } from "@react-navigation/native";
  import { StackNavigationProp } from "@react-navigation/stack";
  import { RootStackParamList } from "../../navigation/RootNavigator";
  import Logo from "../../assets/images/logo_mindcare.svg";

  type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

  const WelcomeScreen = () => {
    const navigation = useNavigation<WelcomeScreenNavigationProp>();

    const handleGoToLogin = () => {
      navigation.navigate("Auth", { screen: "Login" });
    };

    const handleSignup = () => {
      navigation.navigate("Auth", { screen: "Signup" });
    };

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.logoContainer}>
            <Logo width={150} height={150} />
            <Text style={styles.logoText}>MindCare AI</Text>
          </View>

          <Text style={styles.welcomeText}>Welcome to MindCare</Text>
          <Text style={styles.subtitleText}>
            Your personal AI companion for mental wellbeing
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleGoToLogin}
            >
              <Text style={styles.primaryButtonText}>SIGN IN</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleSignup}
            >
              <Text style={styles.secondaryButtonText}>CREATE ACCOUNT</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.privacyText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </SafeAreaView>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#E4F0F6",
    },
    contentContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 30,
    },
    logoContainer: {
      alignItems: "center",
      marginBottom: 50,
    },
    logoText: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#002D62",
      marginTop: 15,
    },
    welcomeText: {
      fontSize: 26,
      fontWeight: "bold",
      color: "#002D62",
      textAlign: "center",
      marginBottom: 15,
    },
    subtitleText: {
      fontSize: 16,
      color: "#555",
      textAlign: "center",
      marginBottom: 50,
    },
    buttonContainer: {
      width: "100%",
      marginTop: 20,
      gap: 16,
    },
    primaryButton: {
      backgroundColor: "#002D62",
      paddingVertical: 16,
      borderRadius: 10,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    primaryButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
    },
    secondaryButton: {
      backgroundColor: "transparent",
      paddingVertical: 16,
      borderRadius: 10,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#002D62",
    },
    secondaryButtonText: {
      color: "#002D62",
      fontWeight: "bold",
      fontSize: 16,
    },
    privacyText: {
      fontSize: 12,
      color: "#777",
      textAlign: "center",
      marginBottom: 20,
      paddingHorizontal: 30,
    },
  });

  export default WelcomeScreen;