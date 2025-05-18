import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Appointment } from '../../../types/appoint_therapist/index';

interface AppointmentCardProps {
  appointment: Appointment;
  onConfirm: (id: number) => void;
  onComplete: (id: number) => void;
  onReschedule: (appointment: Appointment) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onConfirm,
  onComplete,
  onReschedule,
}) => {
  // Function to get the status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return '#FFC107';
      case 'Confirmed':
        return '#4CAF50';
      case 'Completed':
        return '#2196F3';
      case 'Rescheduled':
        return '#9C27B0';
      default:
        return '#757575';
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View>
            <Text style={styles.patientName}>{appointment.patientName}</Text>
            <View style={styles.timeContainer}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
              <Text style={styles.time}>{appointment.time}</Text>
            </View>
          </View>
          <Chip
            mode="outlined"
            textStyle={{ color: getStatusColor(appointment.status) }}
            style={[styles.statusChip, { borderColor: getStatusColor(appointment.status) }]}
          >
            {appointment.status}
          </Chip>
        </View>

        <View style={styles.actions}>
          {appointment.status === 'Pending' && (
            <Button
              mode="contained"
              onPress={() => onConfirm(appointment.id)}
              style={styles.actionButton}
              icon="check"
              buttonColor="#003366"
              textColor="white"
            >
              Confirm
            </Button>
          )}
          {appointment.status === 'Confirmed' && (
            <Button
              mode="contained"
              onPress={() => onComplete(appointment.id)}
              style={styles.actionButton}
              icon="check"
              buttonColor="#003366"
              textColor="white"
            >
              Complete
            </Button>
          )}
          {(appointment.status === 'Confirmed' || appointment.status === 'Pending') && (
            <Button
              mode="outlined"
              onPress={() => onReschedule(appointment)}
              style={styles.actionButton}
              icon="calendar-refresh"
              textColor="#003366"
            >
              Reschedule
            </Button>
          )}
          {appointment.status === 'Confirmed' && (
            <Button
              mode="outlined"
              onPress={() => {}}
              style={styles.actionButton}
              icon="video"
              textColor="#003366"
            >
              Join
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  time: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  statusChip: {
    height: 28,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  actionButton: {
    marginRight: 8,
    marginBottom: 8,
  },
});

export default AppointmentCard;