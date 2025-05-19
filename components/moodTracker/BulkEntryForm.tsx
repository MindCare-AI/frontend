import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Surface, Text, ProgressBar, Dialog, Portal } from 'react-native-paper';
import { format, subDays } from 'date-fns';

import { MoodFormData } from '../../types/Mood';
import MoodEntryForm from './MoodEntryForm';

interface BulkEntryFormProps {
  onSubmit: (data: MoodFormData[]) => Promise<void>;
  onCancel: () => void;
}

interface DayEntry {
  date: Date;
  logged_at: string;
  formattedDate: string;
}

const BulkEntryForm: React.FC<BulkEntryFormProps> = ({ onSubmit, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [entries, setEntries] = useState<MoodFormData[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const generateDays = (): DayEntry[] => {
    return Array(7).fill(0).map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        date,
        logged_at: date.toISOString(),
        formattedDate: format(date, 'EEEE, MMM d')
      };
    });
  };
  
  const days = generateDays();
  
  const handleMoodSubmit = async (data: MoodFormData): Promise<void> => {
    const updatedEntries = [...entries];
    updatedEntries[currentStep] = data;
    setEntries(updatedEntries);
    
    if (currentStep < days.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowConfirmDialog(true);
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSubmitAll = async () => {
    await onSubmit(entries);
    setShowConfirmDialog(false);
    onCancel();
  };

  return (
    <Surface style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Bulk Mood Entry
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Fill in your mood for the past week
      </Text>

      <View style={styles.progressContainer}>
        <ProgressBar progress={(currentStep + 1) / days.length} style={styles.progress} />
        <Text variant="bodySmall" style={styles.progressText}>
          {currentStep + 1} of {days.length} days
        </Text>
      </View>
      
      <View style={styles.dayIndicator}>
        <Text variant="titleMedium">{days[currentStep].formattedDate}</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.formContainer}>
        <MoodEntryForm 
          onSubmit={handleMoodSubmit}
          initialValues={entries[currentStep] || { logged_at: days[currentStep].logged_at }}
        />
      </ScrollView>
      
      <View style={styles.navigationButtons}>
        <Button 
          mode="outlined" 
          onPress={handlePrevious}
          disabled={currentStep === 0} 
          style={styles.navButton}
        >
          Previous Day
        </Button>
        <Button 
          mode="outlined" 
          onPress={onCancel} 
          style={styles.navButton}
        >
          Cancel
        </Button>
      </View>

      <Portal>
        <Dialog visible={showConfirmDialog} onDismiss={() => setShowConfirmDialog(false)}>
          <Dialog.Title>Submit All Entries</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              You've completed entries for all {days.length} days. Would you like to submit them now?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowConfirmDialog(false)}>Not Yet</Button>
            <Button onPress={handleSubmitAll}>Submit All</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progress: {
    marginBottom: 8,
  },
  progressText: {
    textAlign: 'center',
  },
  dayIndicator: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  formContainer: {
    paddingBottom: 16,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  navButton: {
    width: '48%',
  },
});

export default BulkEntryForm;
