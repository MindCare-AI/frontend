import { createStackNavigator } from '@react-navigation/stack';
import HomeSettingsScreen from '../screens/Settings/HomeSettingsScreen';
import PatientMedicalInfoScreen from '../screens/Settings/PatientMedicalInfoScreen';
import TherapistProfileScreen from '../screens/Settings/TherapistProfileScreen';
import NotificationSettingsScreen from '../screens/Settings/NotificationSettingsScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import { SettingsStackParamList } from '../types/navigation';
import { globalStyles } from '../styles/global';
import TherapistAvailabilityScreen from '../screens/Settings/TherapistAvailablityScreen';
import PatientProfileScreen from '../screens/Settings/PatientProfileScreen';

const Stack = createStackNavigator<SettingsStackParamList>();

export const SettingsStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Settings"
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
        name="Settings" 
        component={HomeSettingsScreen} 
        options={{ title: 'Settings' }} 
      />
      <Stack.Screen 
        name="AppSettings" 
        component={SettingsScreen} 
        options={{ title: 'App Settings' }} 
      />
      <Stack.Screen 
        name="TherapistProfile" 
        component={TherapistProfileScreen} 
        options={{ title: 'TherapistProfile' }} 
      />
      <Stack.Screen 
        name="PatientProfile" 
        component={PatientProfileScreen} 
        options={{ title: 'PatientProfile' }} 
      />
      <Stack.Screen 
        name="NotificationSettings" 
        component={NotificationSettingsScreen} 
        options={{ title: 'Notifications' }} 
      />
      <Stack.Screen 
        name="PatientMedicalInfo" 
        component={PatientMedicalInfoScreen} 
        options={{ title: 'Medical Information' }} 
      />
      <Stack.Screen 
        name="Availability" 
        component={TherapistAvailabilityScreen} 
        options={{ title: 'Availability' }} 
      />
    </Stack.Navigator>
  );
};