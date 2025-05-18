"use client";

import React, { forwardRef, useState } from "react";
import {
  Platform,
  TextInput,
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TextInputProps as NativeTextInputProps,
} from "react-native";
import { Eye, EyeOff, AlertCircle } from "lucide-react-native";
import * as Haptics from 'expo-haptics';

// Define common props that can be used on both platforms
type CommonProps = {
  className?: string;
  style?: any;
};

// Separate props for web and native to avoid type conflicts
type NativeInputProps = NativeTextInputProps & CommonProps;

type WebInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'style'> & CommonProps;

// Combined props type that includes both native and web props
type BaseInputProps = CommonProps & {
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

export interface InputProps extends NativeTextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
  className?: string;
}

const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      secureTextEntry,
      showPasswordToggle,
      style,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isSecureTextVisible, setIsSecureTextVisible] = useState(false);
    const focusAnim = React.useRef(new Animated.Value(0)).current;
    const errorShakeAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
      if (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Animated.sequence([
          Animated.timing(errorShakeAnim, {
            toValue: 10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(errorShakeAnim, {
            toValue: -10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(errorShakeAnim, {
            toValue: 10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(errorShakeAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [error]);

    const handleFocus = (e: any) => {
      setIsFocused(true);
      Animated.spring(focusAnim, {
        toValue: 1,
        useNativeDriver: false,
      }).start();
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      Animated.spring(focusAnim, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
      onBlur?.(e);
    };

    const borderColor = focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [error ? '#DC2626' : '#E5E7EB', error ? '#DC2626' : '#002D62'],
    });

    const labelColor = focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [error ? '#DC2626' : '#6B7280', error ? '#DC2626' : '#002D62'],
    });

    return (
      <Animated.View
        style={[
          styles.container,
          { transform: [{ translateX: errorShakeAnim }] },
        ]}
      >
        {label && (
          <Animated.Text
            style={[
              styles.label,
              {
                color: labelColor,
                transform: [
                  {
                    scale: focusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.1],
                    }),
                  },
                ],
              },
            ]}
          >
            {label}
          </Animated.Text>
        )}

        <Animated.View
          style={[
            styles.inputContainer,
            { borderColor },
            isFocused && styles.focused,
          ]}
        >
          {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}

          <TextInput
            ref={ref}
            style={[
              styles.input,
              leftIcon ? styles.inputWithLeftIcon : null,
              (rightIcon || showPasswordToggle) ? styles.inputWithRightIcon : null,
              style,
            ]}
            placeholderTextColor="#9CA3AF"
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={secureTextEntry && !isSecureTextVisible}
            accessibilityLabel={label}
            accessibilityHint={helperText}
            accessibilityState={{ disabled: false }}
            {...props}
          />

          {showPasswordToggle && (
            <TouchableOpacity
              style={styles.iconContainer}
              onPress={() => setIsSecureTextVisible(!isSecureTextVisible)}
              accessibilityRole="button"
              accessibilityLabel={
                isSecureTextVisible ? "Hide password" : "Show password"
              }
            >
              {isSecureTextVisible ? (
                <EyeOff size={20} color="#6B7280" />
              ) : (
                <Eye size={20} color="#6B7280" />
              )}
            </TouchableOpacity>
          )}

          {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
        </Animated.View>

        {(error || helperText) && (
          <View style={styles.messageContainer}>
            {error && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            {helperText && !error && (
              <Text style={styles.helperText}>{helperText}</Text>
            )}
          </View>
        )}
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: 'white',
    minHeight: 48,
  },
  focused: {
    shadowColor: '#002D62',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWithLeftIcon: {
    paddingLeft: 12,
  },
  inputWithRightIcon: {
    paddingRight: 12,
  },
  iconContainer: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    marginTop: 6,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#DC2626',
    flex: 1,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

Input.displayName = "Input";

export { Input };
