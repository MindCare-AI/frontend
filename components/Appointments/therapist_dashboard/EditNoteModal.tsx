import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, Text, Button, TextInput, Title } from 'react-native-paper';
import { SessionNote } from '../../../types/appoint_therapist/index';

interface EditNoteModalProps {
  visible: boolean;
  note: SessionNote | null;
  onDismiss: () => void;
  onSave: (id: number, newNote: string) => void;
}

const EditNoteModal: React.FC<EditNoteModalProps> = ({
  visible,
  note,
  onDismiss,
  onSave,
}) => {
  const [editedNote, setEditedNote] = useState<string>('');

  useEffect(() => {
    if (note) {
      setEditedNote(note.notes);
    }
  }, [note]);

  const handleSave = () => {
    if (note) {
      onSave(note.id, editedNote);
      onDismiss();
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}
      >
        <Title style={styles.title}>Edit Session Notes</Title>
        {note && (
          <View style={styles.content}>
            <Text style={styles.patientName}>{note.patientName}</Text>
            <Text style={styles.date}>{note.date}</Text>

            <TextInput
              mode="outlined"
              multiline
              numberOfLines={6}
              value={editedNote}
              onChangeText={setEditedNote}
              style={styles.textInput}
            />

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
                onPress={handleSave}
                style={styles.button}
                buttonColor="#003366"
              >
                Save Notes
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
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  textInput: {
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    marginLeft: 8,
  },
});

export default EditNoteModal;