import React from 'react';
import { View, StyleSheet } from 'react-native';

interface OnboardingProgressProps {
  steps: number;
  currentStep: number;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  steps,
  currentStep,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: steps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            currentStep === index && styles.activeDot,
            currentStep > index && styles.completedDot,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 16,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
  },
  activeDot: {
    width: 32,
    backgroundColor: '#000',
  },
  completedDot: {
    width: 32,
    backgroundColor: '#666',
  },
});

export default OnboardingProgress;