import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/Appointments/DashboardScreen';
import BookAppointmentScreen from '../screens/Appointments/BookAppointmentScreen';
import AppointmentDetailsScreen from '../screens/Appointments/AppointmentDetailsScreen';
import AppointmentHistoryScreen from '../screens/Appointments/AppointmentHistoryScreen';

export type AppointmentsStackParamList = {
  Dashboard: undefined;
  BookAppointment: undefined;
  AppointmentDetails: { appointmentId: number };
  AppointmentHistory: undefined;
};

const Stack = createNativeStackNavigator<AppointmentsStackParamList>();

const AppointmentsNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerStyle: { backgroundColor: '#E8F5F5' },
        headerTintColor: '#247676',
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: '#E8F5F5' },
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Therapy Appointments' }} />
      <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} options={{ title: 'Schedule New Session' }} />
      <Stack.Screen name="AppointmentDetails" component={AppointmentDetailsScreen} options={{ title: 'Appointment Details' }} />
      <Stack.Screen name="AppointmentHistory" component={AppointmentHistoryScreen} options={{ title: 'Appointment History' }} />
    </Stack.Navigator>
  );
};

export default AppointmentsNavigator;