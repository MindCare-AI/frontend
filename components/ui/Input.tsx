"use client";

import React from "react";
import { Platform, TextInput as NativeTextInput, TextInputProps as RNTextInputProps, StyleSheet } from "react-native";

// Define common props that can be used on both platforms
type CommonProps = {
  className?: string;
  style?: any;
};

// Separate props for web and native to avoid type conflicts
type NativeInputProps = RNTextInputProps & CommonProps;

type WebInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'style'> & CommonProps;

// Combined props type that includes both native and web props
type InputProps = CommonProps & {
  onChangeText?: (text: string) => void;
  onSubmitEditing?: () => void;
  placeholderTextColor?: string;
} & (WebInputProps | NativeInputProps);

// Web-specific styles using proper CSS properties
const webStyles = {
  input: {
    backgroundColor: "white",
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
  } as const,
};

// Native-specific styles
const nativeStyles = StyleSheet.create({
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    // Native shadow properties
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export const Input = React.forwardRef<HTMLInputElement | NativeTextInput, InputProps>(
  ({ className = "", style, onChangeText, onSubmitEditing, placeholderTextColor, ...props }, ref) => {
    if (Platform.OS === "web") {
      return (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          className={`focus:outline-none focus:ring-2 focus:ring-blue-300 ${className}`}
          style={{ ...webStyles.input, ...style }}
          onChange={(e) => {
            (props as WebInputProps).onChange?.(e);
            onChangeText?.(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSubmitEditing?.();
            }
            (props as WebInputProps).onKeyDown?.(e);
          }}
          {...(props as WebInputProps)}
        />
      );
    }

    return (
      <NativeTextInput
        ref={ref as React.Ref<NativeTextInput>}
        style={[nativeStyles.input, style]}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        placeholderTextColor={placeholderTextColor}
        {...(props as NativeInputProps)}
      />
    );
  }
);

Input.displayName = "Input";
