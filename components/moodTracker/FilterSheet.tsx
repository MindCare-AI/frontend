import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Surface, Text, Modal, TextInput, Chip } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { MoodFilters } from '../../types/Mood';
import { ACTIVITY_OPTIONS } from '../../constants/moodTypes';
import DateRangePicker from './DateRangePicker';

interface FilterSheetProps {
  visible: boolean;
  initialFilters: MoodFilters;
  onApply: (filters: MoodFilters) => void;
  onDismiss: () => void;
  onClear: () => void;
}

const FilterSheet: React.FC<FilterSheetProps> = ({
  visible,
  initialFilters,
  onApply,
  onDismiss,
  onClear,
}) => {
  const [filters, setFilters] = useState<MoodFilters>(initialFilters);
  const [activityVisible, setActivityVisible] = useState(false);
  
  // Reset local state when initialFilters change
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);
  
  const handleApply = () => {
    onApply(filters);
    onDismiss();
  };
  
  const handleClear = () => {
    setFilters({});
    onClear();
    onDismiss();
  };
  
  const toggleActivity = (activity: string) => {
    const currentActivities = filters.activities ? filters.activities.split(',') : [];
    const updatedActivities = currentActivities.includes(activity)
      ? currentActivities.filter(a => a !== activity)
      : [...currentActivities, activity];
    
    setFilters({
      ...filters,
      activities: updatedActivities.length ? updatedActivities.join(',') : undefined,
    });
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={styles.modalContainer}
    >
      <ScrollView>
        <Surface style={styles.container}>
          <Text variant="titleLarge" style={styles.title}>Filter Mood Entries</Text>
          
          <View style={styles.section}>
            <Text variant="titleSmall" style={styles.sectionTitle}>Date Range</Text>
            <DateRangePicker
              startDate={filters.startDate}
              endDate={filters.endDate}
              onChangeStartDate={(date) => setFilters({ ...filters, startDate: date })}
              onChangeEndDate={(date) => setFilters({ ...filters, endDate: date })}
            />
          </View>
          
          <View style={styles.section}>
            <Text variant="titleSmall" style={styles.sectionTitle}>Mood Rating Range</Text>
            <View style={styles.ratingContainer}>
              <Text>Min: {filters.minRating || 1}</Text>
              <Text>Max: {filters.maxRating || 10}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text>Min</Text>
              <Slider
                value={filters.minRating || 1}
                onValueChange={(min) =>
                  setFilters({ ...filters, minRating: min })
                }
                minimumValue={1}
                maximumValue={filters.maxRating || 10}
                step={1}
                style={[styles.slider, { flex: 1, marginHorizontal: 8 }]}
                minimumTrackTintColor="#6200ee"
                maximumTrackTintColor="#e0e0e0"
              />
              <Text>{filters.minRating || 1}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <Text>Max</Text>
              <Slider
                value={filters.maxRating || 10}
                onValueChange={(max) =>
                  setFilters({ ...filters, maxRating: max })
                }
                minimumValue={filters.minRating || 1}
                maximumValue={10}
                step={1}
                style={[styles.slider, { flex: 1, marginHorizontal: 8 }]}
                minimumTrackTintColor="#6200ee"
                maximumTrackTintColor="#e0e0e0"
              />
              <Text>{filters.maxRating || 10}</Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text variant="titleSmall" style={styles.sectionTitle}>Activities</Text>
            <Button 
              mode="outlined" 
              onPress={() => setActivityVisible(!activityVisible)}
              icon={activityVisible ? "chevron-up" : "chevron-down"}
              style={styles.activityButton}
            >
              {filters.activities ? `${filters.activities.split(',').length} selected` : 'Select Activities'}
            </Button>
            
            {activityVisible && (
              <View style={styles.chipContainer}>
                {ACTIVITY_OPTIONS.map(activity => {
                  const isSelected = filters.activities?.includes(activity.value);
                  return (
                    <Chip
                      key={activity.value}
                      selected={isSelected}
                      onPress={() => toggleActivity(activity.value)}
                      style={styles.chip}
                    >
                      {activity.label}
                    </Chip>
                  );
                })}
              </View>
            )}
          </View>
          
          <View style={styles.section}>
            <Text variant="titleSmall" style={styles.sectionTitle}>Search Text</Text>
            <TextInput
              placeholder="Search in notes..."
              value={filters.searchText}
              onChangeText={(text) => setFilters({ ...filters, searchText: text })}
              style={styles.textInput}
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <Button onPress={handleClear} mode="outlined" style={styles.button}>
              Clear Filters
            </Button>
            <Button onPress={handleApply} mode="contained" style={styles.button}>
              Apply Filters
            </Button>
          </View>
        </Surface>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    marginHorizontal: 16,
    marginVertical: 80,
    maxHeight: '80%',
  },
  container: {
    padding: 16,
    borderRadius: 16,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  slider: {
    height: 40,
  },
  activityButton: {
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginVertical: 4,
  },
  textInput: {
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    width: '48%',
  }
});

export default FilterSheet;
