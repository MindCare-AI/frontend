import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal as RNModal } from 'react-native';
import { Card, Text, Button, List, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Appointment, AppointmentStatus } from '../../../types/appoint_therapist/index';

interface UpcomingAppointmentCardProps {
  appointment: Appointment;
  onToggleExpand: (id: number) => void;
  onVideoLink: (id: number) => void;
  onEditDetails: (id: number) => void;
  onConfirm?: (id: number | string) => Promise<void>;
  onCancel?: (id: number) => Promise<void>;
}

const UpcomingAppointmentCard: React.FC<UpcomingAppointmentCardProps> = ({
  appointment,
  onToggleExpand,
  onVideoLink,
  onEditDetails,
  onConfirm,
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
    if (!onConfirm) return;
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

  // Format the date and time from API response "2025-05-27 10:00" to a more readable format
  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return '';
    
    try {
      const [datePart, timePart] = dateTimeString.split(' ');
      const date = new Date(datePart);
      const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      return `${formattedDate} at ${timePart}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateTimeString;
    }
  };
  
  // Display "Scheduled" instead of "Pending"
  const displayStatus = (status: AppointmentStatus) => {
    return status === 'pending' ? 'scheduled' : status;
  };
  
  // Function to get the status color
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'pending': // Show as scheduled
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

  const formattedDateTime = appointment.appointment_date 
    ? formatDateTime(appointment.appointment_date)
    : `${appointment.date}, ${appointment.time}`;
    
  // Use only the properties that exist in the Appointment type
  const patientName = appointment.patientName || 'Patient';

  return (
    <>
      <TouchableOpacity
        delayLongPress={500}
        onLongPress={handleLongPress}
      >
        <Card style={styles.card}>
          <List.Accordion
            title={patientName}
            description={formattedDateTime}
            expanded={appointment.isExpanded}
            onPress={() => onToggleExpand(Number(appointment.id))}
            style={styles.accordion}
            titleStyle={styles.accordionTitle}
            descriptionStyle={styles.accordionDescription}
            theme={{ colors: { primary: '#F0F8FF' } }}
            right={props => (
              <Chip
                mode="outlined"
                textStyle={{ color: '#F0F8FF' }}
                style={[styles.statusChip, { borderColor: '#F0F8FF' }]}
              >
                {formatStatus(displayStatus(appointment.status))}
              </Chip>
            )}
          >
            <Card.Content style={styles.content}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <Text style={styles.notes}>{appointment.notes || 'No notes available'}</Text>
              </View>
              <View style={styles.actions}>
                <Button
                  mode="contained"
                  onPress={() => onVideoLink(Number(appointment.id))}
                  style={styles.actionButton}
                  icon="video"
                  buttonColor="#3F51B5"
                  textColor="white"
                  disabled={!appointment.video_session_link}
                >
                  Video Session Link
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => onEditDetails(Number(appointment.id))}
                  style={styles.actionButton}
                  icon="pencil"
                  textColor="#3F51B5"
                >
                  Edit Details
                </Button>
              </View>
            </Card.Content>
          </List.Accordion>
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
            
            {onConfirm && appointment.status === 'pending' && (
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
            
            <TouchableOpacity
              style={styles.actionSheetButton}
              onPress={() => {
                setActionSheetVisible(false);
                onVideoLink(Number(appointment.id));
              }}
            >
              <MaterialCommunityIcons name="video" size={20} color="#4F46E5" style={{ marginRight: 8 }} />
              <Text style={styles.actionSheetButtonText}>Open Video Session</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionSheetButton}
              onPress={() => {
                setActionSheetVisible(false);
                onEditDetails(Number(appointment.id));
              }}
            >
              <MaterialCommunityIcons name="pencil" size={20} color="#4F46E5" style={{ marginRight: 8 }} />
              <Text style={styles.actionSheetButtonText}>Edit Details</Text>
            </TouchableOpacity>
            
            {onCancel && (appointment.status === 'pending' || appointment.status === 'confirmed') && (
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
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: '#3F51B5',
    borderLeftWidth: 4,
    borderLeftColor: '#5C6BC0',
  },
  accordion: {
    padding: 0,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  accordionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#F0F8FF',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3F51B5',
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
    color: '#546E7A',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionButton: {
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  statusChip: {
    height: 28,
    marginRight: 12,
    alignSelf: 'center',
    backgroundColor: 'transparent',
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

export default UpcomingAppointmentCard;