import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar, CalendarCheck, Plus } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { API_BASE_URL } from '../../config'; // Use API_BASE_URL instead of API_URL

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AppointmentManagement'>;

const AppointmentManagementScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  // Use your authenticated patient's unique id here
  const patientId = '2'; // Replace with actual patient ID
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (dateString: string) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        // Correct URL without the extra '/api/v1' prefix
        const response = await fetch(`${API_BASE_URL}/patient/profiles/${patientId}/appointments/`);
        const data = await response.json();
        setAppointments(data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppointments();
  }, [patientId]);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Appointments</Text>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate('BookAppointment')}
        >
          <Plus size={18} color="white" />
          <Text style={styles.bookButtonText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>

      {/* Appointments List */}
      <View style={styles.appointmentsContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : appointments.length > 0 ? (
          appointments.map((appointment) => (
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
