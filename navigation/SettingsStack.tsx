import { createStackNavigator } from '@react-navigation/stack';
import { HealthMetricsScreen } from '../screens/SettingsScreen/HealthMetricsScreen';
import { MedicalHistoryScreen } from '../screens/SettingsScreen/MedicalHistoryScreen';
import { UserSettingsScreen } from '../screens/SettingsScreen/UserSettingsScreen';
import { UserProfileScreen } from '../screens/SettingsScreen/UserProfileScreen';
import { UserPreferencesScreen } from '../screens/SettingsScreen/UserPreferencesScreen';
import ProfileScreen from '../screens/Settings/profilescreen';
import { SettingsStackParamList } from '../types/navigation';
import { globalStyles } from '../styles/global';

const Stack = createStackNavigator<SettingsStackParamList>();

export const SettingsStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="SettingsHome"
      screenOptions={{
        headerStyle: {
          backgroundColor: globalStyles.colors.primary,
          shadowColor: globalStyles.colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 2,
        },
        headerTintColor: globalStyles.colors.white,
        headerTitleStyle: {
          ...globalStyles.h3,
          color: globalStyles.colors.white,
        },
      }}
    >
      <Stack.Screen 
        name="SettingsHome" 
        component={ProfileScreen} 
        options={{ title: 'Settings' }} 
      />
      <Stack.Screen 
        name="UserSettings" 
        component={UserSettingsScreen} 
        options={{ title: 'Account Settings' }} 
      />
      <Stack.Screen 
        name="UserProfile" 
        component={UserProfileScreen} 
        options={{ title: 'Edit Profile' }} 
      />
      <Stack.Screen 
        name="UserPreferences" 
        component={UserPreferencesScreen} 
        options={{ title: 'Preferences' }} 
      />
      <Stack.Screen 
        name="HealthMetrics" 
        component={HealthMetricsScreen} 
        options={{ title: 'Health Metrics' }} 
      />
      <Stack.Screen 
        name="MedicalHistory" 
        component={MedicalHistoryScreen} 
        options={{ title: 'Medical History' }} 
      />
    </Stack.Navigator>
  );
};