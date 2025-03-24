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
  onNext?: () => void; // Added onNext property
}

const OnboardingScreen = () => {
  const [step, setStep] = useState(0);
  const [userType, setUserType] = useState<'patient' | 'therapist' | null>(null);
  const navigation = useNavigation<NavigationProp>();
  const { toast } = useToast();
  const { user, updateUserRole } = useAuth();
  const totalSteps = 4;

  useEffect(() => {
    checkUserRole();
  }, [user]);

  const checkUserRole = async () => {
    try {
      if (user?.role) {
        // User already has a role, skip onboarding
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
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
    if (!userType) return;

    try {
      await updateUserRole(userType);
      navigation.reset({
        index: 0,
        routes: [{ name: 'App' }],
      });
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