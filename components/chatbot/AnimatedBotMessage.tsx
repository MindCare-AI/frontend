//// filepath: /home/siaziz/Desktop/frontend/screens/ChatbotScreen/AnimatedBotMessage.tsx
import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';

interface AnimatedBotMessageProps {
  text: string;
  speed?: number; // milliseconds between characters
}

export default function AnimatedBotMessage({ text, speed = 50 }: AnimatedBotMessageProps) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index++;
      setDisplayedText(text.slice(0, index));
      if (index === text.length) {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return <Text style={styles.text}>{displayedText}</Text>;
}

const styles = StyleSheet.create({
  text: {
    color: '#333',
    fontSize: 16,
  },
});