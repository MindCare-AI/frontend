import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Import onboarding components
import UserTypeSelection from '../../components/Onboarding/UserTypeSelection';
import PatientPersonalInfo from '../../components/Onboarding/PatientPersonalInfo';
import PatientProfilePicture from '../../components/Onboarding/PatientProfilePicture';
import PatientBloodType from '../../components/Onboarding/PatientBloodType';
import PatientWellnessGoals from '../../components/Onboarding/PatientWellnessGoals';
import TherapistBasicInfo from '../../components/Onboarding/TherapistBasicInfo';
import TherapistVerificationCamera from '../../components/Onboarding/TherapistVerificationCamera';
import OnboardingProgress from '../../components/Onboarding/OnboardingProgress';
import { setUserType, getCurrentUser } from '../../utils/onboardingAPI';

type OnboardingStep = 
  | 'userType'
  | 'patientPersonalInfo'
  | 'patientProfilePicture'
  | 'patientBloodType'
  | 'patientGoals'
  | 'therapistBasicInfo'
  | 'therapistVerification'
  | 'complete';

interface EnhancedOnboardingScreenProps {
  onNext: () => void;
  onBack: () => void;
}

const EnhancedOnboardingScreen: React.FC<EnhancedOnboardingScreenProps> = ({ 
  onNext, 
  onBack 
}) => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('userType');
  const [userType, setUserTypeState] = useState<'patient' | 'therapist' | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      console.log('Current user loaded:', user);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const getStepsForUserType = (userType: 'patient' | 'therapist'): OnboardingStep[] => {
    if (userType === 'patient') {
      return ['userType', 'patientPersonalInfo', 'patientProfilePicture', 'patientBloodType', 'patientGoals', 'complete'];
    } else {
      return ['userType', 'therapistBasicInfo', 'therapistVerification', 'complete'];
    }
  };

  const getCurrentStepIndex = (): number => {
    const steps = userType ? getStepsForUserType(userType) : ['userType'];
    return steps.indexOf(currentStep);
  };

  const getTotalSteps = (): number => {
    const steps = userType ? getStepsForUserType(userType) : ['userType'];
    return steps.length - 1; // Exclude 'complete' step from total
  };

  const handleUserTypeSelect = async (selectedUserType: 'patient' | 'therapist') => {
    try {
      console.log('Setting user type:', selectedUserType);
      await setUserType(selectedUserType);
      setUserTypeState(selectedUserType);
      
      // Reload user data to get profile_id
      await loadCurrentUser();
      
      if (selectedUserType === 'patient') {
        setCurrentStep('patientPersonalInfo');
      } else {
        setCurrentStep('therapistBasicInfo');
      }
    } catch (error) {
      console.error('Error setting user type:', error);
    }
  };

  const handleBackNavigation = () => {
    switch (currentStep) {
      case 'patientPersonalInfo':
      case 'therapistBasicInfo':
        setCurrentStep('userType');
        break;
      case 'patientProfilePicture':
        setCurrentStep('patientPersonalInfo');
        break;
      case 'patientBloodType':
        setCurrentStep('patientProfilePicture');
        break;
      case 'patientGoals':
        setCurrentStep('patientBloodType');
        break;
      case 'therapistVerification':
        setCurrentStep('therapistBasicInfo');
        break;
      default:
        onBack();
        break;
    }
  };

  const renderCurrentScreen = () => {
    switch (currentStep) {
      case 'userType':
        return (
          <UserTypeSelection
            onSelect={handleUserTypeSelect}
            onBack={onBack}
          />
        );

      case 'patientPersonalInfo':
        return (
          <PatientPersonalInfo
            onNext={() => setCurrentStep('patientProfilePicture')}
            onBack={handleBackNavigation}
            currentUser={currentUser}
          />
        );

      case 'patientProfilePicture':
        return (
          <PatientProfilePicture
            onNext={() => setCurrentStep('patientBloodType')}
            onBack={handleBackNavigation}
            currentUser={currentUser}
          />
        );

      case 'patientBloodType':
        return (
          <PatientBloodType
            onNext={() => setCurrentStep('patientGoals')}
            onBack={handleBackNavigation}
            currentUser={currentUser}
          />
        );

      case 'patientGoals':
        return (
          <PatientWellnessGoals
            onNext={onNext}
            onBack={handleBackNavigation}
          />
        );

      case 'therapistBasicInfo':
        return (
          <TherapistBasicInfo
            onNext={() => setCurrentStep('therapistVerification')}
            onBack={handleBackNavigation}
            currentUser={currentUser}
          />
        );

      case 'therapistVerification':
        return (
          <TherapistVerificationCamera
            onNext={onNext}
            onBack={handleBackNavigation}
            currentUser={currentUser}
          />
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {currentStep !== 'userType' && (
        <OnboardingProgress 
          currentStep={getCurrentStepIndex()}
          totalSteps={getTotalSteps()}
        />
      )}
      <View style={styles.contentContainer}>
        {renderCurrentScreen()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E4F0F6',
  },
  contentContainer: {
    flex: 1,
  },
});

export default EnhancedOnboardingScreen;
