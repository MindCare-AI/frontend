import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { globalStyles } from '../../styles/global';

interface LoadingMessageIndicatorProps {
  text?: string;
}

const LoadingMessageIndicator: React.FC<LoadingMessageIndicatorProps> = ({
  text = 'Loading messages...'
}) => {
  const dotOneOpacity = useRef(new Animated.Value(0.3)).current;
  const dotTwoOpacity = useRef(new Animated.Value(0.3)).current;
  const dotThreeOpacity = useRef(new Animated.Value(0.3)).current;
  
  useEffect(() => {
    const animateDots = () => {
      Animated.sequence([
        // Dot one animation
        Animated.timing(dotOneOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.ease
        }),
        // Dot two animation
        Animated.timing(dotTwoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.ease
        }),
        // Dot three animation
        Animated.timing(dotThreeOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.ease
        }),
        // Reset all
        Animated.parallel([
          Animated.timing(dotOneOpacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.ease
          }),
          Animated.timing(dotTwoOpacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.ease
          }),
          Animated.timing(dotThreeOpacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.ease
          })
        ])
      ]).start(() => {
        // Loop the animation
        animateDots();
      });
    };
    
    animateDots();
    
    return () => {
      // Cleanup animations
      dotOneOpacity.stopAnimation();
      dotTwoOpacity.stopAnimation();
      dotThreeOpacity.stopAnimation();
    };
  }, []);
  
  return (
    <View style={styles.container}>
      <View style={styles.bubbleContainer}>
        <Text style={styles.text}>{text}</Text>
        <View style={styles.dots}>
          <Animated.View style={[styles.dot, { opacity: dotOneOpacity }]} />
          <Animated.View style={[styles.dot, { opacity: dotTwoOpacity }]} />
          <Animated.View style={[styles.dot, { opacity: dotThreeOpacity }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'flex-start',
  },
  bubbleContainer: {
    backgroundColor: globalStyles.colors.backgroundLight,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  text: {
    fontSize: 14,
    color: globalStyles.colors.neutralDark,
    marginRight: 8,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: globalStyles.colors.primary,
    marginHorizontal: 2,
  }
});

export default LoadingMessageIndicator;
