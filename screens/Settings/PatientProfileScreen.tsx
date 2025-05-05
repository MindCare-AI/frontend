import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { TextInput, Button, HelperText, RadioButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getPatientProfile, updatePatientProfile, PatientProfile } from '../../API/settings/patient_profile';
import UserAvatarCard from '../../components/ui/UserAvatarCard';
import SectionHeader from '../../components/ui/SectionHeader';
import { globalStyles } from '../../styles/global';
import { SettingsStackParamList } from '../../types/navigation';

const PatientProfileScreen = () => {
  const navigation = useNavigation<NavigationProp<SettingsStackParamList>>();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [formData, setFormData] = useState<Partial<PatientProfile>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchPatientProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const fetchPatientProfile = async () => {
    try {
      setIsLoading(true);
      const data = await getPatientProfile();
      setProfile(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile information');
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof PatientProfile, value: any) => {
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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Format date as YYYY-MM-DD
      const dateString = selectedDate.toISOString().split('T')[0];
      handleChange('date_of_birth', dateString);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // First name validation
    if (!formData.first_name?.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (formData.first_name.length > 100) {
      newErrors.first_name = 'Name cannot exceed 100 characters';
    }
    
    // Last name validation
    if (!formData.last_name?.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (formData.last_name.length > 100) {
      newErrors.last_name = 'Name cannot exceed 100 characters';
    }
    
    // Date of birth validation
    if (formData.date_of_birth) {
      const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dobRegex.test(formData.date_of_birth)) {
        newErrors.date_of_birth = 'Date must be in YYYY-MM-DD format';
      } else {
        const dob = new Date(formData.date_of_birth);
        const today = new Date();
        
        if (dob > today) {
          newErrors.date_of_birth = 'Date of birth cannot be in the future';
        }
        
        const age = today.getFullYear() - dob.getFullYear();
        if (age > 120) {
          newErrors.date_of_birth = 'Please enter a valid date of birth';
        }
      }
    }
    
    // Phone number validation
    if (formData.phone_number) {
      const phoneRegex = /^[+]?[0-9]{7,15}$/;
      if (!phoneRegex.test(formData.phone_number)) {
        newErrors.phone_number = 'Phone number should contain only digits and may start with +';
      }
      if (formData.phone_number.replace(/[^0-9]/g, '').length < 7 || 
          formData.phone_number.replace(/[^0-9]/g, '').length > 15) {
        newErrors.phone_number = 'Phone number must be between 7 and 15 digits';
      }
    }
    
    // Blood type validation
    if (formData.blood_type && !['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(formData.blood_type)) {
      newErrors.blood_type = 'Blood type must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-';
    }
    
    // Emergency contact validation
    if (formData.emergency_contact && formData.emergency_contact.length > 100) {
      newErrors.emergency_contact = 'Emergency contact name cannot exceed 100 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (validateForm()) {
      try {
        setIsSaving(true);
        
        // Only include the fields expected by the API
        const updateData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number,
          profile_pic: formData.profile_pic,
          blood_type: formData.blood_type,
          gender: formData.gender,
          emergency_contact: formData.emergency_contact,
          date_of_birth: formData.date_of_birth,
        };
        
        await updatePatientProfile(updateData);
        setProfile(prev => prev ? { ...prev, ...formData } : null);
        Alert.alert('Success', 'Profile updated successfully');
      } catch (error: any) {
        // Handle API error responses
        if (error.response && error.response.data) {
          const apiErrors = error.response.data;
          const formattedErrors: Record<string, string> = {};
          
          Object.keys(apiErrors).forEach(key => {
            formattedErrors[key] = Array.isArray(apiErrors[key]) 
              ? apiErrors[key][0] 
              : apiErrors[key].toString();
          });
          
          setErrors(formattedErrors);
          Alert.alert('Validation Error', 'Please check the form for errors');
        } else {
          Alert.alert('Error', 'Failed to update profile. Please try again.');
        }
        console.error('Error updating profile:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const bloodTypeOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genderOptions = [
    { label: 'Male', value: 'M' },
    { label: 'Female', value: 'F' },
    { label: 'Other', value: 'O' },
    { label: 'Prefer not to say', value: 'N' },
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={globalStyles.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {profile && (
          <>
            <UserAvatarCard
              avatar={profile.profile_pic}
              name={`${profile.first_name} ${profile.last_name}`}
              role="Patient"
            />

            <View style={styles.section}>
              <SectionHeader title="Patient Information" />
              
              <Text style={styles.label}>Basic Information</Text>
              
              <TextInput
                label="First Name"
                value={formData.first_name || ''}
                onChangeText={(value) => handleChange('first_name', value)}
                style={styles.input}
                mode="outlined"
                disabled={isSaving}
                error={!!errors.first_name}
              />
              {errors.first_name && <HelperText type="error">{errors.first_name}</HelperText>}
              
              <TextInput
                label="Last Name"
                value={formData.last_name || ''}
                onChangeText={(value) => handleChange('last_name', value)}
                style={styles.input}
                mode="outlined"
                disabled={isSaving}
                error={!!errors.last_name}
              />
              {errors.last_name && <HelperText type="error">{errors.last_name}</HelperText>}
              
              <TextInput
                label="Phone Number"
                value={formData.phone_number || ''}
                onChangeText={(value) => handleChange('phone_number', value)}
                keyboardType="phone-pad"
                style={styles.input}
                mode="outlined"
                disabled={isSaving}
                error={!!errors.phone_number}
              />
              {errors.phone_number && <HelperText type="error">{errors.phone_number}</HelperText>}
              
              <SectionHeader title="Medical Information" />
              
              <Text style={styles.label}>Gender</Text>
              <RadioButton.Group
                onValueChange={(value) => handleChange('gender', value)}
                value={formData.gender || ''}
              >
                <View style={styles.radioGroup}>
                  {genderOptions.map((option) => (
                    <View key={option.value} style={styles.radioButton}>
                      <RadioButton.Android 
                        value={option.value} 
                        disabled={isSaving} 
                        color={globalStyles.colors.primary}
                      />
                      <Text>{option.label}</Text>
                    </View>
                  ))}
                </View>
              </RadioButton.Group>
              
              <Text style={styles.label}>Date of Birth</Text>
              <TextInput
                value={formData.date_of_birth || ''}
                onFocus={() => setShowDatePicker(true)}
                placeholder="YYYY-MM-DD"
                style={styles.input}
                mode="outlined"
                disabled={isSaving}
                error={!!errors.date_of_birth}
                right={<TextInput.Icon icon="calendar" onPress={() => setShowDatePicker(true)} />}
              />
              {errors.date_of_birth && <HelperText type="error">{errors.date_of_birth}</HelperText>}
              
              {showDatePicker && (
                <DateTimePicker
                  value={formData.date_of_birth ? new Date(formData.date_of_birth) : new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
              
              <Text style={styles.label}>Blood Type</Text>
              <View style={styles.bloodTypeContainer}>
                {bloodTypeOptions.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.bloodTypeButton,
                      formData.blood_type === type && styles.bloodTypeButtonSelected
                    ]}
                    onPress={() => handleChange('blood_type', type)}
                    disabled={isSaving}
                  >
                    <Text style={[
                      styles.bloodTypeText,
                      formData.blood_type === type && styles.bloodTypeTextSelected
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.blood_type && <HelperText type="error">{errors.blood_type}</HelperText>}
              
              <SectionHeader title="Emergency Contact" />
              
              <TextInput
                label="Emergency Contact Name"
                value={formData.emergency_contact || ''}
                onChangeText={(value) => handleChange('emergency_contact', value)}
                style={styles.input}
                mode="outlined"
                disabled={isSaving}
                error={!!errors.emergency_contact}
              />
              {errors.emergency_contact && <HelperText type="error">{errors.emergency_contact}</HelperText>}
              
              <Button
                mode="contained"
                onPress={handleUpdateProfile}
                style={styles.button}
                loading={isSaving}
                disabled={isSaving}
              >
                Save Changes
              </Button>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: globalStyles.colors.backgroundLight,
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: globalStyles.colors.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: globalStyles.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: globalStyles.colors.text,
    fontWeight: '500',
  },
  input: {
    marginBottom: 16,
    backgroundColor: globalStyles.colors.inputBackground,
  },
  bloodTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  bloodTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: globalStyles.colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  bloodTypeButtonSelected: {
    backgroundColor: globalStyles.colors.primary,
    borderColor: globalStyles.colors.primary,
  },
  bloodTypeText: {
    color: globalStyles.colors.text,
  },
  bloodTypeTextSelected: {
    color: globalStyles.colors.white,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
    width: '45%',
  },
  button: {
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: globalStyles.colors.primary,
  },
});

export default PatientProfileScreen;