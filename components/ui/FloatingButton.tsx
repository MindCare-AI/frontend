import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Animated,
  Platform,
} from 'react-native';
import { globalStyles } from '../../styles/global';

interface FloatingButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
}

export function FloatingButton({ icon, onPress, style }: FloatingButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {icon}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: globalStyles.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});