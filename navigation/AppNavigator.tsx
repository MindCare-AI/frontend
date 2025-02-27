import AsyncStorage from '@react-native-async-storage/async-storage';

// Key for storing onboarding status in AsyncStorage
const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';

/**
 * Checks if the user has completed onboarding
 * @returns Promise<boolean> - true if onboarding has been completed
 */
export const checkOnboardingStatus = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

/**
 * Marks onboarding as complete
 */
export const markOnboardingComplete = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
  } catch (error) {
    console.error('Error saving onboarding status:', error);
  }
};

/**
 * Resets onboarding status (for testing/debugging)
 */
export const resetOnboardingStatus = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
  } catch (error) {
    console.error('Error resetting onboarding status:', error);
  }
};