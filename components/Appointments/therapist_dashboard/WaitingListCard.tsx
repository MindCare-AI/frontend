import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WaitingListEntry } from '../../../types/appoint_therapist/index';

interface WaitingListCardProps {
  entry: WaitingListEntry;
  onNotify: (id: number) => void;
  onRemove: (id: number) => void;
}

const WaitingListCard: React.FC<WaitingListCardProps> = ({
  entry,
  onNotify,
  onRemove,
}) => {
  return (
    <Card style={[styles.card, entry.isExpired && styles.expiredCard]}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.nameContainer}>
            <Text style={styles.patientName}>{entry.patientName}</Text>
            {entry.isExpired && (
              <Chip
                mode="outlined"
                textStyle={{ color: '#F44336' }}
                style={styles.expiredChip}
              >
                Expired
              </Chip>
            )}
          </View>
          <Chip
            mode="outlined"
            textStyle={{ color: entry.status === 'Notified' ? '#2196F3' : '#FFC107' }}
            style={[
              styles.statusChip,
              {
                borderColor: entry.status === 'Notified' ? '#2196F3' : '#FFC107',
              },
            ]}
          >
            {entry.status}
          </Chip>
        </View>

        <View style={styles.dateContainer}>
          <MaterialCommunityIcons name="calendar" size={16} color="#666" />
          <Text style={styles.date}>Requested: {entry.requestedDate}</Text>
        </View>

        <View style={styles.timeSlots}>
          {entry.preferredTimeSlots.map((slot, index) => (
            <Chip key={index} style={styles.timeSlotChip} textStyle={styles.timeSlotText}>
              {slot}
            </Chip>
          ))}
        </View>

        <View style={styles.actions}>
          {entry.status === 'Pending' && (
            <Button
              mode="contained"
              onPress={() => onNotify(entry.id)}
              style={styles.actionButton}
              icon="bell"
              buttonColor="#003366"
              textColor="white"
            >
              Notify Patient
            </Button>
          )}
          <Button
            mode="outlined"
            onPress={() => onRemove(entry.id)}
            style={styles.removeButton}
            icon="delete"
            textColor="#F44336"
          >
            Remove
          </Button>
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
  expiredCard: {
    borderColor: '#FFCDD2',
    borderWidth: 1,
    backgroundColor: '#FFEBEE',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  expiredChip: {
    height: 24,
    borderColor: '#F44336',
  },
  statusChip: {
    height: 28,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  timeSlotChip: {
    marginRight: 4,
    marginBottom: 4,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeSlotText: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  removeButton: {
    borderColor: '#F44336',
    marginBottom: 8,
  },
});

export default WaitingListCard;