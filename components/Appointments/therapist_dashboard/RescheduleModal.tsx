import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Text, Button, RadioButton, Title } from 'react-native-paper';
import { Appointment } from '../../../types/appoint_therapist/index';
import { availableTimeSlots } from '../../../contexts/appoint_therapist/AppContext';

interface RescheduleModalProps {
  visible: boolean;
  appointment: Appointment | null;
  onDismiss: () => void;
  onReschedule: (id: number, newTime: string) => void;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({
  visible,
  appointment,
  onDismiss,
  onReschedule,
}) => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  const handleReschedule = () => {
    if (appointment && selectedTimeSlot) {
      onReschedule(appointment.id, selectedTimeSlot);
      onDismiss();
      setSelectedTimeSlot(''); // Reset selection after rescheduling
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}
      >
        <Title style={styles.title}>Reschedule Appointment</Title>
        {appointment && (
          <View style={styles.content}>
            <Text style={styles.patientName}>{appointment.patientName}</Text>
            <Text style={styles.currentTime}>Current time: {appointment.time}</Text>

            <Text style={styles.sectionTitle}>Select New Time Slot</Text>
            <RadioButton.Group
              onValueChange={(value) => setSelectedTimeSlot(value)}
              value={selectedTimeSlot}
            >
              {availableTimeSlots.map((slot) => (
                <View key={slot} style={styles.radioItem}>
                  <RadioButton value={slot} />
                  <Text onPress={() => setSelectedTimeSlot(slot)}>{slot}</Text>
                </View>
              ))}
            </RadioButton.Group>

            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={onDismiss}
                style={styles.button}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleReschedule}
                disabled={!selectedTimeSlot}
                style={styles.button}
                buttonColor="#003366"
              >
                Reschedule
              </Button>
            </View>
          </View>
        )}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  title: {
    marginBottom: 16,
  },
  content: {
    marginBottom: 16,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  currentTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  button: {
    marginLeft: 8,
  },
});

export default RescheduleModal;