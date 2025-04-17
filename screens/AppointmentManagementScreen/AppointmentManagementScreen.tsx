import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Calendar, CalendarCheck, Plus } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = {
  params?: {
    therapistId?: number;
  };
};

type Appointment = {
  id: number;
  patient: {
    id: number;
    first_name: string;
    last_name: string;
    user_name: string;
  };
  therapist: {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    full_name?: string;
  };
  appointment_date: string;
  status: string;
  notes: string | null;
  duration: number;
};

const AppointmentManagementScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { params } = route as RouteProps;
  const { accessToken } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        let url = `${API_URL}/therapist/appointments/`;
        if (params?.therapistId) {
          url = `${API_URL}/therapist/profiles/${params.therapistId}/appointments/`;
        }
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }

        const data = await response.json();
        // Support both paginated and non-paginated responses
        setAppointments(data.results || data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchAppointments();
    }
  }, [accessToken, params?.therapistId]);

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
      {loading ? (
        <Text>Loading...</Text>
      ) : appointments.length > 0 ? (
        appointments.map((appointment) => (
          <View key={appointment.id} style={styles.card}>
            <View style={styles.cardContent}>
              <View>
                <Text style={styles.therapistName}>
                  {appointment.therapist?.full_name ||
                    `${appointment.therapist?.first_name || ''} ${appointment.therapist?.last_name || ''}`.trim()}
                </Text>
                <View style={styles.infoRow}>
                  <Calendar size={16} color="#666" />
                  <Text style={styles.infoText}>
                    {new Date(appointment.appointment_date).toLocaleString()}
                  </Text>
                </View>
                {appointment.notes ? (
                  <Text style={styles.infoText}>Notes: {appointment.notes}</Text>
                ) : null}
              </View>
              <View
                style={[
                  styles.statusBadge,
                  appointment.status === 'scheduled' || appointment.status === 'pending'
                    ? styles.upcomingBadge
                    : styles.completedBadge,
                ]}
              >
                <Text style={styles.statusText}>{appointment.status}</Text>
              </View>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <CalendarCheck size={48} color="#CCC" />
          <Text style={styles.emptyStateTitle}>No appointments yet</Text>
          <Text style={styles.emptyStateText}>
            {params?.therapistId
              ? "Schedule your first appointment with this therapist"
              : "Book your first appointment to get started"}
          </Text>
        </View>
      )}
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
