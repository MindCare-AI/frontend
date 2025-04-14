"use client";

import React from "react";
import {
  Platform,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Text,
  ActivityIndicator,
  Animated,
} from "react-native";
import clsx from "clsx";
import * as Haptics from 'expo-haptics';

type Variant = "primary" | "secondary" | "ghost" | "outline" | "destructive";
type Size = "small" | "medium" | "large" | "icon" | "sm" | "md" | "lg";

type ButtonBaseProps = {
  className?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
};

type NativeButtonProps = TouchableOpacityProps & ButtonBaseProps;
type WebButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & ButtonBaseProps;

type ExtendedButtonProps = NativeButtonProps | WebButtonProps;

export const Button = React.forwardRef<HTMLButtonElement | View, ExtendedButtonProps>(
  (
    {
      className = "",
      children,
      onPress,
      variant = "primary",
      size = "medium",
      disabled = false,
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      if (disabled || loading) return;

      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    };

    const handlePressOut = () => {
      if (disabled || loading) return;

      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    const getBackgroundColor = () => {
      if (disabled) return "#E5E7EB";

      switch (variant) {
        case "secondary":
          return "#E4F0F6";
        case "outline":
        case "ghost":
          return "transparent";
        case "destructive":
          return "#DC2626";
        default:
          return "#002D62";
      }
    };

    const getTextColor = () => {
      if (disabled) return "#9CA3AF";

      switch (variant) {
        case "secondary":
        case "outline":
        case "ghost":
          return "#002D62";
        case "destructive":
        case "primary":
          return "#FFFFFF";
        default:
          return "#FFFFFF";
      }
    };

    const getBorderColor = () => {
      if (disabled) return "#E5E7EB";

      switch (variant) {
        case "outline":
          return "#002D62";
        case "destructive":
          return "#DC2626";
        default:
          return "transparent";
      }
    };

    const getPadding = () => {
      switch (size) {
        case "sm":
          return { paddingVertical: 8, paddingHorizontal: 12 };
        case "lg":
          return { paddingVertical: 16, paddingHorizontal: 24 };
        default:
          return { paddingVertical: 12, paddingHorizontal: 16 };
      }
    };

    const getFontSize = () => {
      switch (size) {
        case "sm":
          return 14;
        case "lg":
          return 18;
        default:
          return 16;
      }
    };

    const nativeStyles = StyleSheet.create({
      button: {
        paddingHorizontal: size === "small" ? 8 : size === "large" ? 24 : 16,
        paddingVertical: size === "small" ? 4 : size === "large" ? 12 : 8,
        borderRadius: 4,
        backgroundColor: variant === "primary" ? "#3B82F6" : variant === "secondary" ? "#E5E7EB" : "transparent",
      },
    });

    if (Platform.OS === "web") {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          className={clsx(variant, size, className)}
          onClick={onPress}
          {...(props as WebButtonProps)}
        >
          {children}
        </button>
      );
    }

    const combinedStyle: StyleProp<ViewStyle> = [nativeStyles.button, props.style as ViewStyle];

    return (
      <Animated.View
        style={[
          styles.container,
          fullWidth && styles.fullWidth,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <TouchableOpacity
          ref={ref as React.Ref<View>}
          onPress={loading ? undefined : onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          style={[
            styles.button,
            {
              backgroundColor: getBackgroundColor(),
              borderColor: getBorderColor(),
              borderWidth: variant === "outline" ? 2 : 0,
              ...getPadding(),
            },
            fullWidth && styles.fullWidth,
            combinedStyle,
          ]}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityState={{ disabled: disabled || loading }}
          {...(props as NativeButtonProps)}
        >
          {loading ? (
            <ActivityIndicator
              color={getTextColor()}
              size={size === "sm" ? "small" : "small"}
            />
          ) : (
            <View style={styles.contentContainer}>
              {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
              <Text
                style={[
                  styles.text,
                  {
                    color: getTextColor(),
                    fontSize: getFontSize(),
                  },
                ]}
              >
                {children}
              </Text>
              {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

Button.displayName = "Button";

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  button: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  fullWidth: {
    width: "100%",
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
