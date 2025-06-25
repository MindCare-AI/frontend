import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { globalStyles } from '../../styles/global';
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { format } from 'date-fns';

/**
 * A themed wrapper for DateTimePicker that ensures consistent light theme styling
 * across the application.
 */
interface ThemedDateTimePickerProps {
  // Standard props
  mode: 'date' | 'time' | 'datetime';
  value: Date;
  onChange: (event: any, selectedDate?: Date) => void;
  // Optional props
  maximumDate?: Date;
  minimumDate?: Date;
  display?: 'default' | 'spinner' | 'clock' | 'calendar';
  disabled?: boolean;
  testID?: string;
}

const ThemedDateTimePicker: React.FC<ThemedDateTimePickerProps> = ({
  mode,
  value,
  onChange,
  maximumDate,
  minimumDate,
  display,
  disabled,
  testID
}) => {
  // Special handling for web platform
  if (Platform.OS === 'web') {
    // Use a simple input date for web to avoid DateTimePicker not supported error
    const handleWebDateChange = (e: any) => {
      const date = e.target.value ? new Date(e.target.value) : null;
      if (date) {
        // Create an event-like object that simulates the native event structure
        onChange({ nativeEvent: { timestamp: date.getTime() } }, date);
      }
    };
    
    // Format date for input element
    const dateValue = value ? format(value, 'yyyy-MM-dd') : '';
    const minDate = minimumDate ? format(minimumDate, 'yyyy-MM-dd') : '';
    const maxDate = maximumDate ? format(maximumDate, 'yyyy-MM-dd') : '';
    
    return (
      <View style={styles.webPickerContainer}>
        <input
          type="date"
          value={dateValue}
          onChange={handleWebDateChange}
          min={minDate}
          max={maxDate}
          disabled={disabled}
          style={{
            width: '100%',
            padding: 12,
            fontSize: 16,
            border: `1px solid ${globalStyles.colors.primary}`,
            borderRadius: 8,
            color: globalStyles.colors.text,
            backgroundColor: 'white',
            outlineColor: globalStyles.colors.primary,
          }}
          data-testid={testID}
        />
      </View>
    );
  }
  
  // For native platforms (iOS, Android)
  return (
    <View style={{ width: '100%' }}>
      <DateTimePicker
        mode={mode}
        value={value}
        onChange={onChange}
        maximumDate={maximumDate}
        minimumDate={minimumDate}
        // Apply light theme colors consistently
        textColor={globalStyles.colors.text}
        accentColor={globalStyles.colors.primary}
        // Force light theme on all platforms
        themeVariant="light"
        // Use platform-specific displays for best user experience
        display={display || (Platform.OS === 'ios' ? 'spinner' : 'default')}
        disabled={disabled}
        testID={testID}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  webPickerContainer: {
    width: '100%',
  }
});

export default ThemedDateTimePicker;
