import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import { SessionNote } from '../../../types/appoint_therapist/index';

interface SessionNoteCardProps {
  note: SessionNote;
  onEdit: (note: SessionNote) => void;
}

const SessionNoteCard: React.FC<SessionNoteCardProps> = ({ note, onEdit }) => {
  // Function to truncate notes
  const truncateNotes = (text: string, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View>
            <Text style={styles.patientName}>{note.patientName}</Text>
            <Text style={styles.date}>{note.date}</Text>
          </View>
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => onEdit(note)}
            iconColor="#003366"
          />
        </View>
        <Text style={styles.notes}>{truncateNotes(note.notes)}</Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  notes: {
    fontSize: 14,
    color: '#333',
  },
});

export default SessionNoteCard;