import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Brain, HandHeart, MessageSquare } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/ToastContext';
import UserTypeSelection from '../../components/UserTypeSelection';
import OnboardingSlide from '../../components/OnboardingSlide';
import OnboardingLayout from '../../components/OnboardingLayout';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export interface OnboardingSlideProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
  onNext?: () => void;
}

const OnboardingScreen = () => {
  const [step, setStep] = useState(0);
  const [userType, setUserType] = useState<'patient' | 'therapist' | null>(null);
  const navigation = useNavigation<NavigationProp>();
  const { toast } = useToast();
  const { user, isLoading, updateUserRole } = useAuth(); // include isLoading
  const totalSteps = 4;

  useEffect(() => {
    if (!isLoading) {
      console.log('Initial check - Auth loading complete');
      checkUserRole();
    }
  }, [isLoading]); // Only depends on loading state, not user

  // Update the effect that handles user_type changes
  useEffect(() => {
    // Only run this effect if we have a user and we're not loading
    if (!isLoading && user) {
      console.log('User_type changed effect - current user_type:', user?.user_type);
      
      // Check if user_type has a non-empty value using safe type checking
      const hasValidUserType = Boolean(user.user_type) && user.user_type !== '';
      
      if (hasValidUserType) {
        console.log('User already has a type, navigating to App:', user.user_type);
        navigation.reset({
          index: 0,
          routes: [{ name: 'App' }],
        });
      }
    }
  }, [user?.user_type, isLoading, navigation]); // Added navigation to dependencies

  // Update the checkUserRole function with safer type handling
  const checkUserRole = async () => {
    try {
      console.log('Checking user role - current user:', user);
      
      // Use Boolean to convert to a boolean value first, then check if it's not empty
      const hasValidUserType = Boolean(user?.user_type) && user?.user_type !== '';
      
      if (hasValidUserType && user) {
        console.log('User has a role, skipping onboarding:', user.user_type);
        navigation.reset({
          index: 0,
          routes: [{ name: 'App' }],
        });
      } else {
        console.log('User needs onboarding, current user_type:', user?.user_type || 'undefined');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to check user role',
        variant: 'destructive',
      });
    }
  };

  const handleComplete = async () => {
    if (!userType) {
      console.error('No user type selected');
      toast({
        title: 'Error',
        description: 'Please select your role to continue',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('Completing onboarding, setting user type to:', userType);
      
      // Update role in backend
      await updateUserRole(userType);
      
      // Force a small delay to ensure backend sync completes
      setTimeout(() => {
        console.log('Navigating to App after role update');
        navigation.reset({
          index: 0,
          routes: [{ name: 'App' }],
        });
      }, 300);
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete onboarding. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUserTypeSelect = (type: 'patient' | 'therapist') => {
    setUserType(type);
    handleNext();
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <OnboardingLayout
      totalSteps={totalSteps}
      currentStep={step}
      onBack={step > 0 ? handleBack : undefined}
      showProgress={true}
    >
      {step === 0 && (
        <OnboardingSlide
          title="Welcome to MindCare AI"
          description="Your digital companion for mental wellness and therapy management"
          icon={<Brain size={40} color="black" />}
          isActive={true}
          onNext={handleNext}
        />
      )}

      {step === 1 && (
        <OnboardingSlide
          title="Personalized Support"
          description="Access tools tailored to your unique needs and goals"
          icon={<HandHeart size={40} color="black" />}
          isActive={true}
          onNext={handleNext}
        />
      )}

      {step === 2 && (
        <OnboardingSlide
          title="Stay Connected"
          description="Communication tools that bridge the gap between sessions"
          icon={<MessageSquare size={40} color="black" />}
          isActive={true}
          onNext={handleNext}
        />
      )}

      {step === 3 && (
        <OnboardingSlide
          title="Who Are You?"
          description="Select your role to personalize your experience"
          isActive={true}
        >
          <UserTypeSelection onSelect={handleUserTypeSelect} />
        </OnboardingSlide>
      )}
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default OnboardingScreen;