import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useNavigation } from '@react-navigation/native';

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
  onBack?: () => void; // Make onBack optional since we won't use it after welcome
}

const EnhancedOnboardingScreen: React.FC<EnhancedOnboardingScreenProps> = ({ 
  onNext, 
  onBack 
}) => {
  const { accessToken, updateUserRole } = useAuth();
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
      console.log('Current access token:', accessToken ? 'Available' : 'Not available');
      
      // Use the updateUserRole from AuthContext which already handles the API call
      await updateUserRole(selectedUserType);
      
      console.log('User role updated successfully');
      
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
      // Handle error appropriately - maybe show an alert
    }
  };

  const handleBackNavigation = () => {
    switch (currentStep) {
      case 'userType':
        return;
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
        return;
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('onboarding_completed', 'true');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'App' as never }],
        })
      );
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Fallback to onNext
      onNext();
    }
  };

  const renderCurrentScreen = () => {
    switch (currentStep) {
      case 'userType':
        return (
          <UserTypeSelection
            onSelect={handleUserTypeSelect}
            onBack={() => {}} // Provide empty function to disable back
          />
        );

      case 'patientPersonalInfo':
        return (
          <PatientPersonalInfo
            onNext={() => setCurrentStep('patientProfilePicture')}
            onBack={() => {}} // Or remove this line entirely
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
            onNext={handleComplete} // Change this to handleComplete
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
