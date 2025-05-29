import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Shield, FileText, User } from 'lucide-react-native';

interface TherapistVerificationIntroProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const TherapistVerificationIntro: React.FC<TherapistVerificationIntroProps> = ({ onNext, onBack, onSkip }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Shield size={60} color="#002D62" />
        </View>
        
        <Text style={styles.title}>Therapist Verification</Text>
        <Text style={styles.subtitle}>
          To ensure the safety and quality of our platform, we need to verify your professional credentials.
        </Text>

        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementsTitle}>You'll need to provide:</Text>
          
          <View style={styles.requirement}>
            <FileText size={20} color="#002D62" />
            <Text style={styles.requirementText}>Professional license documentation</Text>
          </View>
          
          <View style={styles.requirement}>
            <User size={20} color="#002D62" />
            <Text style={styles.requirementText}>Identity verification photo</Text>
          </View>
          
          <View style={styles.requirement}>
            <Shield size={20} color="#002D62" />
            <Text style={styles.requirementText}>Professional credentials</Text>
          </View>
        </View>

        <Text style={styles.note}>
          This process typically takes 1-2 business days. You'll be notified once your verification is complete.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipButtonText}>Skip for Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={onNext}>
          <Text style={styles.nextButtonText}>Start Verification</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E4F0F6',
    padding: 30,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#002D62',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  requirementsContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
  },
  requirementsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#002D62',
    marginBottom: 20,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  requirementText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  note: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#002D62',
  },
  backButtonText: {
    color: '#002D62',
    fontWeight: 'bold',
    fontSize: 14,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
  },
  skipButtonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 14,
  },
  nextButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#002D62',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default TherapistVerificationIntro;
