import React from 'react';
import { View, StyleSheet } from 'react-native';

interface TypingIndicatorProps {
  visible: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <View style={[styles.dot, styles.secondDot]} />
      <View style={[styles.dot, styles.thirdDot]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#002D62',
    marginHorizontal: 2,
  },
  secondDot: {
    opacity: 0.7,
    transform: [{ scale: 0.9 }],
  },
  thirdDot: {
    opacity: 0.4,
    transform: [{ scale: 0.8 }],
  },
});

export default TypingIndicator;