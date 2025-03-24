import React from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';

export interface OnboardingSlideProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  isActive?: boolean;
  index?: number;
  onNext?: () => void; // Added onNext property
}

const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
  title,
  description,
  icon,
  children,
  isActive = false,
  index = 0,
  onNext,
}) => {
  if (!isActive) return null;

  return (
    <Animated.View style={[
      styles.container,
      { transform: [{ scale: 1 }] }
    ]}>
      <View style={styles.content}>
        {icon && (
          <Animated.View style={[styles.iconContainer]}>
            {icon}
          </Animated.View>
        )}
        
        <Text style={styles.title}>
          {title}
        </Text>
        
        <Text style={styles.description}>
          {description}
        </Text>
        
        <View style={styles.childrenContainer}>
          {children}
        </View>
        
        {onNext && (
          <TouchableOpacity onPress={onNext}>
            <Text style={styles.next}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    color: '#000',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
    maxWidth: 300,
  },
  childrenContainer: {
    width: '100%',
    paddingTop: 24,
  },
  next: {
    fontSize: 16,
    color: '#007BFF',
    textAlign: 'center',
    marginTop: 24,
  },
});

export default OnboardingSlide;
