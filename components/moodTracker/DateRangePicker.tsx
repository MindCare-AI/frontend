import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onChangeStartDate: (date?: string) => void;
  onChangeEndDate: (date?: string) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChangeStartDate,
  onChangeEndDate,
}) => {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  
  const handleStartDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      onChangeStartDate(selectedDate.toISOString());
    }
  };
  
  const handleEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      onChangeEndDate(selectedDate.toISOString());
    }
  };
  
  const formatDisplayDate = (dateString?: string) => {
    if (!dateString) return 'Select date';
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.dateContainer}>
        <Text style={styles.label}>Start Date</Text>
        <Button 
          mode="outlined" 
          onPress={() => setShowStartPicker(true)}
          style={styles.dateButton}
        >
          {formatDisplayDate(startDate)}
        </Button>
        {showStartPicker && (
          <DateTimePicker
            value={startDate ? new Date(startDate) : new Date()}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
          />
        )}
      </View>
      
      <View style={styles.dateContainer}>
        <Text style={styles.label}>End Date</Text>
        <Button 
          mode="outlined" 
          onPress={() => setShowEndPicker(true)}
          style={styles.dateButton}
        >
          {formatDisplayDate(endDate)}
        </Button>
        {showEndPicker && (
          <DateTimePicker
            value={endDate ? new Date(endDate) : new Date()}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
            minimumDate={startDate ? new Date(startDate) : undefined}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateContainer: {
    width: '48%',
  },
  label: {
    marginBottom: 4,
  },
  dateButton: {
    width: '100%',
  },
});

export default DateRangePicker;
