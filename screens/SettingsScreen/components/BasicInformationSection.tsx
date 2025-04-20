//screens/SettingsScreen/components/BasicInformationSection.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Surface, TextInput, Divider } from 'react-native-paper';
import { Text } from '../../../components/ui/Text';
import DateTimePicker from '@react-native-community/datetimepicker';
import { globalStyles } from '../../../styles/global';
export interface BasicUserInfo {
  first_name: string;
  last_name: string;
  email: string;
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
    <Surface style={{
      padding: globalStyles.spacing.md,
      marginVertical: globalStyles.spacing.xs,
      borderRadius: globalStyles.spacing.sm,
      backgroundColor: globalStyles.colors.white,
      shadowColor: globalStyles.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    }}>
      <Text style={{ ...globalStyles.title3, marginBottom: globalStyles.spacing.xs }}>Basic Information</Text>
      <Divider style={{
        marginVertical: globalStyles.spacing.xs,
        backgroundColor: globalStyles.colors.divider,
      }} />
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
        label="Email"
        mode="outlined"
        value={userInfo.email}
        onChangeText={(text) => onUpdate('email', text)}
        style={styles.inputField}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="example@example.com"
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