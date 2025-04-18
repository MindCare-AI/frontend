import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '@react-navigation/native';

interface TypingIndicatorProps {
  typingUsers: string[];
  style?: any;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
  style
}) => {
  const { colors } = useTheme();
  const dots = [useRef(new Animated.Value(0)).current, 
                useRef(new Animated.Value(0)).current,
                useRef(new Animated.Value(0)).current];

  useEffect(() => {
    if (typingUsers.length > 0) {
      animateDots();
    }
  }, [typingUsers]);

  const animateDots = () => {
    const animations = dots.map((dot, index) => {
      return Animated.sequence([
        Animated.delay(index * 200),
        Animated.timing(dot, {
          toValue: 1,
          duration: 400,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(dot, {
          toValue: 0,
          duration: 400,
          easing: Easing.ease,
          useNativeDriver: true,
        })
      ]);
    });

    Animated.loop(
      Animated.parallel(animations)
    ).start();
  };

  if (typingUsers.length === 0) return null;

  const typingText = typingUsers.length === 1
    ? `${typingUsers[0]} is typing...`
    : typingUsers.length === 2
    ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
    : `${typingUsers.length} people are typing...`;

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.text, { color: colors.text }]}>
        {typingText}
      </Text>
      <View style={styles.dotsContainer}>
        {dots.map((dot, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: colors.text,
                opacity: dot,
                transform: [{
                  translateY: dot.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -4]
                  })
                }]
              }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  text: {
    fontSize: 12,
    marginRight: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 2,
  }
});

export default TypingIndicator;