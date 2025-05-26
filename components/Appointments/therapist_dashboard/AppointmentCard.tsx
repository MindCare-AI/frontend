import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal as RNModal } from 'react-native';
import { Card, Text, Chip, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Appointment, AppointmentStatus } from '../../../types/appoint_therapist/index';

interface AppointmentCardProps {
  appointment: Appointment;
  onConfirm: (id: number | string) => Promise<void>;
  onComplete: (id: number | string) => void;
  onReschedule: (appointment: Appointment) => void;
  onCancel?: (id: number) => Promise<void>;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onConfirm,
  onComplete,
  onReschedule,
  onCancel,
}) => {
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  
  // Function to handle long press
  const handleLongPress = () => {
    setActionSheetVisible(true);
  };

  // Handle confirm action with loading state
  const handleConfirm = async () => {
    setIsConfirming(true);
    setActionSheetVisible(false);
    try {
      await onConfirm(appointment.id);
    } catch (error) {
      console.error('Error confirming appointment:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  // Handle cancel action with loading state
  const handleCancel = async () => {
    if (!onCancel) return;
    setIsCanceling(true);
    setActionSheetVisible(false);
    try {
      await onCancel(Number(appointment.id));
    } catch (error) {
      console.error('Error canceling appointment:', error);
    } finally {
      setIsCanceling(false);
    }
  };

  // Function to get the status color
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'pending':
        return '#FFA726'; // Orange
      case 'confirmed':
        return '#66BB6A'; // Green
      case 'completed':
        return '#42A5F5'; // Blue
      case 'rescheduled':
        return '#AB47BC'; // Purple
      case 'canceled':
        return '#EF5350'; // Red
      default:
        return '#78909C'; // Blue Grey
    }
  };

  // Capitalize the first letter of status
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  // Use only the properties that exist in the Appointment type
  const patientName = appointment.patientName || 'Patient';

  return (
    <>
      <TouchableOpacity
        delayLongPress={500}
        onLongPress={handleLongPress}
      >
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <View>
                <Text style={styles.patientName}>{patientName}</Text>
                <View style={styles.timeContainer}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color="#5C6BC0" />
                  <Text style={styles.time}>{appointment.time}</Text>
                </View>
              </View>
              <Chip
                mode="outlined"
                textStyle={{ color: getStatusColor(appointment.status) }}
                style={[styles.statusChip, { borderColor: getStatusColor(appointment.status) }]}
              >
                {formatStatus(appointment.status)}
              </Chip>
            </View>

            <View style={styles.actions}>
              {appointment.status === 'pending' && (
                <Button
                  mode="contained"
                  onPress={handleConfirm}
                  style={styles.actionButton}
                  icon="check"
                  buttonColor="#3F51B5"
                  textColor="white"
                  loading={isConfirming}
                  disabled={isConfirming}
                >
                  Confirm
                </Button>
              )}
              {appointment.status === 'confirmed' && (
                <Button
                  mode="contained"
                  onPress={() => onComplete(appointment.id)}
                  style={styles.actionButton}
                  icon="check-all"
                  buttonColor="#3F51B5"
                  textColor="white"
                >
                  Complete
                </Button>
              )}
              {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                <Button
                  mode="outlined"
                  onPress={() => onReschedule(appointment)}
                  style={styles.actionButton}
                  icon="calendar-refresh"
                  textColor="#3F51B5"
                >
                  Reschedule
                </Button>
              )}
              {appointment.status === 'confirmed' && appointment.video_session_link && (
                <Button
                  mode="outlined"
                  onPress={() => window.open(appointment.video_session_link, '_blank')}
                  style={styles.actionButton}
                  icon="video"
                  textColor="#3F51B5"
                >
                  Join
                </Button>
              )}
            </View>
            
            {appointment.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Notes:</Text>
                <Text style={styles.notes}>{appointment.notes}</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Action Sheet Modal */}
      <RNModal
        visible={actionSheetVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setActionSheetVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setActionSheetVisible(false)}
        >
          <View style={styles.actionSheetContainer}>
            <Text style={styles.actionSheetTitle}>Appointment Options</Text>
            
            {appointment.status === 'pending' && (
              <TouchableOpacity
                style={styles.actionSheetButton}
                onPress={handleConfirm}
                disabled={isConfirming}
              >
                <MaterialCommunityIcons name="check-circle-outline" size={20} color="#66BB6A" style={{ marginRight: 8 }} />
                <Text style={styles.actionSheetButtonText}>
                  {isConfirming ? 'Confirming...' : 'Confirm Appointment'}
                </Text>
              </TouchableOpacity>
            )}
            
            {appointment.status === 'confirmed' && (
              <TouchableOpacity
                style={styles.actionSheetButton}
                onPress={() => {
                  setActionSheetVisible(false);
                  onComplete(appointment.id);
                }}
              >
                <MaterialCommunityIcons name="check-all" size={20} color="#42A5F5" style={{ marginRight: 8 }} />
                <Text style={styles.actionSheetButtonText}>Mark as Complete</Text>
              </TouchableOpacity>
            )}
            
            {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
              <TouchableOpacity
                style={styles.actionSheetButton}
                onPress={() => {
                  setActionSheetVisible(false);
                  onReschedule(appointment);
                }}
              >
                <MaterialCommunityIcons name="calendar-refresh" size={20} color="#4F46E5" style={{ marginRight: 8 }} />
                <Text style={styles.actionSheetButtonText}>Reschedule</Text>
              </TouchableOpacity>
            )}
            
            {(appointment.status === 'confirmed' || appointment.status === 'pending') && onCancel && (
              <TouchableOpacity
                style={styles.actionSheetButton}
                onPress={handleCancel}
                disabled={isCanceling}
              >
                <MaterialCommunityIcons name="close-circle-outline" size={20} color="#E53E3E" style={{ marginRight: 8 }} />
                <Text style={styles.actionSheetButtonText}>
                  {isCanceling ? 'Canceling...' : 'Cancel Appointment'}
                </Text>
              </TouchableOpacity>
            )}
            
            {appointment.status === 'confirmed' && appointment.video_session_link && (
              <TouchableOpacity
                style={styles.actionSheetButton}
                onPress={() => {
                  setActionSheetVisible(false);
                  window.open(appointment.video_session_link, '_blank');
                }}
              >
                <MaterialCommunityIcons name="video" size={20} color="#4F46E5" style={{ marginRight: 8 }} />
                <Text style={styles.actionSheetButtonText}>Join Video Session</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.actionSheetButton, { justifyContent: "center" }]}
              onPress={() => setActionSheetVisible(false)}
            >
              <Text style={[styles.actionSheetButtonText, { color: "#718096" }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </RNModal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderLeftColor: '#3F51B5',
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
    color: '#3F51B5',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  time: {
    fontSize: 14,
    color: '#5C6BC0',
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
    borderRadius: 8,
  },
  notesContainer: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#F5F7FF',
    borderRadius: 8,
  },
  notesLabel: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
    color: '#3F51B5',
  },
  notes: {
    fontSize: 14,
    color: '#546E7A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  actionSheetContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  actionSheetTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 12,
  },
  actionSheetButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#F7FAFC",
  },
  actionSheetButtonText: {
    fontSize: 16,
    color: "#2D3748",
  },
});

export default AppointmentCard;