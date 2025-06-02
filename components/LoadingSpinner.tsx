import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

const LoadingSpinner = ({ visible = true }) => {
  if (!visible) return null;
  
  return (
    <View style={styles.container}>
      <LottieView
        source={{
          uri: "https://lottie.host/f9fa0587-8f5c-40e2-98a0-95f8e0912adc/7pAXupINJT.lottie"
        }}
        // If URI doesn't work with the format, use a local JSON file instead:
        // source={require('../assets/loading-animation.json')}
        style={styles.animation}
        autoPlay
        loop
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  animation: {
    width: 150,
    height: 150,
  },
});

export default LoadingSpinner;