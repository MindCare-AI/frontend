import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { globalStyles } from '../../styles/global';

interface TypingAnimationProps {
  text: string;
  onComplete?: () => void;
  speed?: number; // Characters per second
  style?: any;
  textStyle?: any;
}

const TypingAnimation: React.FC<TypingAnimationProps> = ({
  text,
  onComplete,
  speed = 30, // Default typing speed (chars per second)
  style,
  textStyle
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const dotOpacity = useRef(new Animated.Value(0)).current;

  // Reset animation when text changes
  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    
    // Calculate typing time in ms per character
    const typingTimePerChar = 1000 / speed;
    
    let currentIndex = 0;
    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        // Get the next character
        const nextChar = text[currentIndex];
        
        // If punctuation, add a slight pause
        const isPunctuation = ['.', ',', '!', '?', ';', ':'].includes(nextChar);
        const pauseFactor = isPunctuation ? 3 : 1;
        
        // Update displayed text
        setDisplayedText(prev => prev + nextChar);
        currentIndex++;
        
        // If punctuation, adjust timing for the next character
        if (isPunctuation && currentIndex < text.length) {
          setTimeout(() => {
            // This timeout creates a pause after punctuation
          }, typingTimePerChar * pauseFactor);
        }
      } else {
        clearInterval(timer);
        setIsComplete(true);
        if (onComplete) onComplete();
      }
    }, typingTimePerChar);

    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  // Blinking dots animation while typing
  useEffect(() => {
    if (!isComplete) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dotOpacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      Animated.timing(dotOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isComplete, dotOpacity]);

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.text, textStyle]}>
        {displayedText}
        {!isComplete && (
          <Animated.Text style={{ opacity: dotOpacity }}>
            <Text style={[styles.cursor, textStyle]}>▋</Text>
          </Animated.Text>
        )}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  text: {
    fontSize: 16,
    color: globalStyles.colors.text,
    lineHeight: 22,
  },
  cursor: {
    fontSize: 16,
    color: globalStyles.colors.primary,
  },
});

export default TypingAnimation;
