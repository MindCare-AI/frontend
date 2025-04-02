import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import type { ToastProps } from './ToastContext';

interface ToastComponentProps extends ToastProps {
  onDismiss: () => void;
}

const Toast: React.FC<ToastComponentProps> = ({
  title,
  description,
  variant = 'default',
  action,
  onDismiss
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        variant === 'destructive' && styles.destructive,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.content}>
        {title && (
          <Text style={[
            styles.title,
            variant === 'destructive' && styles.destructiveText
          ]}>
            {title}
          </Text>
        )}
        {description && (
          <Text style={[
            styles.description,
            variant === 'destructive' && styles.destructiveText
          ]}>
            {description}
          </Text>
        )}
        {action && (
          <TouchableOpacity
            onPress={action.onPress}
            style={styles.actionButton}
          >
            <Text style={styles.actionText}>{action.label}</Text>
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        onPress={handleDismiss}
        style={styles.closeButton}
      >
        <X size={20} color={variant === 'destructive' ? '#fff' : '#000'} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  destructive: {
    backgroundColor: '#dc2626',
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  destructiveText: {
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  actionButton: {
    marginTop: 8,
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
  },
});

export default Toast;