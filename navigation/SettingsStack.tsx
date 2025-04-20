import { createStackNavigator } from '@react-navigation/stack';
import { HealthMetricsScreen } from '../screens/SettingsScreen/HealthMetricsScreen';
import { MedicalHistoryScreen } from '../screens/SettingsScreen/MedicalHistoryScreen';
import { SettingsStackParamList } from '../types/navigation';
import { globalStyles } from '../styles/global';

const Stack = createStackNavigator<SettingsStackParamList>();

export const SettingsStack = () => {
  return (
    <Stack.Navigator
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
        headerTitleStyle: { ...globalStyles.bodyBold },
      }}
    >
      <Stack.Screen name="HealthMetrics" component={HealthMetricsScreen} options={{ title: 'Health Metrics' }} />
      <Stack.Screen name="MedicalHistory" component={MedicalHistoryScreen} options={{ title: 'Medical History' }} />
    </Stack.Navigator>
  );
};