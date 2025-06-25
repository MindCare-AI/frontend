import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import OnboardingProgress from './OnboardingProgress';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  totalSteps: number;
  currentStep: number;
  onBack?: () => void;
  onNext?: () => void;
  showProgress?: boolean;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children, totalSteps, currentStep, onBack, onNext, showProgress = true
}) => (
  <SafeAreaView style={styles.container}>
    {/* Header */}
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onBack}
        disabled={!onBack}
        style={styles.headerButton}
      >
        <ArrowLeft size={20} color="#666" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>MindCare AI</Text>

      <TouchableOpacity
        onPress={onNext}
        disabled={currentStep === totalSteps - 1}
        style={styles.headerButton}
      >
        <Text style={styles.skipText}>Next</Text>
      </TouchableOpacity>
    </View>

    {/* Content */}
    <View style={styles.content}>
      {children}
    </View>

    {/* Progress */}
    {showProgress && (
      <View style={styles.footer}>
        <OnboardingProgress
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
      </View>
    )}
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  skipText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  footer: {
    padding: 24,
    paddingTop: 0,
    alignItems: 'center',
  },
});

export default OnboardingLayout;