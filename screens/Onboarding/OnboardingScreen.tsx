import React, { useState, useRef  } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';

// Import all onboarding components
import WelcomeSlideScreen from './WelcomeSlideScreen';
import EnhancedOnboardingScreen from './EnhancedOnboardingScreen';
import UserTypeSelection from '../../components/Onboarding/UserTypeSelection';
import PatientBasicInfo from '../../components/Onboarding/PatientBasicInfo';
import PatientWellnessGoals from '../../components/Onboarding/PatientWellnessGoals';
import PatientMedicalInfo from '../../components/Onboarding/PatientMedicalInfo';
import PatientEmergencyContact from '../../components/Onboarding/PatientEmergencyContact';
import TherapistVerificationIntro from '../../components/Onboarding/TherapistVerificationIntro';
import TherapistBasicInfo from '../../components/Onboarding/TherapistBasicInfo';
import TherapistCredentials from '../../components/Onboarding/TherapistCredentials';
import OnboardingProgress from '../../components/Onboarding/OnboardingProgress';
import PatientProfilePicture from '../../components/Onboarding/PatientProfilePicture';
import OnboardingLoadingScreen from '../../components/Onboarding/OnboardingLoadingScreen';
import OnboardingLayout from '../../components/Onboarding/OnboardingLayout';
import TherapistProfessionalCard from '../../components/Onboarding/TherapistProfessionalCard';

const { width } = Dimensions.get('window');

type OnboardingStep = 
  | 'welcome'
  | 'enhanced'
  | 'userType'
  | 'patientBasic'
  | 'patientProfilePicture'
  | 'patientMedicalInfo'
  | 'patientEmergencyContact'
  | 'patientGoals'
  | 'therapistVerification'
  | 'therapistBasic'
  | 'therapistCredentials'
  | 'loading'
  | 'complete';

interface OnboardingData {
  userType?: 'patient' | 'therapist';
  patientData?: any;
  therapistData?: any;
}

const markOnboardingComplete = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem('onboarding_completed', 'true');
  } catch (error) {
    console.error('Error marking onboarding complete:', error);
    throw error;
  }
};

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();
  const { updateUserRole } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const slideAnim = useRef(new Animated.Value(0)).current;

  const getStepsForUserType = (userType: 'patient'|'therapist'): OnboardingStep[] => {
    if (userType === 'patient') {
      return ['welcome','userType','loading','patientBasic','patientProfilePicture','patientMedicalInfo','patientEmergencyContact','patientGoals','complete'];
    } else {
      return [
        'welcome','userType','loading',
        'therapistVerification', 
        'therapistProfessionalCard',   // ← NEW
        'therapistBasic','therapistCredentials','complete'
      ];
    }
  };

  const getCurrentStepIndex = (): number => {
    const steps = onboardingData.userType 
      ? getStepsForUserType(onboardingData.userType)
      : ['welcome', 'userType'];
    return steps.indexOf(currentStep);
  };

  const getTotalSteps = (): number => {
    const steps = onboardingData.userType 
      ? getStepsForUserType(onboardingData.userType)
      : ['welcome', 'userType'];
    return steps.length;
  };

  const animateToNext = () => {
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      slideAnim.setValue(0);
    });
  };

  const animateToBack = () => {
    Animated.timing(slideAnim, {
      toValue: width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      slideAnim.setValue(0);
    });
  };

  const handleUserTypeSelect = async (selectedUserType: 'patient' | 'therapist') => {
    try {
      console.log('Setting user type:', selectedUserType);
      
      // Update user role for both patient and therapist users
      // In fake mode, we'll just simulate this
      // await updateUserRole(selectedUserType);
      console.log(`User role updated successfully to: ${selectedUserType}`);
      
      // Update local state
      setOnboardingData(prev => ({ ...prev, userType: selectedUserType }));
      
      // Navigate to loading screen first
      animateToNext();
      setCurrentStep('loading');
      
      // The actual navigation to the next step after loading will happen
      // in the loading screen's completion handler
      console.log('Moving to loading screen after selecting user type:', selectedUserType);
    } catch (error) {
      console.error('Error setting user type:', error);
      // Handle error appropriately - maybe show an alert
    }
  };
  
  // Handler for when loading is complete
  const handleLoadingComplete = () => {
    // After loading is done, navigate to the appropriate next screen immediately
    console.log('Loading complete, moving to next screen for user type:', onboardingData.userType);
    
    if (onboardingData.userType === 'patient') {
      console.log('Navigating to patientBasic');
      setCurrentStep('patientBasic');
    } else {
      console.log('Navigating to therapistVerification');
      setCurrentStep('therapistVerification');
    }
    
    // Force a refresh of the current step
    animateToNext();
  };

  const handleNext = async (stepData?: any) => {
    animateToNext();

    switch (currentStep) {
      case 'welcome':
        setCurrentStep('userType');
        break;
      case 'userType':
        // This case is now handled by handleUserTypeSelect
        if (stepData?.userType) {
          await handleUserTypeSelect(stepData.userType);
        }
        break;
      case 'patientBasic':
        setOnboardingData(prev => ({ 
          ...prev, 
          patientData: { ...prev.patientData, ...stepData }
        }));
        setCurrentStep('patientProfilePicture');
        break;
      case 'patientProfilePicture':
        setOnboardingData(prev => ({
          ...prev,
          patientData: { ...prev.patientData, profilePic: stepData }
        }));
        setCurrentStep('patientMedicalInfo');
        break;
      case 'patientMedicalInfo':
        setOnboardingData(prev => ({
          ...prev,
          patientData: { ...prev.patientData, medicalInfo: stepData }
        }));
        setCurrentStep('patientEmergencyContact');
        break;
      case 'patientEmergencyContact':
        setOnboardingData(prev => ({
          ...prev,
          patientData: { ...prev.patientData, emergencyContact: stepData }
        }));
        setCurrentStep('patientGoals');
        break;
      case 'patientGoals':
        setOnboardingData(prev => ({ 
          ...prev, 
          patientData: { ...prev.patientData, ...stepData }
        }));
        await handleComplete();
        break;
      case 'therapistVerification':
        setCurrentStep('therapistBasic');
        break;
      case 'therapistBasic':
        setOnboardingData(prev => ({ 
          ...prev, 
          therapistData: { ...prev.therapistData, ...stepData }
        }));
        setCurrentStep('therapistCredentials');
        break;
      case 'therapistCredentials':
        setOnboardingData(prev => ({ 
          ...prev, 
          therapistData: { ...prev.therapistData, credentials: stepData }
        }));
        await handleComplete();
        break;
      default:
        break;
    }
  };

  const handleBack = () => {
    animateToBack();

    switch (currentStep) {
      case 'userType':
        setCurrentStep('welcome');
        break;
      case 'loading':
        setCurrentStep('userType');
        break;
      case 'patientBasic':
        setCurrentStep('loading');
        break;
      case 'patientProfilePicture':
        setCurrentStep('patientBasic');
        break;
      case 'patientMedicalInfo':
        setCurrentStep('patientProfilePicture');
        break;
      case 'patientEmergencyContact':
        setCurrentStep('patientMedicalInfo');
        break;
      case 'patientGoals':
        setCurrentStep('patientEmergencyContact');
        break;
      case 'therapistVerification':
        setCurrentStep('loading');
        break;
      case 'therapistBasic':
        setCurrentStep('therapistVerification');
        break;
      case 'therapistCredentials':
        setCurrentStep('therapistBasic');
        break;
      default:
        break;
    }
  };

  // Add skip handler for therapist verification
  const handleSkipVerification = () => {
    animateToNext();
    setCurrentStep('therapistBasic');
  };

  const handleComplete = async () => {
    try {
      await markOnboardingComplete();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'App' as never }], // Changed from 'MainApp' to 'App'
        })
      );
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const renderCurrentStep = () => {
    const animatedStyle = {
      transform: [{ translateX: slideAnim }],
    };

    switch (currentStep) {
      case 'welcome':
        return (
          <Animated.View style={[styles.stepContainer, animatedStyle]}>
            <WelcomeSlideScreen onNext={handleNext} />
          </Animated.View>
        );

      case 'userType':
        return (
          <Animated.View style={[styles.stepContainer, animatedStyle]}>
            <UserTypeSelection 
              onSelect={handleUserTypeSelect}
              onBack={handleBack}
            />
          </Animated.View>
        );
        
      case 'loading':
        return (
          <Animated.View style={[styles.stepContainer, animatedStyle]}>
            <OnboardingLoadingScreen 
              userType={onboardingData.userType as 'patient' | 'therapist'} 
              onLoadingComplete={handleLoadingComplete}
              duration={3000} // 3 seconds as requested
            />
          </Animated.View>
        );

      case 'patientBasic':
        return (
          <Animated.View style={[styles.stepContainer, animatedStyle]}>
            <PatientBasicInfo 
              onNext={handleNext}
              onBack={handleBack}
            />
          </Animated.View>
        );

      case 'patientProfilePicture':
        return (
          <Animated.View style={[styles.stepContainer, animatedStyle]}>
            <PatientProfilePicture 
              onNext={handleNext}
              onBack={handleBack}
            />
          </Animated.View>
        );
        
      case 'patientMedicalInfo':
        return (
          <Animated.View style={[styles.stepContainer, animatedStyle]}>
            <PatientMedicalInfo 
              onNext={handleNext}
              onBack={handleBack}
              onSkip={() => {
                animateToNext();
                setCurrentStep('patientEmergencyContact');
              }}
            />
          </Animated.View>
        );
        
      case 'patientEmergencyContact':
        return (
          <Animated.View style={[styles.stepContainer, animatedStyle]}>
            <PatientEmergencyContact 
              onNext={handleNext}
              onBack={handleBack}
              onSkip={() => {
                animateToNext();
                setCurrentStep('patientGoals');
              }}
            />
          </Animated.View>
        );

      case 'patientGoals':
        return (
          <Animated.View style={[styles.stepContainer, animatedStyle]}>
            <PatientWellnessGoals 
              onNext={handleNext}
              onBack={handleBack}
            />
          </Animated.View>
        );

      case 'therapistVerification':
        return (
          <Animated.View style={[styles.stepContainer, animatedStyle]}>
            <TherapistVerificationIntro 
              onNext={handleNext}
              onBack={handleBack}
              onSkip={handleSkipVerification}
            />
          </Animated.View>
        );

      case 'therapistProfessionalCard':
        return (
          <Animated.View style={[styles.stepContainer, animatedStyle]}>
            <TherapistProfessionalCard
              onNext={handleNext}
              onBack={handleBack}
            />
          </Animated.View>
        );

      case 'therapistBasic':
        return (
          <Animated.View style={[styles.stepContainer, animatedStyle]}>
            <TherapistBasicInfo 
              onNext={handleNext}
              onBack={handleBack}
              currentUser={onboardingData?.therapistData}
            />
          </Animated.View>
        );
        
      case 'therapistCredentials':
        return (
          <Animated.View style={[styles.stepContainer, animatedStyle]}>
            <TherapistCredentials 
              onNext={handleNext}
              onBack={handleBack}
              currentUser={onboardingData?.therapistData}
            />
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingProgress 
        currentStep={getCurrentStepIndex()}
        totalSteps={getTotalSteps()}
      />
      <View style={styles.contentContainer}>
        <OnboardingLayout
          totalSteps={getTotalSteps()}
          currentStep={getCurrentStepIndex()}
          onBack={handleBack}
          onNext={() => handleNext()}
        >
          {renderCurrentStep()}
        </OnboardingLayout>
      </View>
    </SafeAreaView>
  );
};

// Update the styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E4F0F6',
  },
  contentContainer: {
    flex: 1,
    overflow: 'visible',
  },
  stepContainer: {
    flex: 1,
    width: width,
    overflow: 'visible',
  },

});
export default OnboardingScreen;