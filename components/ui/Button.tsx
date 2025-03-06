"use client";

import React from "react";
import { Platform, TouchableOpacity, TouchableOpacityProps, View } from "react-native";

type CommonProps = {
  className?: string;
  children?: React.ReactNode;
};

type NativeButtonProps = TouchableOpacityProps & CommonProps;
type WebButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & CommonProps;

type ButtonProps = {
  onPress?: () => void;
} & (WebButtonProps | NativeButtonProps);

export const Button = React.forwardRef<HTMLButtonElement | View, ButtonProps>(
  ({ className = "", children, onPress, ...props }, ref) => {
    if (Platform.OS === "web") {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          className={`px-4 py-2 rounded ${className}`}
          onClick={onPress}
          {...(props as WebButtonProps)}
        >
          {children}
        </button>
      );
    }

    return (
      <TouchableOpacity
        ref={ref as React.Ref<View>}
        onPress={onPress}
        {...(props as NativeButtonProps)}
      >
        {children}
      </TouchableOpacity>
    );
  }
);

Button.displayName = "Button";
