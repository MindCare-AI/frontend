import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Brain, HandHeart, MessageSquare } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/ToastContext';
import UserTypeSelection from '../../components/Onboarding/UserTypeSelection';
import OnboardingSlide from '../../components/Onboarding/OnboardingSlide';
import OnboardingLayout from '../../components/Onboarding/OnboardingLayout';
import axios from 'axios';
import { API_URL } from '../../config';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import PatientProfileForm from '../../components/Onboarding/PatientProfileForm'
import TherapistProfileForm from '../../components/Onboarding/TherapistProfileForm'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export interface OnboardingSlideProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  isActive: boolean;
  onNext?: () => void;
  children?: React.ReactNode;
}

const OnboardingScreen = () => {
  const [step, setStep] = useState(0);
  const [userType, setUserType] = useState<'patient' | 'therapist' | null>(null);
  const navigation = useNavigation<NavigationProp>();
  const { toast } = useToast();
  const { user, accessToken, isLoading, fetchUserData } = useAuth();
  const totalSteps = userType === 'patient' || userType === 'therapist' ? 5 : 4;

  useEffect(() => {
    if (!isLoading) {
      checkUserRole();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && user) {
      if (typeof user.user_type === 'string' && user.user_type !== '') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'App' }],
        });
      }
    }
  }, [user?.user_type, isLoading, navigation]);

  const checkUserRole = async () => {
    try {
      if (user && typeof user.user_type === 'string' && user.user_type !== '') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'App' }],
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check user role',
        variant: 'destructive',
      });
    }
  };

  const setUserTypeInBackend = async (selectedType: 'patient' | 'therapist') => {
    if (!accessToken) return;
    try {
      const payload = { user_type: selectedType };
      await axios.post(
        `${API_URL}/users/set-user-type/`, 
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      await fetchUserData();
      return true;
    } catch (error) {
      throw error;
    }
  };

  const createPatientProfile = async (data: any) => {
    if (!accessToken) return;
    try {
      await axios.post(
        `${API_URL}/patient/profiles/`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      await fetchUserData();
      navigation.reset({
        index: 0,
        routes: [{ name: 'App' }],
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create patient profile',
        variant: 'destructive',
      });
    }
  };

  const createTherapistProfile = async (data: any) => {
    if (!accessToken) return;
    try {
      await axios.post(
        `${API_URL}/therapist/profiles/`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      await fetchUserData();
      navigation.reset({
        index: 0,
        routes: [{ name: 'App' }],
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create therapist profile',
        variant: 'destructive',
      });
    }
  };

  const handleComplete = async () => {
    if (!userType) {
      toast({
        title: 'Error',
        description: 'Please select your role to continue',
        variant: 'destructive',
      });
      return;
    }
    try {
      await setUserTypeInBackend(userType);
      setStep(4); // Move to profile setup step
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete onboarding. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUserTypeSelect = (type: 'patient' | 'therapist') => {
    setUserType(type);
    setTimeout(() => {
      if (step < 3) {
        setStep(step + 1);
      } else {
        handleComplete();
      }
    }, 100);
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  // Patient profile form submit
  const handlePatientProfileSubmit = async (data: any) => {
    await createPatientProfile(data);
  };

  // Therapist profile form submit (skip verification for now)
  const handleTherapistProfileSubmit = async (data: any) => {
    await createTherapistProfile({ ...data, verification_status: 'pending' });
  };

  // Skip profile setup
  const handleSkipProfile = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'App' }],
    });
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

      {step === 4 && userType === 'patient' && (
        <OnboardingSlide
          title="Set Up Your Patient Profile"
          description="Complete your profile to get the best experience. You can skip this step if you want."
          isActive={true}
        >
          <PatientProfileForm
            onSubmit={handlePatientProfileSubmit}
            onSkip={handleSkipProfile}
          />
        </OnboardingSlide>
      )}

      {step === 4 && userType === 'therapist' && (
        <OnboardingSlide
          title="Set Up Your Therapist Profile"
          description="Complete your profile to connect with patients. You can skip this step or verification for now."
          isActive={true}
        >
          <TherapistProfileForm
            onSubmit={handleTherapistProfileSubmit}
            onSkip={handleSkipProfile}
            allowSkipVerification={true}
          />
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