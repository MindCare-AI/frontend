import AsyncStorage from '@react-native-async-storage/async-storage';

// Key for storing onboarding status
const ONBOARDING_COMPLETE = 'onboarding_complete';

export const markOnboardingComplete = async () => {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE, 'true');
  } catch (error) {
    console.error("Error saving onboarding status", error);
  }
};

export const checkOnboardingStatus = async () => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE);
    return value === 'true';
  } catch (error) {
    console.error("Error checking onboarding status", error);
    return false;
  }
};

export const resetOnboardingStatus = async () => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETE);
  } catch (error) {
    console.error("Error resetting onboarding status", error);
  }
};