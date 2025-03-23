import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar, CalendarCheck, Plus } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AppointmentManagement'>;

// Mock data for appointments
const APPOINTMENTS = [
  {
    id: 'a1',
    therapist: 'Dr. Sarah Johnson',
    date: '2023-06-15',
    time: '10:00',
    status: 'upcoming',
  },
  {
    id: 'a2',
    therapist: 'Dr. Michael Chen',
    date: '2023-06-22',
    time: '14:00',
    status: 'upcoming',
  },
  {
    id: 'a3',
    therapist: 'Dr. Lisa Patel',
    date: '2023-05-30',
    time: '11:00',
    status: 'completed',
  },
];

const AppointmentManagementScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const formatDate = (dateString: string) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Appointments</Text>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate('BookAppointment')} // Replace with the correct screen name
        >
          <Plus size={18} color="white" />
          <Text style={styles.bookButtonText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>

      {/* Appointments List */}
      <View style={styles.appointmentsContainer}>
        {APPOINTMENTS.length > 0 ? (
          APPOINTMENTS.map((appointment) => (
            <View key={appointment.id} style={styles.card}>
              <View style={styles.cardContent}>
                <View>
                  <Text style={styles.therapistName}>{appointment.therapist}</Text>
                  <View style={styles.infoRow}>
                    <Calendar size={16} color="#666" />
                    <Text style={styles.infoText}>{formatDate(appointment.date)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Calendar size={16} color="#666" />
                    <Text style={styles.infoText}>{appointment.time}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    appointment.status === 'upcoming' ? styles.upcomingBadge : styles.completedBadge,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {appointment.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <CalendarCheck size={48} color="#CCC" />
            <Text style={styles.emptyStateTitle}>No appointments yet</Text>
            <Text style={styles.emptyStateText}>Book your first appointment to get started</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  bookButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  appointmentsContainer: {
    marginTop: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  therapistName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    marginLeft: 8,
    color: '#666',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  upcomingBadge: {
    backgroundColor: '#E0F7FA',
  },
  completedBadge: {
    backgroundColor: '#E8F5E9',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#00796B',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default AppointmentManagementScreen;
