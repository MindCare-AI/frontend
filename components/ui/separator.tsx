import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
  style?: any;
}

export const Separator = React.forwardRef<View, SeparatorProps>(
  ({ orientation = 'horizontal', decorative = true, style }, ref) => {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        ref={ref}
        style={[
          styles.separator,
          orientation === 'horizontal' ? styles.horizontal : styles.vertical,
          { opacity: fadeAnim },
          style,
        ]}
        accessibilityRole={decorative ? 'none' : 'separator'}
      />
    );
  }
);

Separator.displayName = 'Separator';

const styles = StyleSheet.create({
  separator: {
    backgroundColor: '#E5E7EB',
    flexShrink: 0,
  },
  horizontal: {
    width: '100%',
    height: 1,
    marginVertical: 8,
  },
  vertical: {
    height: '100%',
    width: 1,
    marginHorizontal: 8,
  },
});
