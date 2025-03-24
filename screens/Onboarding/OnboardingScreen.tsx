import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Brain, HandHeart, MessageSquare } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/ToastContext';
import UserTypeSelection from '../../components/UserTypeSelection';
import OnboardingSlide from '../../components/OnboardingSlide';
import OnboardingLayout from '../../components/OnboardingLayout';
import axios from 'axios';
import { API_URL } from '../../config';
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
  const { user, accessToken, isLoading, fetchUserData } = useAuth();
  const totalSteps = 4;

  useEffect(() => {
    if (!isLoading) {
      console.log('Initial check - Auth loading complete');
      checkUserRole();
    }
  }, [isLoading]);

  // Monitor user_type changes to handle navigation
  useEffect(() => {
    if (!isLoading && user) {
      console.log('User_type changed effect - current user_type:', user?.user_type);
      
      // Using typeof to avoid TypeScript errors
      if (typeof user.user_type === 'string' && user.user_type !== '') {
        console.log('User already has a type, navigating to App:', user.user_type);
        navigation.reset({
          index: 0,
          routes: [{ name: 'App' }],
        });
      }
    }
  }, [user?.user_type, isLoading, navigation]);

  const checkUserRole = async () => {
    try {
      console.log('Checking user role - current user:', user);
      
      // Using typeof for better type safety
      if (user && typeof user.user_type === 'string' && user.user_type !== '') {
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

  // Direct API call to set user type without modifying auth context
  const setUserTypeInBackend = async (selectedType: 'patient' | 'therapist') => {
    if (!accessToken) {
      console.error('No access token available');
      return;
    }

    try {
      // Make sure this matches your API's expected payload structure
      const payload = { user_type: selectedType };
      
      console.log('Setting user type in backend:', selectedType);
      const response = await axios.post(
        `${API_URL}/users/set-user-type/`, 
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      console.log('User type set successfully, response:', response.status);
      
      // Refresh user data to get updated user_type
      await fetchUserData();
      
      return true;
    } catch (error) {
      console.error('Error setting user type:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status: number, data: any } };
        console.error('API error details:', axiosError.response?.data);
      }
      throw error;
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
      
      // Set user type directly via API
      await setUserTypeInBackend(userType);
      
      // The navigation will be handled by the useEffect that watches user.user_type
      // after fetchUserData() updates the user state
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete onboarding. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Fix the handleUserTypeSelect function
  const handleUserTypeSelect = (type: 'patient' | 'therapist') => {
    // Set the user type first
    setUserType(type);
    console.log('User type selected:', type);
    
    // Then move to the next step (or complete if it's the last step)
    setTimeout(() => {
      if (step < totalSteps - 1) {
        setStep(step + 1);
      } else {
        // Directly use the selected type instead of relying on state
        handleCompleteWithType(type);
      }
    }, 100); // Small timeout to ensure state updates
  };

  // Add this helper function to use the type directly
  const handleCompleteWithType = async (selectedType: 'patient' | 'therapist') => {
    try {
      console.log('Completing onboarding with type:', selectedType);
      
      // Set user type directly via API using the passed-in type
      await setUserTypeInBackend(selectedType);
      
      // Optional: Force navigation if the useEffect doesn't trigger fast enough
      setTimeout(() => {
        console.log('Forcing navigation to App screen after role update');
        navigation.reset({
          index: 0,
          routes: [{ name: 'App' }],
        });
      }, 500);
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete onboarding. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Update the handleNext function to handle the final step differently
  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else if (userType) {
      // Only call handleComplete if userType is set
      handleComplete();
    } else {
      // Show an error if we're on the last step but no user type is selected
      toast({
        title: 'Error',
        description: 'Please select your role to continue',
        variant: 'destructive',
      });
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