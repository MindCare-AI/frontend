"use client";

import React from "react";
import { Platform, TouchableOpacity, TouchableOpacityProps, View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost";
type Size = "small" | "medium" | "large" | "icon";

type ButtonBaseProps = {
  className?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
};

type NativeButtonProps = TouchableOpacityProps & ButtonBaseProps;
type WebButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & ButtonBaseProps;

type ExtendedButtonProps = NativeButtonProps | WebButtonProps;

export const Button = React.forwardRef<HTMLButtonElement | View, ExtendedButtonProps>(
  ({ className = "", children, onPress, variant = "primary", size = "medium", ...props }, ref) => {
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
      <TouchableOpacity
        ref={ref as React.Ref<View>}
        onPress={onPress}
        style={combinedStyle}
        {...(props as NativeButtonProps)}
      >
        {children}
      </TouchableOpacity>
    );
  }
);

Button.displayName = "Button";
