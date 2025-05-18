import React from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { globalStyles } from '../../styles/global';

interface TypingIndicatorProps {
  username?: string;
}

export function TypingIndicator({ username }: TypingIndicatorProps) {
  // Create animated values for each dot
  const dot1Opacity = React.useRef(new Animated.Value(0)).current;
  const dot2Opacity = React.useRef(new Animated.Value(0)).current;
  const dot3Opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.timing(dot, {
          toValue: 1,
          duration: 200,
          delay,
          useNativeDriver: true,
          easing: Easing.ease,
        }),
        Animated.timing(dot, {
          toValue: 0,
          duration: 200,
          delay: 200,
          useNativeDriver: true,
          easing: Easing.ease,
        }),
      ]);
    };

    const animation = Animated.loop(
      Animated.parallel([
        animateDot(dot1Opacity, 0),
        animateDot(dot2Opacity, 200),
        animateDot(dot3Opacity, 400),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      {username && <Text style={styles.username}>{username} is typing</Text>}
      <View style={styles.dots}>
        {[dot1Opacity, dot2Opacity, dot3Opacity].map((opacity, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                opacity,
                transform: [
                  {
                    scale: opacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingLeft: 16,
  },
  username: {
    fontSize: 12,
    color: globalStyles.colors.textSecondary,
    marginRight: 8,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: globalStyles.colors.primary,
    marginHorizontal: 2,
  },
});