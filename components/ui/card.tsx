"use client";

import React, { useRef } from "react";
import { View, Platform, Animated, StyleSheet, Pressable } from "react-native";
import * as Haptics from 'expo-haptics';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  disabled?: boolean;
  style?: any;
}

export function Card({ children, onPress, variant = 'default', disabled, style }: CardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || !onPress) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    if (disabled || !onPress) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getBackgroundColor = () => {
    if (disabled) return '#F3F4F6';
    return '#FFFFFF';
  };

  const getBorderColor = () => {
    if (disabled) return '#E5E7EB';
    return variant === 'outlined' ? '#E5E7EB' : 'transparent';
  };

  const CardWrapper = onPress ? Pressable : View;

  return (
    <CardWrapper
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({ pressed }: any) => [
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outlined' ? 1 : 0,
          transform: [{ scale: scaleAnim }],
          opacity: pressed ? 0.9 : 1,
        },
        variant === 'elevated' && {
          shadowOpacity: shadowAnim,
        },
        style,
      ]}
      disabled={disabled}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityState={{ disabled }}
    >
      {children}
    </CardWrapper>
  );
}

export function CardHeader({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[styles.header, style]}>
      {children}
    </View>
  );
}

export function CardContent({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[styles.content, style]}>
      {children}
    </View>
  );
}

export function CardFooter({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[styles.footer, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  content: {
    padding: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});