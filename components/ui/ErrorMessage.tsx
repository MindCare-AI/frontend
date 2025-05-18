import React from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, AccessibilityInfo } from 'react-native';
import { AlertTriangle, X } from 'lucide-react-native';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  autoHideDuration?: number;
  severity?: 'error' | 'warning' | 'info';
  onRetry?: () => Promise<void>;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onDismiss,
  autoHideDuration = 5000,
  severity = 'error',
}) => {
  const translateY = React.useRef(new Animated.Value(-100)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Show animation
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Announce error message for screen readers
    AccessibilityInfo.announceForAccessibility(message);

    // Auto-hide if duration is provided and onDismiss exists
    if (autoHideDuration && onDismiss) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: -100,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onDismiss) {
        onDismiss();
      }
    });
  };

  const getBackgroundColor = () => {
    switch (severity) {
      case 'warning':
        return '#FEF3C7';
      case 'info':
        return '#E0F2FE';
      default:
        return '#FEE2E2';
    }
  };

  const getTextColor = () => {
    switch (severity) {
      case 'warning':
        return '#92400E';
      case 'info':
        return '#075985';
      default:
        return '#991B1B';
    }
  };

  const getIconColor = () => {
    switch (severity) {
      case 'warning':
        return '#D97706';
      case 'info':
        return '#0284C7';
      default:
        return '#DC2626';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: getBackgroundColor(),
        },
      ]}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel={`${severity} alert: ${message}`}
    >
      <View style={styles.content}>
        <AlertTriangle size={20} color={getIconColor()} />
        <Text style={[styles.message, { color: getTextColor() }]}>{message}</Text>
      </View>
      {onDismiss && (
        <TouchableOpacity
          onPress={handleDismiss}
          style={styles.dismissButton}
          accessibilityRole="button"
          accessibilityLabel="Dismiss error message"
        >
          <X size={20} color={getTextColor()} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  message: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
  },
  dismissButton: {
    padding: 4,
  },
});

export default ErrorMessage;