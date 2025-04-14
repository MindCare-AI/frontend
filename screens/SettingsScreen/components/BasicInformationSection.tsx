//screens/SettingsScreen/components/BasicInformationSection.tsx
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Surface, Text, TextInput, Divider } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

export interface BasicUserInfo {
  first_name: string;
  last_name: string;
  phone_number: string;
  date_of_birth: string;
}

interface BasicInformationSectionProps {
  userInfo: BasicUserInfo;
  onUpdate: (field: keyof BasicUserInfo, value: string) => void;
}

export const BasicInformationSection: React.FC<BasicInformationSectionProps> = ({
  userInfo,
  onUpdate,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date(userInfo.date_of_birth || Date.now()));

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      onUpdate('date_of_birth', selectedDate.toISOString().split('T')[0]);
    }
  };

  const validatePhoneNumber = (number: string) => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return number === '' || phoneRegex.test(number);
  };

  return (
    <Surface style={styles.card}>
      <Text style={styles.cardTitle}>Basic Information</Text>
      <Divider style={styles.divider} />
      
      <TextInput
        label="First Name"
        mode="outlined"
        value={userInfo.first_name}
        onChangeText={(text) => onUpdate('first_name', text)}
        style={styles.inputField}
        autoCapitalize="words"
      />
      
      <TextInput
        label="Last Name"
        mode="outlined"
        value={userInfo.last_name}
        onChangeText={(text) => onUpdate('last_name', text)}
        style={styles.inputField}
        autoCapitalize="words"
      />
      
      <TextInput
        label="Phone Number"
        mode="outlined"
        value={userInfo.phone_number}
        onChangeText={(text) => {
          if (validatePhoneNumber(text)) {
            onUpdate('phone_number', text);
          }
        }}
        style={styles.inputField}
        keyboardType="phone-pad"
        placeholder="+1 234 567 8900"
      />
      
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <TextInput
          label="Date of Birth"
          mode="outlined"
          value={userInfo.date_of_birth}
          editable={false}
          style={styles.inputField}
          right={<TextInput.Icon icon="calendar" />}
        />
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 8,
    elevation: 4,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 8,
    height: 1,
    backgroundColor: '#ccc',
  },
  inputField: {
    marginBottom: 16,
  },
});