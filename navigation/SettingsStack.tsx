import { createStackNavigator } from '@react-navigation/stack';
import { HealthMetricsScreen } from '../screens/SettingsScreen/HealthMetricsScreen';
import { MedicalHistoryScreen } from '../screens/SettingsScreen/MedicalHistoryScreen';
import { SettingsStackParamList } from '../types/navigation'; // Add this import

const Stack = createStackNavigator<SettingsStackParamList>();

export const SettingsStack = () => {
  return (
    <Stack.Navigator>
      {/* ...existing screens... */}
      <Stack.Screen name="HealthMetrics" component={HealthMetricsScreen} />
      <Stack.Screen name="MedicalHistory" component={MedicalHistoryScreen} />
    </Stack.Navigator>
  );
};