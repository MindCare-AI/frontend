import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import OnboardingProgress from './OnboardingProgress';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  totalSteps: number;
  currentStep: number;
  onBack?: () => void;
  onSkip?: () => void;
  showProgress?: boolean;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  totalSteps,
  currentStep,
  onBack,
  onSkip,
  showProgress = true,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={[
            styles.headerButton,
            !onBack && styles.invisible
          ]}
          disabled={!onBack}
        >
          <ArrowLeft size={20} color="#666" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>MindCare AI</Text>

        <TouchableOpacity
          onPress={onSkip}
          style={[
            styles.headerButton,
            !onSkip && styles.invisible
          ]}
          disabled={!onSkip}
        >
          <Text style={styles.skipText}>Skip</Text>
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
            totalSteps={totalSteps}
            currentStep={currentStep}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

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
  invisible: {
    opacity: 0,
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