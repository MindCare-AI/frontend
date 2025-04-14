import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

export const TypingIndicator: React.FC = () => {
  const dots = Array(3).fill(0);
  const opacityValues = dots.map(() => useSharedValue(0.3));

  useEffect(() => {
    dots.forEach((_, index) => {
      opacityValues[index].value = withRepeat(
        withSequence(
          withDelay(
            index * 200,
            withTiming(1, { duration: 300 })
          ),
          withTiming(0.3, { duration: 300 })
        ),
        -1,
        true
      );
    });
  }, []);

  const dotStyles = dots.map((_, index) => 
    useAnimatedStyle(() => ({
      opacity: opacityValues[index].value,
      transform: [
        {
          translateY: withRepeat(
            withSequence(
              withDelay(
                index * 200,
                withTiming(-4, { duration: 300 })
              ),
              withTiming(0, { duration: 300 })
            ),
            -1,
            true
          ),
        },
      ],
    }))
  );

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={styles.container}
    >
      {dots.map((_, index) => (
        <Animated.View
          key={index}
          style={[styles.dot, dotStyles[index]]}
        />
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    width: 52,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6B7280',
  },
});

export default TypingIndicator;