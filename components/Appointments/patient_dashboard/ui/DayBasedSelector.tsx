import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface AvailabilityDay {
  day: string;
  dayName: string;
  date: string;
  slots: Array<{
    start: string;
    end: string;
  }>;
}

interface DayBasedSelectorProps {
  label: string;
  availableDays: AvailabilityDay[];
  selectedDay: AvailabilityDay | null;
  onDaySelect: (day: AvailabilityDay) => void;
  isDisabled?: boolean;
  style?: any;
}

const DayBasedSelector: React.FC<DayBasedSelectorProps> = ({
  label,
  availableDays,
  selectedDay,
  onDaySelect,
  isDisabled = false,
  style
}) => {      // Create a unique identifier for each day to prevent duplicate selections
  const getDayIdentifier = (day: AvailabilityDay) => {
    if (!day) return '';
    return `${day.day}-${day.date}`;
  };
  
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      
      {availableDays.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={24} color="#9CA3AF" />
          <Text style={styles.emptyText}>No available days</Text>
        </View>
      ) : (
        <View style={styles.daysContainer}>
          {availableDays.map((day, index) => (
            <TouchableOpacity
              key={`${getDayIdentifier(day)}-${index}`}
              style={[
                styles.dayCard,
                selectedDay && getDayIdentifier(selectedDay) === getDayIdentifier(day) && styles.selectedDayCard,
                isDisabled && styles.disabledDayCard
              ]}
              onPress={() => !isDisabled && onDaySelect(day)}
              disabled={isDisabled}
            >
              <Text style={[
                styles.dayName,
                selectedDay && getDayIdentifier(selectedDay) === getDayIdentifier(day) && styles.selectedDayName,
                isDisabled && styles.disabledText
              ]}>
                {day.dayName}
              </Text>
              <Text style={[
                styles.dayDate,
                selectedDay && getDayIdentifier(selectedDay) === getDayIdentifier(day) && styles.selectedDayDate,
                isDisabled && styles.disabledText
              ]}>
                {day.date}
              </Text>
              <Text style={[
                styles.slotsCount,
                selectedDay && getDayIdentifier(selectedDay) === getDayIdentifier(day) && styles.selectedSlotsCount,
                isDisabled && styles.disabledText
              ]}>
                {day.slots.length} slot{day.slots.length !== 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#9CA3AF',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayCard: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  selectedDayCard: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
    borderWidth: 2,
  },
  disabledDayCard: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.6,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  selectedDayName: {
    color: '#4F46E5',
  },
  dayDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  selectedDayDate: {
    color: '#4F46E5',
  },
  slotsCount: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  selectedSlotsCount: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  disabledText: {
    color: '#9CA3AF',
  },
});

export default DayBasedSelector;
