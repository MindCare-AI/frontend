import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, Animated, Easing } from 'react-native';
import LottieView from 'lottie-react-native';

interface OnboardingLoadingScreenProps {
  userType: 'patient' | 'therapist';
  onLoadingComplete: () => void;
  duration?: number; // in milliseconds
}

const OnboardingLoadingScreen: React.FC<OnboardingLoadingScreenProps> = ({ 
  userType, 
  onLoadingComplete,
  duration = 3000 // Default 3 seconds
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  const patientText = [
    "Creating your personalized wellness space...",
    "Setting up mood tracking tools...",
    "Preparing your journal...",
    "Connecting you with resources...",
    "Almost ready for your wellness journey..."
  ];
  
  const therapistText = [
    "Setting up your professional profile...",
    "Configuring appointment system...",
    "Preparing client management tools...",
    "Setting up secure messaging...",
    "Almost ready for your practice management..."
  ];

  const displayText = userType === 'patient' ? patientText : therapistText;

  // Simple 3-second timer - that's it!
  useEffect(() => {
    // Fake progress bar animation (just for show)
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 3000, // ALWAYS 3 seconds, no matter what
      useNativeDriver: false,
      easing: Easing.linear
    }).start();
    
    // Simple text cycling
    const textInterval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => 
        prevIndex >= displayText.length - 1 ? 0 : prevIndex + 1
      );
    }, 1000);
    
    // Go to next page after EXACTLY 3 seconds
    const timer = setTimeout(() => {
      console.log('3 seconds passed, going to next page!');
      onLoadingComplete();
    }, 3000); // EXACTLY 3 seconds, ignore duration prop

    return () => {
      clearInterval(textInterval);
      clearTimeout(timer);
    };
  }, [onLoadingComplete]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.animationContainer}>
          <LottieView
            source={require('../../assets/Animation.json')}
            autoPlay
            loop
            style={styles.animation}
          />
        </View>
        
        <Text style={styles.loadingText}>
          {displayText[currentTextIndex]}
        </Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View 
              style={[
                styles.progressBarFill, 
                { 
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                    extrapolate: 'clamp'
                  })
                }
              ]} 
            />
          </View>
        </View>
      </View>
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
    backgroundColor: '#E4F0F6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  animationContainer: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  loadingText: {
    fontSize: 18,
    color: '#002D62',
    textAlign: 'center',
    fontWeight: '500',
    marginHorizontal: 20,
    lineHeight: 24,
    marginBottom: 30,
  },
  progressContainer: {
    width: 280,
    marginTop: 10,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#D1E3F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0066CC',
    borderRadius: 4,
  }
});

export default OnboardingLoadingScreen;
