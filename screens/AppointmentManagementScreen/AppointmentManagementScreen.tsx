import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Calendar, CalendarCheck, Plus } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import { globalStyles } from '../../styles/global';
import { format } from 'date-fns';
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

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView style={{
      flex: 1,
      backgroundColor: globalStyles.colors.white,
      paddingHorizontal: globalStyles.spacing.md,
      paddingTop: globalStyles.spacing.lg,
    }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: globalStyles.spacing.md,
      }}>
        <Text style={{
          ...globalStyles.title2,
          color: globalStyles.colors.textPrimary,
        }}>Your Appointments</Text>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: globalStyles.colors.black,
            paddingVertical: globalStyles.spacing.xs,
            paddingHorizontal: globalStyles.spacing.md,
            borderRadius: globalStyles.spacing.xs,
          }}
          onPress={() => navigation.navigate('BookAppointment')}
        >
          <Plus size={18} color="white" />
          <Text style={{
            ...globalStyles.bodyBold,
            color: globalStyles.colors.white,
            marginLeft: globalStyles.spacing.xs,
          }}>Book Appointment</Text>
        </TouchableOpacity>
      </View>

      {appointments.length === 0 ? (
        <View style={{
          alignItems: 'center',
          marginTop: globalStyles.spacing.xl,
        }}>
          <CalendarCheck size={48} color={globalStyles.colors.grey} />
          <Text style={{
            ...globalStyles.title3,
            color: globalStyles.colors.textPrimary,
            marginTop: globalStyles.spacing.md,
          }}>No appointments yet</Text>
          <Text style={{
            ...globalStyles.body,
            color: globalStyles.colors.textSecondary,
            marginTop: globalStyles.spacing.sm,
            textAlign: 'center',
          }}>
            {params?.therapistId
              ? 'Schedule your first appointment with this therapist'
              : 'Book your first appointment to get started'}
          </Text>
        </View>
      ) : (
        appointments.map((appointment) => {
          const formattedDate = format(new Date(appointment.appointment_date), 'MMMM dd, yyyy \'at\' h:mm a');
          return (
            <View key={appointment.id} style={{
              backgroundColor: globalStyles.colors.white,
              borderRadius: globalStyles.spacing.xs,
              padding: globalStyles.spacing.md,
              marginBottom: globalStyles.spacing.md,
              shadowColor: globalStyles.colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
              elevation: 2,
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <View>
                  <Text style={{
                    ...globalStyles.bodyBold,
                    fontSize: 18,
                    color: globalStyles.colors.textPrimary,
                  }}>
                    {appointment.therapist?.full_name ||
                      `${appointment.therapist?.first_name || ''} ${appointment.therapist?.last_name || ''}`.trim()}
                  </Text>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: globalStyles.spacing.xxs,
                  }}>
                    <Calendar size={16} color={globalStyles.colors.textSecondary} />
                    <Text style={{
                      ...globalStyles.body,
                      color: globalStyles.colors.textSecondary,
                      marginLeft: globalStyles.spacing.xxs,
                    }}>
                      {formattedDate}
                    </Text>
                  </View>
                  {appointment.notes ? (
                    <Text style={{
                      ...globalStyles.body,
                      color: globalStyles.colors.textSecondary,
                    }}>Notes: {appointment.notes}</Text>
                  ) : null}
                </View>
                <View style={{
                  paddingVertical: globalStyles.spacing.xxs,
                  paddingHorizontal: globalStyles.spacing.xs,
                  borderRadius: globalStyles.spacing.lg,
                  backgroundColor: appointment.status === 'scheduled' || appointment.status === 'pending' ? globalStyles.colors.infoLight : globalStyles.colors.successLight,
                }}>
                  <Text style={{
                    ...globalStyles.bodyBold,
                    fontSize: 12,
                    color: globalStyles.colors.success,
                  }}>{appointment.status}</Text>
                </View>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

export default AppointmentManagementScreen;
