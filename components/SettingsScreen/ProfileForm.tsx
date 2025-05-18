import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, HelperText, Text, RadioButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SectionHeader } from './SectionHeader';
import { globalStyles } from '../../styles/global';
import { UserProfile } from '../../API/settings/user';

interface ProfileFormProps {
  initialData: Partial<UserProfile>;
  onSave: (data: Partial<UserProfile>) => Promise<void>;
  loading?: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData,
  onSave,
  loading = false,
}) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>(initialData);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for the field if exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddressChange = (field: keyof UserProfile['address'], value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...(prev.address || {}),
        [field]: value,
      },
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleChange('dateOfBirth', selectedDate.toISOString().split('T')[0]);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (formData.phoneNumber && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        await onSave(formData);
      } catch (error) {
        console.error('Error saving profile:', error);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <SectionHeader title="Personal Information" />
      
      <TextInput
        label="First Name"
        value={formData.firstName || ''}
        onChangeText={(value) => handleChange('firstName', value)}
        style={styles.input}
        mode="outlined"
        disabled={loading}
        error={!!errors.firstName}
      />
      {errors.firstName && <HelperText type="error">{errors.firstName}</HelperText>}
      
      <TextInput
        label="Last Name"
        value={formData.lastName || ''}
        onChangeText={(value) => handleChange('lastName', value)}
        style={styles.input}
        mode="outlined"
        disabled={loading}
        error={!!errors.lastName}
      />
      {errors.lastName && <HelperText type="error">{errors.lastName}</HelperText>}
      
      <TextInput
        label="Email"
        value={formData.email || ''}
        onChangeText={(value) => handleChange('email', value)}
        keyboardType="email-address"
        style={styles.input}
        mode="outlined"
        disabled={loading}
        error={!!errors.email}
      />
      {errors.email && <HelperText type="error">{errors.email}</HelperText>}
      
      <TextInput
        label="Phone Number"
        value={formData.phoneNumber || ''}
        onChangeText={(value) => handleChange('phoneNumber', value)}
        keyboardType="phone-pad"
        style={styles.input}
        mode="outlined"
        disabled={loading}
        error={!!errors.phoneNumber}
      />
      {errors.phoneNumber && <HelperText type="error">{errors.phoneNumber}</HelperText>}
      
      <SectionHeader title="Additional Information" />
      
      <Text style={styles.label}>Gender</Text>
      <RadioButton.Group
        onValueChange={(value) => handleChange('gender', value)}
        value={formData.gender || ''}
      >
        <View style={styles.radioGroup}>
          <View style={styles.radioButton}>
            <RadioButton.Android 
              value="male" 
              disabled={loading} 
              color={globalStyles.colors.primary}
            />
            <Text>Male</Text>
          </View>
          <View style={styles.radioButton}>
            <RadioButton.Android 
              value="female" 
              disabled={loading}
              color={globalStyles.colors.primary}
            />
            <Text>Female</Text>
          </View>
          <View style={styles.radioButton}>
            <RadioButton.Android 
              value="other" 
              disabled={loading}
              color={globalStyles.colors.primary}
            />
            <Text>Other</Text>
          </View>
        </View>
      </RadioButton.Group>
      
      <Text style={styles.label}>Date of Birth</Text>
      <TextInput
        value={formData.dateOfBirth || ''}
        onFocus={() => setShowDatePicker(true)}
        placeholder="YYYY-MM-DD"
        style={styles.input}
        mode="outlined"
        disabled={loading}
        right={<TextInput.Icon icon="calendar" onPress={() => setShowDatePicker(true)} />}
      />
      
      {showDatePicker && (
        <DateTimePicker
          value={formData.dateOfBirth ? new Date(formData.dateOfBirth) : new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
      
      <SectionHeader title="Address" />
      
      <TextInput
        label="Street"
        value={formData.address?.street || ''}
        onChangeText={(value) => handleAddressChange('street', value)}
        style={styles.input}
        mode="outlined"
        disabled={loading}
      />
      
      <View style={styles.row}>
        <TextInput
          label="City"
          value={formData.address?.city || ''}
          onChangeText={(value) => handleAddressChange('city', value)}
          style={[styles.input, styles.halfInput]}
          mode="outlined"
          disabled={loading}
        />
        
        <TextInput
          label="State/Province"
          value={formData.address?.state || ''}
          onChangeText={(value) => handleAddressChange('state', value)}
          style={[styles.input, styles.halfInput]}
          mode="outlined"
          disabled={loading}
        />
      </View>
      
      <View style={styles.row}>
        <TextInput
          label="Postal Code"
          value={formData.address?.postalCode || ''}
          onChangeText={(value) => handleAddressChange('postalCode', value)}
          style={[styles.input, styles.halfInput]}
          mode="outlined"
          disabled={loading}
        />
        
        <TextInput
          label="Country"
          value={formData.address?.country || ''}
          onChangeText={(value) => handleAddressChange('country', value)}
          style={[styles.input, styles.halfInput]}
          mode="outlined"
          disabled={loading}
        />
      </View>
      
      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.button}
        loading={loading}
        disabled={loading}
      >
        Save Changes
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    marginBottom: 12,
    backgroundColor: globalStyles.colors.inputBackground,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: globalStyles.colors.text,
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  button: {
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: globalStyles.colors.primary,
  },
});