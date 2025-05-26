import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps,
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentStep + 1} of {totalSteps}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#E4F0F6',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#D1E7DD',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#002D62',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#002D62',
    fontWeight: '500',
  },
});

export default OnboardingProgress;