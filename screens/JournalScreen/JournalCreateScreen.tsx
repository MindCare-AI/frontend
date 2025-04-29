import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useJournal } from '../../contexts/JournalContext';
import JournalForm from '../../components/JournalScreen/JournalForm';
import { JournalStackParamList } from '../../navigation/JournalNavigator';
import { JournalEntry } from '../../types/journal';

type NavigationProp = StackNavigationProp<JournalStackParamList>;

const JournalCreateScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { addEntry } = useJournal();
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  const handleCreateEntry = async (entry: Partial<JournalEntry>) => {
    try {
      setSubmitting(true);
      const newEntry = await addEntry(entry);
      
      Alert.alert(
        'Success',
        'Your journal entry has been created successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('JournalDetail', { journalId: newEntry.id }),
          }
        ]
      );
      
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to create your journal entry. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <JournalForm
        onSubmit={handleCreateEntry}
        isSubmitting={submitting}
        buttonText="Create Entry"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default JournalCreateScreen;