import React, { useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import { NavigationProp } from "@react-navigation/native";
import Logo from '../assets/images/logo_mindcare.svg'; // Adjust the path based on your file structure

type SplashScreenProps = {
  navigation: NavigationProp<any>;
};

const SplashScreen = ({ navigation }: SplashScreenProps) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.navigate("Welcome");
    }, 2000);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Logo width={150} height={150} style={styles.logo} />
      <Text style={styles.copyright}>© 2025 MindCare AI</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    marginBottom: 20,
  },
  copyright: {
    position: 'absolute',
    bottom: 20,
    color: '#888',
    fontSize: 12,
  }
});

export default SplashScreen;