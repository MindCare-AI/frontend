import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useJournal } from '../../contexts/JournalContext';
import JournalForm from '../../components/JournalScreen/JournalForm';
import { JournalStackParamList } from '../../navigation/JournalNavigator';
import { JournalEntry } from '../../types/journal';

type EditScreenRouteProp = RouteProp<JournalStackParamList, 'JournalEdit'>;
type NavigationProp = StackNavigationProp<JournalStackParamList>;

const JournalEditScreen: React.FC = () => {
  const route = useRoute<EditScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { entry } = route.params;
  const { editEntry } = useJournal();
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  const handleUpdateEntry = async (updatedEntry: Partial<JournalEntry>) => {
    try {
      setSubmitting(true);
      
      // Disallow changing shared status if already shared
      if (entry.shared_with_therapist) {
        updatedEntry.shared_with_therapist = true;
      }
      
      const result = await editEntry(entry.id, updatedEntry);
      
      Alert.alert(
        'Success',
        'Your journal entry has been updated successfully.',
        [
          {
            text: 'View Entry',
            onPress: () => navigation.navigate('JournalDetail', { journalId: entry.id }),
          }
        ]
      );
      
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to update your journal entry. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <JournalForm
        initialEntry={entry}
        onSubmit={handleUpdateEntry}
        isSubmitting={submitting}
        buttonText="Update Entry"
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

export default JournalEditScreen;