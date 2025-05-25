import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface TypingIndicatorProps {
  visible: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ visible }) => {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show container
      Animated.timing(containerOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Start bouncing animation
      const createBounceAnimation = (animValue: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 600,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        );
      };

      const animations = [
        createBounceAnimation(dot1Anim, 0),
        createBounceAnimation(dot2Anim, 200),
        createBounceAnimation(dot3Anim, 400),
      ];

      animations.forEach(anim => anim.start());

      return () => {
        animations.forEach(anim => anim.stop());
      };
    } else {
      // Hide container
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, dot1Anim, dot2Anim, dot3Anim, containerOpacity]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: containerOpacity,
        },
      ]}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Animated.Text style={styles.avatarText}>🤖</Animated.Text>
        </View>
      </View>
      
      <View style={styles.typingBubble}>
        <View style={styles.dotsContainer}>
          <Animated.View
            style={[
              styles.dot,
              { 
                opacity: dot1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              { 
                opacity: dot2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              { 
                opacity: dot3Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
              },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    marginTop: 4,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
  },
  typingBubble: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
    marginHorizontal: 2,
  },
});