import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import { TimeSlot } from '../../../types/appoint_therapist/index';

interface TimeSlotCardProps {
  timeSlot: TimeSlot;
  onRemove: (id: number) => void;
}

const TimeSlotCard: React.FC<TimeSlotCardProps> = ({ timeSlot, onRemove }) => {
  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <View>
          <Text style={styles.day}>{timeSlot.day}</Text>
          <View style={styles.timeContainer}>
            <Text style={styles.time}>{timeSlot.startTime}</Text>
            <Text style={styles.to}>to</Text>
            <Text style={styles.time}>{timeSlot.endTime}</Text>
          </View>
        </View>
        <IconButton
          icon="delete"
          size={20}
          onPress={() => onRemove(timeSlot.id)}
          iconColor="#F44336"
          style={styles.removeButton}
        />
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  day: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 14,
    color: '#666',
  },
  to: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 4,
  },
  removeButton: {
    margin: 0,
  },
});

export default TimeSlotCard;