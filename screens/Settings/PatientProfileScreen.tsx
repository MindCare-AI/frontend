import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Text,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { TextInput, Button, HelperText, RadioButton, IconButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  getPatientProfile, 
  updatePatientProfile, 
  patchPatientProfile_pic, 
  uploadPatientProfilePicture, 
  PatientProfile 
} from '../../API/settings/patient_profile';
import UserAvatarCard from '../../components/ui/UserAvatarCard';
import SectionHeader from '../../components/ui/SectionHeader';
import { globalStyles } from '../../styles/global';
import { SettingsStackParamList } from '../../types/navigation';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<SettingsStackParamList>;

const PatientProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [formData, setFormData] = useState<Partial<PatientProfile>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // New state for emergency contact section
  const [showEmergencyContact, setShowEmergencyContact] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState<{
    name?: string;
    phone?: string;
    relation?: string;
    email?: string;
  }>({});

  // New state for profile picture handling
  const [profilePicture, setProfilePicture] = useState<any>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchPatientProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      // Ensure date_of_birth is properly included in formData
      setFormData({
        ...profile,
        date_of_birth: profile.date_of_birth || ''
      });
      
      // Log the date of birth for debugging
      console.log('Profile loaded with DOB:', profile.date_of_birth);
      
      // Set the profile picture URL if available
      if (profile.profile_pic) {
        setProfilePictureUrl(profile.profile_pic);
      }
      
      // Initialize emergency contact section
      if (profile.emergency_contact && 
         (profile.emergency_contact.name || 
          profile.emergency_contact.phone || 
          profile.emergency_contact.relation || 
          profile.emergency_contact.email)) {
        setEmergencyContact({
          name: profile.emergency_contact.name || '',
          phone: profile.emergency_contact.phone || '',
          relation: profile.emergency_contact.relation || '',
          email: profile.emergency_contact.email || '',
        });
        setShowEmergencyContact(true);
      }
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

  const handleEmergencyContactChange = (field: string, value: string) => {
    setEmergencyContact(prev => ({ ...prev, [field]: value }));
    
    // Clear error for the emergency contact field if exists
    if (errors[`emergency_contact_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`emergency_contact_${field}`];
        return newErrors;
      });
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // Always hide the date picker first to prevent UI glitches
    setShowDatePicker(false);
    
    // Only proceed if a date was selected
    if (selectedDate) {
      // Format date as YYYY-MM-DD string
      const dateString = selectedDate.toISOString().split('T')[0];
      
      // Update formData state with the new date
      handleChange('date_of_birth', dateString);
      
      // Log for debugging
      console.log('Selected date:', dateString);
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
    if (showEmergencyContact) {
      if (!emergencyContact.name?.trim()) {
        newErrors.emergency_contact_name = 'Emergency contact name is required';
      } else if (emergencyContact.name.length > 100) {
        newErrors.emergency_contact_name = 'Name cannot exceed 100 characters';
      }
      
      if (!emergencyContact.phone?.trim()) {
        newErrors.emergency_contact_phone = 'Emergency contact phone is required';
      } else {
        const phoneRegex = /^[+]?[0-9]{7,15}$/;
        if (!phoneRegex.test(emergencyContact.phone)) {
          newErrors.emergency_contact_phone = 'Phone number should contain only digits and may start with +';
        }
      }
      
      if (emergencyContact.email && !emergencyContact.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        newErrors.emergency_contact_email = 'Please enter a valid email address';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (validateForm()) {
      try {
        setIsSaving(true);
        
        // Build emergency contact object if shown
        const emergencyContactData = showEmergencyContact ? {
          name: emergencyContact.name,
          phone: emergencyContact.phone,
          relation: emergencyContact.relation,
          email: emergencyContact.email,
          length: 1,  // Add required length property
        } : undefined;
        
        // Only include the fields expected by the API
        const updateData: Partial<PatientProfile> = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number,
          blood_type: formData.blood_type,
          gender: formData.gender,
          date_of_birth: formData.date_of_birth,
          emergency_contact: emergencyContactData,
        };
        
        await updatePatientProfile(updateData);
        
        // Update local state
        const updatedProfile = {
          ...formData,
          emergency_contact: emergencyContactData,
        };
        
        setProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
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

  // Add the image picker function
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        exif: true,
      });

      if (!result.canceled) {
        // Enhance the image object with additional metadata needed for upload
        const selectedImage = {
          ...result.assets[0],
          fileName: `patient_profile_${Date.now()}.jpg`,
          mimeType: 'image/jpeg'
        };
        
        console.log('Selected image:', selectedImage);
        
        setProfilePicture(selectedImage);
        setProfilePictureUrl(selectedImage.uri);
        
        // Upload the image immediately
        handleProfilePictureUpload(selectedImage);
      }
    } catch (err) {
      console.error('Error picking image:', err);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  // Add function to handle profile picture upload
  const handleProfilePictureUpload = async (imageData: any) => {
    if (!imageData) return;
    
    try {
      setUploadingImage(true);
      
      // Use the dedicated function for uploading profile pictures
      const updatedProfile = await uploadPatientProfilePicture(imageData);
      
      // Update profile state with the new profile pic URL
      if (updatedProfile.profile_pic) {
        setProfilePictureUrl(updatedProfile.profile_pic);
        setProfile(prev => prev ? { ...prev, profile_pic: updatedProfile.profile_pic } : null);
      }
      
      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      Alert.alert('Error', 'Failed to upload profile picture. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const showDatePickerHandler = () => {
    setShowDatePicker(true);
  };

  const bloodTypeOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genderOptions = [
    { label: 'Male', value: 'M' },
    { label: 'Female', value: 'F' },
    { label: 'Other', value: 'O' },
    { label: 'Prefer not to say', value: 'N' },
  ];
  
  const relationshipOptions = [
    'Parent', 'Sibling', 'Child', 'Spouse', 'Friend', 'Caregiver', 'Other'
  ];

  if (isLoading) {
    return <LoadingSpinner visible={true} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <LoadingSpinner visible={isSaving} />
      <ScrollView style={styles.scrollContainer}>
        {profile && (
          <>
            <UserAvatarCard
              avatar={profilePictureUrl}
              name={profile ? `${profile.first_name} ${profile.last_name}` : ''}
              role="Patient"
              onAvatarChange={(newAvatarUri) => {
                const selectedImage = {
                  uri: newAvatarUri,
                  fileName: `patient_profile_${Date.now()}.jpg`,
                  mimeType: 'image/jpeg'
                };
                setProfilePicture(selectedImage);
                setProfilePictureUrl(newAvatarUri);
                handleProfilePictureUpload(selectedImage);
              }}
            />

            <View style={styles.section}>
              <SectionHeader title="Patient Information" />
              
              <Text style={styles.label}>Basic Information</Text>
              
              <TextInput
                label="First Name"
                value={formData.first_name || ''}
                onChangeText={(value) => handleChange('first_name', value)}
                style={[styles.input, styles.inputText]}
                mode="outlined"
                disabled={isSaving}
                error={!!errors.first_name}
                outlineColor={globalStyles.colors.border}
                activeOutlineColor={globalStyles.colors.primary}
                theme={{ 
                  colors: { 
                    text: globalStyles.colors.text, 
                    placeholder: globalStyles.colors.neutralLight,
                    onSurfaceVariant: globalStyles.colors.text // This affects label color
                  } 
                }}
              />
              {errors.first_name && <HelperText type="error">{errors.first_name}</HelperText>}
              
              <TextInput
                label="Last Name"
                value={formData.last_name || ''}
                onChangeText={(value) => handleChange('last_name', value)}
                style={[styles.input, styles.inputText]}
                mode="outlined"
                disabled={isSaving}
                error={!!errors.last_name}
                outlineColor={globalStyles.colors.border}
                activeOutlineColor={globalStyles.colors.primary}
                theme={{ 
                  colors: { 
                    text: globalStyles.colors.text, 
                    placeholder: globalStyles.colors.neutralLight,
                    onSurfaceVariant: globalStyles.colors.text // This affects label color
                  } 
                }}
              />
              {errors.last_name && <HelperText type="error">{errors.last_name}</HelperText>}
              
              <TextInput
                label="Phone Number"
                value={formData.phone_number || ''}
                onChangeText={(value) => handleChange('phone_number', value)}
                keyboardType="phone-pad"
                style={[styles.input, styles.inputText]}
                mode="outlined"
                disabled={isSaving}
                error={!!errors.phone_number}
                outlineColor={globalStyles.colors.border}
                activeOutlineColor={globalStyles.colors.primary}
                theme={{ 
                  colors: { 
                    text: globalStyles.colors.text, 
                    placeholder: globalStyles.colors.neutralLight,
                    onSurfaceVariant: globalStyles.colors.text // This affects label color
                  } 
                }}
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
                      <Text style={styles.radioLabel}>{option.label}</Text>
                    </View>
                  ))}
                </View>
              </RadioButton.Group>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Date of Birth</Text>
                <TouchableOpacity 
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}
                  disabled={isSaving}
                >
                  <Text style={styles.dateInputText}>
                    {formData.date_of_birth || 'Select Date'}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#000000" />
                </TouchableOpacity>
                {errors.date_of_birth && <HelperText type="error">{errors.date_of_birth}</HelperText>}
              </View>
              
              {/* Keep DateTimePicker outside of the TouchableOpacity for correct rendering */}
              {showDatePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={formData.date_of_birth ? new Date(formData.date_of_birth) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      const formattedDate = selectedDate.toISOString().split('T')[0];
                      handleChange('date_of_birth', formattedDate);
                      console.log('Date selected:', formattedDate);
                    }
                  }}
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
              
              <View style={styles.emergencyContactSection}>
                <SectionHeader title="Emergency Contact" />
                
                {!showEmergencyContact ? (
                  <Button 
                    mode="outlined" 
                    icon="plus" 
                    onPress={() => setShowEmergencyContact(true)}
                    style={styles.addEmergencyButton}
                    disabled={isSaving}
                  >
                    Add Emergency Contact
                  </Button>
                ) : (
                  <View style={styles.emergencyContactForm}>
                    <View style={styles.formHeader}>
                      <Text style={styles.formTitle}>Emergency Contact Details</Text>
                      <IconButton
                        icon="close"
                        size={20}
                        onPress={() => {
                          setShowEmergencyContact(false);
                          setEmergencyContact({});
                        }}
                        disabled={isSaving}
                      />
                    </View>
                    
                    <TextInput
                      label="Name"
                      value={emergencyContact.name || ''}
                      onChangeText={(value) => handleEmergencyContactChange('name', value)}
                      style={[styles.input, styles.inputText]}
                      mode="outlined"
                      disabled={isSaving}
                      error={!!errors.emergency_contact_name}
                      outlineColor={globalStyles.colors.border}
                      activeOutlineColor={globalStyles.colors.primary}
                      theme={{ colors: { text: globalStyles.colors.text, placeholder: globalStyles.colors.neutralLight } }}
                    />
                    {errors.emergency_contact_name && <HelperText type="error">{errors.emergency_contact_name}</HelperText>}
                    
                    <TextInput
                      label="Phone Number"
                      value={emergencyContact.phone || ''}
                      onChangeText={(value) => handleEmergencyContactChange('phone', value)}
                      keyboardType="phone-pad"
                      style={[styles.input, styles.inputText]}
                      mode="outlined"
                      disabled={isSaving}
                      error={!!errors.emergency_contact_phone}
                      outlineColor={globalStyles.colors.border}
                      activeOutlineColor={globalStyles.colors.primary}
                      theme={{ colors: { text: globalStyles.colors.text, placeholder: globalStyles.colors.neutralLight } }}
                    />
                    {errors.emergency_contact_phone && <HelperText type="error">{errors.emergency_contact_phone}</HelperText>}
                    
                    <TextInput
                      label="Email"
                      value={emergencyContact.email || ''}
                      onChangeText={(value) => handleEmergencyContactChange('email', value)}
                      keyboardType="email-address"
                      style={[styles.input, styles.inputText]}
                      mode="outlined"
                      disabled={isSaving}
                      error={!!errors.emergency_contact_email}
                      outlineColor={globalStyles.colors.border}
                      activeOutlineColor={globalStyles.colors.primary}
                      theme={{ colors: { text: globalStyles.colors.text, placeholder: globalStyles.colors.neutralLight } }}
                    />
                    {errors.emergency_contact_email && <HelperText type="error">{errors.emergency_contact_email}</HelperText>}
                    
                    <Text style={styles.label}>Relationship</Text>
                    <View style={styles.relationshipContainer}>
                      {relationshipOptions.map((relation) => (
                        <TouchableOpacity
                          key={relation}
                          style={[
                            styles.relationButton,
                            emergencyContact.relation === relation && styles.relationButtonSelected
                          ]}
                          onPress={() => handleEmergencyContactChange('relation', relation)}
                          disabled={isSaving}
                        >
                          <Text style={[
                            styles.relationText,
                            emergencyContact.relation === relation && styles.relationTextSelected
                          ]}>
                            {relation}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>
              
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
  inputText: {
    color: '#000000', // Explicitly set to black
    fontSize: 16, 
    fontWeight: '500',
  },
  datePickerButton: {
    width: '100%',
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
  radioLabel: {
    color: globalStyles.colors.text,
    fontSize: 16,
  },
  button: {
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: globalStyles.colors.primary,
  },
  emergencyContactSection: {
    marginTop: 16,
  },
  addEmergencyButton: {
    marginVertical: 12,
    borderColor: globalStyles.colors.primary,
    borderWidth: 1,
  },
  emergencyContactForm: {
    backgroundColor: globalStyles.colors.backgroundLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: globalStyles.colors.text,
  },
  relationshipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  relationButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: globalStyles.colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  relationButtonSelected: {
    backgroundColor: globalStyles.colors.primary,
    borderColor: globalStyles.colors.primary,
  },
  relationText: {
    color: globalStyles.colors.text,
  },
  relationTextSelected: {
    color: globalStyles.colors.white,
  },
  formGroup: {
    marginBottom: 20,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: globalStyles.colors.white,
    borderWidth: 1,
    borderColor: globalStyles.colors.border,
    borderRadius: 4,
    marginBottom: 16,
  },
  dateInputText: {
    color: '#000000', // Explicitly set to black
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PatientProfileScreen;