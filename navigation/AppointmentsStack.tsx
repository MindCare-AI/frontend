import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Appointments from '../screens/Appointments/Appointments';
import TherapistDashboard from '../screens/Appointments/therapist/dashboard-therapist';
import PatientDashboard from '../screens/Appointments/patient/dashboard-patient';
import AppointmentConfirmation from '../screens/Appointments/patient/appointment-confirmation';
import BookAppointment from '../screens/Appointments/patient/book-appointment';
import TherapistAvailability from '../screens/Appointments/therapist/availability';
import WaitingList from '../screens/Appointments/therapist/waiting-list';

export type AppointmentsStackParamList = {
  Appointments: undefined;
  TherapistDashboard: undefined;
  PatientDashboard: undefined;
  AppointmentConfirmation: undefined;
  BookAppointment: undefined;
  TherapistAvailability: undefined;
  WaitingList: undefined;
};

const Stack = createStackNavigator<AppointmentsStackParamList>();

export default function AppointmentsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Appointments" component={Appointments} />
      <Stack.Screen name="TherapistDashboard" component={TherapistDashboard} />
      <Stack.Screen name="PatientDashboard" component={PatientDashboard} />
      <Stack.Screen name="AppointmentConfirmation" component={AppointmentConfirmation} />
      <Stack.Screen name="BookAppointment" component={BookAppointment} />
      <Stack.Screen name="TherapistAvailability" component={TherapistAvailability} />
      <Stack.Screen name="WaitingList" component={WaitingList} />
    </Stack.Navigator>
  );
}