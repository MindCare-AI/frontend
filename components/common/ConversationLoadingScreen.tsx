import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import LottieView from 'lottie-react-native';

interface ConversationLoadingScreenProps {
  message?: string;
}

const ConversationLoadingScreen: React.FC<ConversationLoadingScreenProps> = ({ 
  message = "Loading conversations..." 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        <LottieView
          source={require('../../assets/Animation.json')}
          autoPlay
          loop
          style={styles.animation}
        />
      </View>
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
  },
  animationContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default ConversationLoadingScreen;
