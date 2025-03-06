import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';

/**
 * Checks if the user has completed onboarding
 * @returns {Promise<boolean>} - True if onboarding has been completed
 */
export const isOnboardingComplete = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
    console.log('DEBUG - Onboarding value from storage:', value); // Debug log
    return value === 'true';
  } catch (error) {
    console.error('Failed to get onboarding status', error);
    return false; // Default to false if there's an error
  }
};

/**
 * Marks onboarding as complete
 */
export const markOnboardingComplete = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    console.log('Onboarding marked complete');
  } catch (error) {
    console.error('Failed to save onboarding status', error);
  }
};

/**
 * Resets onboarding status (for debugging or allowing users to redo onboarding)
 */
export const resetOnboardingStatus = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
    console.log('Onboarding status reset');
  } catch (error) {
    console.error('Failed to reset onboarding status', error);
  }
};