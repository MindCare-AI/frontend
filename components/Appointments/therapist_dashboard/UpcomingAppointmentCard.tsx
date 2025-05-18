import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, List } from 'react-native-paper';
import { Appointment } from '../../../types/appoint_therapist/index';

interface UpcomingAppointmentCardProps {
  appointment: Appointment;
  onToggleExpand: (id: number) => void;
}

const UpcomingAppointmentCard: React.FC<UpcomingAppointmentCardProps> = ({
  appointment,
  onToggleExpand,
}) => {
  return (
    <Card style={styles.card}>
      <List.Accordion
        title={appointment.patientName}
        description={`${appointment.date}, ${appointment.time}`}
        expanded={appointment.isExpanded}
        onPress={() => onToggleExpand(appointment.id)}
        style={styles.accordion}
        titleStyle={styles.accordionTitle}
        descriptionStyle={styles.accordionDescription}
      >
        <Card.Content style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{appointment.notes}</Text>
          </View>
          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={() => {}}
              style={styles.actionButton}
              icon="video"
              buttonColor="#003366"
              textColor="white"
            >
              Video Session Link
            </Button>
            <Button
              mode="outlined"
              onPress={() => {}}
              style={styles.actionButton}
              icon="pencil"
              textColor="#003366"
            >
              Edit Details
            </Button>
          </View>
        </Card.Content>
      </List.Accordion>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
    overflow: 'hidden',
  },
  accordion: {
    padding: 0,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  accordionDescription: {
    fontSize: 14,
  },
  content: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionButton: {
    marginRight: 8,
    marginBottom: 8,
  },
});

export default UpcomingAppointmentCard;