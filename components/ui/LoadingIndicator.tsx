import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

interface LoadingIndicatorProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'medium',
  color = '#002D62',
}) => {
  const spinValue = new Animated.Value(0);
  const dotScale = new Animated.Value(0);

  React.useEffect(() => {
    // Rotate animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Dots scale animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotScale, {
          toValue: 1,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(dotScale, {
          toValue: 0,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'large':
        return 48;
      default:
        return 36;
    }
  };

  const getDotSize = () => getSize() / 6;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: getSize(),
            height: getSize(),
            borderColor: color,
            transform: [{ rotate: spin }],
          },
        ]}
      />
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map((i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                width: getDotSize(),
                height: getDotSize(),
                backgroundColor: color,
                opacity: dotScale,
                transform: [
                  {
                    scale: dotScale.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
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
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    borderWidth: 2,
    borderRadius: 100,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 4,
  },
  dot: {
    borderRadius: 100,
  },
});

export default LoadingIndicator;