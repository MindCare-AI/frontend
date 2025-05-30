import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface TextareaProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  minHeight?: number;
  error?: string;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  style?: any;
}

export const Textarea = React.forwardRef<TextInput, TextareaProps>(
  (
    {
      value,
      onChangeText,
      placeholder,
      maxLength,
      minHeight = 100,
      error,
      label,
      helperText,
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const focusAnim = useRef(new Animated.Value(0)).current;
    const errorShakeAnim = useRef(new Animated.Value(0)).current;

    const handleFocus = () => {
      setIsFocused(true);
      Animated.spring(focusAnim, {
        toValue: 1,
        useNativeDriver: false,
      }).start();
    };

    const handleBlur = () => {
      setIsFocused(false);
      Animated.spring(focusAnim, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    };

    React.useEffect(() => {
      if (error) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        
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

    const borderColor = focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [error ? '#DC2626' : '#E5E7EB', error ? '#DC2626' : '#002D62'],
    });

    const labelColor = focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [error ? '#DC2626' : '#6B7280', error ? '#DC2626' : '#002D62'],
    });

    const characterCount = value.length;
    const isNearLimit = maxLength && characterCount >= maxLength * 0.9;

    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View
          style={[
            styles.inputContainer,
            isFocused && styles.focused,
            error ? styles.errorContainer : null,
            style,
          ]}
        >
          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            maxLength={maxLength}
            editable={!disabled}
            style={[styles.input, { minHeight }, disabled && { color: '#9CA3AF' }]}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            accessibilityState={{ disabled }}
            {...props}
          />
        </View>
        <View style={styles.footer}>
          {helperText && (
            <Text style={[styles.helperText, error ? styles.errorText : undefined]}>{helperText}</Text>
          )}
          {maxLength !== undefined && (
            <Text
              style={[
                styles.charCount,
                value.length >= maxLength && styles.atLimit,
                value.length >= maxLength - 10 && value.length < maxLength && styles.nearLimit,
              ].filter(Boolean)}
            >
              {value.length}/{maxLength}
            </Text>
          )}
        </View>
      </View>
    );
  }
);

Textarea.displayName = 'Textarea';

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
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
  },
  focused: {
    shadowColor: '#002D62',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  errorContainer: {
    borderColor: '#DC2626',
  },
  input: {
    fontSize: 16,
    color: '#1F2937',
    padding: 0,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
    marginRight: 8,
  },
  errorText: {
    color: '#DC2626',
  },
  charCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  nearLimit: {
    color: '#D97706',
  },
  atLimit: {
    color: '#DC2626',
  },
});