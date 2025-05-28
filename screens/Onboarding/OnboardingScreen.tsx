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
import TherapistVerificationIntro from '../../components/Onboarding/TherapistVerificationIntro';
import OnboardingProgress from '../../components/Onboarding/OnboardingProgress';
import PatientProfilePicture from '../../components/Onboarding/PatientProfilePicture';

const { width } = Dimensions.get('window');

type OnboardingStep = 
  | 'welcome'
  | 'enhanced'
  | 'userType'
  | 'patientBasic'
  | 'patientProfilePicture'
  | 'patientGoals'
  | 'therapistVerification'
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

  const getStepsForUserType = (userType: 'patient' | 'therapist'): OnboardingStep[] => {
    if (userType === 'patient') {
      return ['welcome', 'userType', 'patientBasic', 'patientProfilePicture', 'patientGoals', 'complete'];
    } else {
      return ['welcome', 'userType', 'therapistVerification', 'complete'];
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
      
      // Uncommented the API call
      await updateUserRole(selectedUserType);
      
      console.log('User role updated successfully');
      
      // Update local state
      setOnboardingData(prev => ({ ...prev, userType: selectedUserType }));
      
      // Navigate to next step
      animateToNext();
      if (selectedUserType === 'patient') {
        setCurrentStep('patientBasic');
      } else {
        setCurrentStep('therapistVerification');
      }
    } catch (error) {
      console.error('Error setting user type:', error);
      // Handle error appropriately - maybe show an alert
    }
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
      case 'patientBasic':
        setCurrentStep('userType');
        break;
      case 'patientProfilePicture':
        setCurrentStep('patientBasic');
        break;
      case 'patientGoals':
        setCurrentStep('patientProfilePicture');
        break;
      case 'therapistVerification':
        setCurrentStep('userType');
        break;
      default:
        break;
    }
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

      case 'enhanced':
        return (
          <Animated.View style={[styles.stepContainer, animatedStyle]}>
            <EnhancedOnboardingScreen onNext={handleNext} onBack={handleBack} />
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

      case 'patientBasic':
        return (
          <Animated.View style={[styles.stepContainer, animatedStyle]}>
            <PatientBasicInfo 
              onNext={handleNext}
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
              onNext={handleComplete}
              onBack={handleBack}
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
        {renderCurrentStep()}
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
  stepContainer: {
    flex: 1,
  },
});

export default OnboardingScreen;