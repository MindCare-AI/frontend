import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, Switch, Alert, Modal, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import ThemedDateTimePicker from '../../components/common/ThemedDateTimePicker';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  getTherapistProfile, 
  updateTherapistProfile,
  uploadProfilePicture,
  THERAPIST_PROFILE_CONSTANTS
} from '../../API/settings/therapist_profile';
import { globalStyles } from '../../styles/global';

// Standardized input theme for consistency across the app
const inputTheme = {
  colors: {
    text: globalStyles.colors.text,
    placeholder: globalStyles.colors.textSecondary,
    onSurfaceVariant: globalStyles.colors.primary, // Label color
    background: globalStyles.colors.white
  }
};

// Define SettingsStackParamList since it's not exported from the module
type SettingsStackParamList = {
  TherapistProfile: undefined;
  // Add other screens in your settings stack as needed
};

// Add formatDate function since the module isn't found
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Define types for the profile and field errors
interface ProfileState {
  first_name: string;
  last_name: string;
  phone_number: string;
  bio: string;
  specializations: string[];
  experience: string;
  years_of_experience: number;
  license_number: string;
  license_expiry: string;
  treatment_approaches: string[];
  languages: string[];
  hourly_rate: string | number;
  accepts_insurance: boolean;
  insurance_providers: string;
  session_duration: number;
  showDatePicker?: boolean;
  showDurationModal?: boolean;
  [key: string]: any;
}

interface ReadOnlyFieldsState {
  username: string;
  email: string;
  rating: number;
  total_ratings: number;
  total_sessions: number;
  profile_completion: number;
  is_verified: boolean;
  verification_status: string;
  [key: string]: any;
}

interface FieldErrorsState {
  [key: string]: string | null;
}

type TherapistProfileScreenNavigationProp = StackNavigationProp<
  SettingsStackParamList,
  'TherapistProfile'
>;

const TherapistProfileScreen = () => {
  const navigation = useNavigation<TherapistProfileScreenNavigationProp>();
  
  // State definitions with proper types
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrorsState>({});
  
  const [profile, setProfile] = useState<ProfileState>({
    first_name: '',
    last_name: '',
    phone_number: '',
    bio: '',
    specializations: [],
    experience: '',
    years_of_experience: 0,
    license_number: '',
    license_expiry: '',
    treatment_approaches: [],
    languages: ['English'],
    hourly_rate: '',
    accepts_insurance: false,
    insurance_providers: '',
    session_duration: 60
  });
  
  // Read-only fields from API responses
  const [readOnlyFields, setReadOnlyFields] = useState<ReadOnlyFieldsState>({
    username: '',
    email: '',
    rating: 0,
    total_ratings: 0,
    total_sessions: 0,
    profile_completion: 0,
    is_verified: false,
    verification_status: 'pending'
  });
  
  const [profilePicture, setProfilePicture] = useState<any>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getTherapistProfile(); // No ID param needed
        
        // Extract read-only fields
        const { 
          username, email, rating, total_ratings, total_sessions, 
          profile_completion, is_verified, verification_status, 
          profile_picture, ...editableFields 
        } = data;
        
        // Convert to ProfileState with complete type safety
        const profileData: ProfileState = {
          ...profile, // Start with defaults
          ...editableFields, // Override with fetched data
          // Ensure required fields exist with defaults if not in data
          first_name: editableFields.first_name || '',
          last_name: editableFields.last_name || '',
          phone_number: editableFields.phone_number || '',
          experience: editableFields.experience || '',
          specializations: editableFields.specializations || [],
          treatment_approaches: editableFields.treatment_approaches || [],
          languages: editableFields.languages || ['English']
        };
        
        setProfile(profileData);
        setReadOnlyFields({ 
          username: username || '',
          email: email || '', 
          rating: rating || 0, 
          total_ratings: total_ratings || 0, 
          total_sessions: total_sessions || 0, 
          profile_completion: profile_completion || 0, 
          is_verified: is_verified || false, 
          verification_status: verification_status || 'pending'
        });
        
        // Set the profile picture URL (now it should be a full URL)
        if (profile_picture) {
          setProfilePictureUrl(profile_picture);
          console.log('Set profile picture URL:', profile_picture);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load therapist profile');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Update handleChange for React Native
  const handleChange = (name: string, value: any) => {
    if (name === 'accepts_insurance') {
      setProfile({ ...profile, [name]: value });
    } else if (name === 'years_of_experience') {
      // Ensure years_of_experience is a number between 0-100
      const numberValue = parseInt(value, 10);
      if (!isNaN(numberValue) && numberValue >= 0 && numberValue <= 100) {
        setProfile({ ...profile, [name]: numberValue });
      }
    } else {
      setProfile({ ...profile, [name]: value });
    }
    
    // Clear field error when user makes changes
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: null });
    }
  };

  const handleMultiSelect = (name: string, selectedValues: string[]) => {
    setProfile({ ...profile, [name]: selectedValues });
    
    // Clear field error when user makes changes
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: null });
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Fix: Use MediaTypeOptions
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        // Include extra info about the selected image
        exif: true,
      });

      if (!result.canceled) {
        // Enhance the image object with additional metadata needed for upload
        const selectedImage = {
          ...result.assets[0],
          fileName: `profile_${Date.now()}.jpg`,
          mimeType: 'image/jpeg'
        };
        
        console.log('Selected image:', selectedImage);
        
        setProfilePicture(selectedImage);
        setProfilePictureUrl(selectedImage.uri);
      }
    } catch (err) {
      console.error('Error picking image:', err);
      setError('Failed to select image. Please try again.');
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError(null);
      setFieldErrors({});
      
      // Update profile data first
      await updateTherapistProfile(profile);
      
      // If there's a new profile picture, upload it separately
      if (profilePicture) {
        try {
          const uploadResult = await uploadProfilePicture(profilePicture) as { profile_picture: string };
          console.log('Profile picture uploaded successfully:', uploadResult);
          
          // Update the profile picture URL with the new one
          if (uploadResult.profile_picture) {
            setProfilePictureUrl(uploadResult.profile_picture);
          }
        } catch (uploadError) {
          console.error('Profile picture upload failed:', uploadError);
          // Don't fail the entire operation if just the picture upload fails
          Alert.alert(
            'Partial Success', 
            'Profile updated successfully, but profile picture upload failed. Please try uploading the picture again.'
          );
          setSaving(false);
          return;
        }
      }
      
      setSaving(false);
      
      // Show success message
      Alert.alert('Success', 'Profile updated successfully!');
      
    } catch (err: unknown) {
      setSaving(false);
      
      // Type guard for Axios error with response data
      if (err && typeof err === 'object' && 'response' in err) {
        const errorObj = err as { response?: { data?: any } };
        // Handle field-specific errors
        if (errorObj.response && errorObj.response.data) {
          setFieldErrors(errorObj.response.data as FieldErrorsState);
          setError('Please correct the errors in the form');
        } else {
          setError('Failed to update profile. Please try again.');
        }
      } else {
        setError('Failed to update profile. Please try again.');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner visible={true} />;
  }
  
  return (
    <ScrollView style={styles.container}>
      <LoadingSpinner visible={saving} />
      <Text style={styles.title}>Edit Your Therapist Profile</Text>
      
      {error && <Text style={styles.errorMessage}>{error}</Text>}
      
      <View style={styles.profileCompletion}>
        <Text>Profile Completion:</Text>
        <View style={styles.progressBar}>
          <View 
            style={[styles.progress, { width: `${readOnlyFields.profile_completion}%` }]}
          />
        </View>
        <Text>{readOnlyFields.profile_completion}%</Text>
      </View>
      
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.profilePictureSection}>
          <View style={styles.profilePicture}>
            {profilePictureUrl ? (
              <Image source={{ uri: profilePictureUrl }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>No image</Text>
              </View>
            )}
          </View>
          
          <View style={styles.uploadControls}>
            <Text style={styles.label}>Profile Picture</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Text style={styles.uploadButtonText}>Choose Image</Text>
            </TouchableOpacity>
            {fieldErrors.profile_picture && (
              <Text style={styles.fieldError}>{fieldErrors.profile_picture}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>First Name*</Text>
          <TextInput
            style={styles.input}
            value={profile.first_name}
            onChangeText={(text) => handleChange('first_name', text)}
            maxLength={150}
            placeholderTextColor={inputTheme.colors.placeholder}
          />
          {fieldErrors.first_name && (
            <Text style={styles.fieldError}>{fieldErrors.first_name}</Text>
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Last Name*</Text>
          <TextInput
            style={styles.input}
            value={profile.last_name}
            onChangeText={(text) => handleChange('last_name', text)}
            maxLength={150}
            placeholderTextColor={inputTheme.colors.placeholder}
          />
          {fieldErrors.last_name && (
            <Text style={styles.fieldError}>{fieldErrors.last_name}</Text>
          )}
        </View>
        
        <View style={styles.formRow}>
          <View style={[styles.formGroup, styles.formGroupFlex]}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={readOnlyFields.username}
              editable={false}
            />
            <Text style={styles.smallText}>Username cannot be changed through this form</Text>
          </View>
          
          <View style={[styles.formGroup, styles.formGroupFlex]}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={readOnlyFields.email}
              editable={false}
            />
            <Text style={styles.smallText}>Email changes must be done through account settings</Text>
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number*</Text>
          <TextInput
            style={styles.input}
            value={profile.phone_number}
            onChangeText={(text) => handleChange('phone_number', text)}
            keyboardType="phone-pad"
            placeholderTextColor={inputTheme.colors.placeholder}
          />
          {fieldErrors.phone_number && (
            <Text style={styles.fieldError}>{fieldErrors.phone_number}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Professional Information</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Bio/About Me</Text>
          <TextInput
            style={styles.textarea}
            value={profile.bio}
            onChangeText={(text) => handleChange('bio', text)}
            multiline
            numberOfLines={5}
            placeholderTextColor={inputTheme.colors.placeholder}
          />
          {fieldErrors.bio && (
            <Text style={styles.fieldError}>{fieldErrors.bio}</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Years of Experience</Text>
          <TextInput
            style={styles.input}
            value={String(profile.years_of_experience)}
            onChangeText={(text) => handleChange('years_of_experience', text)}
            keyboardType="number-pad"
            placeholderTextColor={inputTheme.colors.placeholder}
          />
          {fieldErrors.years_of_experience && (
            <Text style={styles.fieldError}>{fieldErrors.years_of_experience}</Text>
          )}
        </View>
        
        <View style={styles.formGroup}>
          <MultiSelect
            label="Specializations"
            placeholder="Select specializations"
            options={Array.from(THERAPIST_PROFILE_CONSTANTS.SPECIALIZATION_CHOICES)}
            selectedValues={profile.specializations}
            onSelectionChange={(selected) => handleMultiSelect('specializations', selected)}
            error={fieldErrors.specializations}
          />
        </View>
        
        <View style={styles.formGroup}>
          <MultiSelect
            label="Treatment Approaches"
            placeholder="Select treatment approaches"
            options={Array.from(THERAPIST_PROFILE_CONSTANTS.TREATMENT_APPROACHES)}
            selectedValues={profile.treatment_approaches}
            onSelectionChange={(selected) => handleMultiSelect('treatment_approaches', selected)}
            error={fieldErrors.treatment_approaches}
          />
        </View>
        
        <View style={styles.formGroup}>
          <MultiSelect
            label="Languages"
            placeholder="Select languages you speak"
            options={Array.from(THERAPIST_PROFILE_CONSTANTS.LANGUAGES)}
            selectedValues={profile.languages}
            onSelectionChange={(selected) => handleMultiSelect('languages', selected)}
            error={fieldErrors.languages}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>License Number</Text>
          <TextInput
            style={styles.input}
            value={profile.license_number || ''}
            onChangeText={(text) => handleChange('license_number', text)}
            placeholderTextColor={inputTheme.colors.placeholder}
          />
          {fieldErrors.license_number && (
            <Text style={styles.fieldError}>{fieldErrors.license_number}</Text>
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>License Expiry Date</Text>
          <TouchableOpacity 
            style={[styles.input, styles.dateInput]}
            onPress={() => {
              handleChange('showDatePicker', true);
            }}
          >
            <Text>{profile.license_expiry ? formatDate(new Date(profile.license_expiry)) : 'Select Date'}</Text>
            <Ionicons name="calendar" size={20} color={globalStyles.colors.text} />
          </TouchableOpacity>
          {profile.showDatePicker && (
            <ThemedDateTimePicker
              value={profile.license_expiry ? new Date(profile.license_expiry) : new Date()}
              mode="date"
              onChange={(_, selectedDate) => {
                handleChange('showDatePicker', false);
                if (selectedDate) {
                  handleChange('license_expiry', selectedDate.toISOString().split('T')[0]);
                }
              }}
            />
          )}
          {fieldErrors.license_expiry && (
            <Text style={styles.fieldError}>{fieldErrors.license_expiry}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Session Information</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Hourly Rate ($)</Text>
          <TextInput
            style={styles.input}
            value={profile.hourly_rate ? String(profile.hourly_rate) : ''}
            onChangeText={(text) => handleChange('hourly_rate', text)}
            keyboardType="decimal-pad"
            placeholder="Enter your hourly rate"
            placeholderTextColor={inputTheme.colors.placeholder}
          />
          {fieldErrors.hourly_rate && (
            <Text style={styles.fieldError}>{fieldErrors.hourly_rate}</Text>
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Session Duration</Text>
          <TouchableOpacity 
            style={styles.multiSelectButton}
            onPress={() => handleChange('showDurationModal', true)}
          >
            <Text>
              {THERAPIST_PROFILE_CONSTANTS.SESSION_DURATION_OPTIONS.find(
                option => option.value === profile.session_duration
              )?.label || 'Select duration'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={globalStyles.colors.text} />
          </TouchableOpacity>
          {fieldErrors.session_duration && (
            <Text style={styles.fieldError}>{fieldErrors.session_duration}</Text>
          )}
          
          <Modal
            visible={profile.showDurationModal || false}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Session Duration</Text>
                  <TouchableOpacity onPress={() => handleChange('showDurationModal', false)}>
                    <Ionicons name="close" size={24} color={globalStyles.colors.text} />
                  </TouchableOpacity>
                </View>
                
                <FlatList
                  data={THERAPIST_PROFILE_CONSTANTS.SESSION_DURATION_OPTIONS}
                  keyExtractor={(item) => item.value.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={styles.optionItem}
                      onPress={() => {
                        handleChange('session_duration', item.value);
                        handleChange('showDurationModal', false);
                      }}
                    >
                      <Text style={styles.optionText}>{item.label}</Text>
                      {profile.session_duration === item.value && (
                        <Ionicons name="checkmark" size={22} color={globalStyles.colors.primary} />
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </Modal>
        </View>
        
        <View style={styles.formGroup}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Accept Insurance</Text>
            <Switch
              value={profile.accepts_insurance}
              onValueChange={(value) => handleChange('accepts_insurance', value)}
            />
          </View>
          
          {profile.accepts_insurance && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Insurance Providers</Text>
              <TextInput
                style={styles.textarea}
                value={profile.insurance_providers}
                onChangeText={(text) => handleChange('insurance_providers', text)}
                multiline
                numberOfLines={3}
                placeholder="List insurance providers you accept (separated by commas)"
                placeholderTextColor={inputTheme.colors.placeholder}
              />
              {fieldErrors.insurance_providers && (
                <Text style={styles.fieldError}>{fieldErrors.insurance_providers}</Text>
              )}
            </View>
          )}
        </View>
      </View>
      
      {readOnlyFields.verification_status !== 'verified' && (
        <View style={styles.verificationNotice}>
          <Text>Your profile is currently <Text style={styles.boldText}>{readOnlyFields.verification_status}</Text>.</Text>
          <Text>Once you complete your profile, our team will verify your credentials.</Text>
        </View>
      )}
      
      <View style={styles.formActions}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton, saving && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={saving}
        >
          <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Save Profile'}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// MultiSelect component for handling selections like specializations, treatments, languages
const MultiSelect = ({ 
  options,
  selectedValues,
  onSelectionChange,
  placeholder,
  label,
  error
}: {
  options: string[];
  selectedValues: string[];
  onSelectionChange: (selected: string[]) => void;
  placeholder: string;
  label: string;
  error?: string | null;
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  const toggleSelection = (item: string) => {
    const newSelection = selectedValues.includes(item)
      ? selectedValues.filter(i => i !== item)
      : [...selectedValues, item];
    
    onSelectionChange(newSelection);
  };
  
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      
      <TouchableOpacity 
        style={styles.multiSelectButton} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={selectedValues.length ? styles.multiSelectValue : styles.multiSelectPlaceholder}>
          {selectedValues.length ? `${selectedValues.length} items selected` : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={globalStyles.colors.text} />
      </TouchableOpacity>
      
      {selectedValues.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.selectedChipsContainer}
        >
          {selectedValues.map((value) => (
            <View key={value} style={styles.selectedChip}>
              <Text style={styles.selectedChipText}>{value}</Text>
              <TouchableOpacity onPress={() => toggleSelection(value)}>
                <Ionicons name="close-circle" size={18} color={globalStyles.colors.text} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
      
      {error && <Text style={styles.fieldError}>{error}</Text>}
      
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{`Select ${label}`}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={globalStyles.colors.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.optionItem}
                  onPress={() => toggleSelection(item)}
                >
                  <Text style={styles.optionText}>{item}</Text>
                  {selectedValues.includes(item) && (
                    <Ionicons name="checkmark" size={22} color={globalStyles.colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: globalStyles.colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: globalStyles.colors.text,
    marginBottom: 20,
  },
  formSection: {
    backgroundColor: globalStyles.colors.backgroundLight,
    padding: 20,
    borderRadius: 8,
    marginBottom: 25,
    shadowColor: globalStyles.colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: globalStyles.colors.text,
  },
  formRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
    marginBottom: 15,
  },
  formGroup: {
    marginBottom: 20,
  },
  formGroupFlex: {
    flex: 1,
    marginHorizontal: 5,
    minWidth: 200,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    color: globalStyles.colors.text,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: globalStyles.colors.border,
    borderRadius: 4,
    fontSize: 16,
    color: globalStyles.colors.text,
    backgroundColor: globalStyles.colors.white,
  },
  textarea: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: globalStyles.colors.border,
    borderRadius: 4,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    color: globalStyles.colors.text,
    backgroundColor: globalStyles.colors.white,
  },
  disabledInput: {
    backgroundColor: globalStyles.colors.neutralLight,
    color: globalStyles.colors.textSecondary,
  },
  fieldError: {
    color: globalStyles.colors.error,
    fontSize: 14,
    marginTop: 5,
  },
  errorMessage: {
    backgroundColor: globalStyles.colors.neutralLight,
    color: globalStyles.colors.error,
    padding: 10,
    borderRadius: 4,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: globalStyles.colors.error,
  },
  profilePictureSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: globalStyles.colors.neutralLight,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: globalStyles.colors.textSecondary,
    fontSize: 14,
  },
  uploadControls: {
    flex: 1,
    marginLeft: 20,
  },
  uploadButton: {
    backgroundColor: globalStyles.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  smallText: {
    color: globalStyles.colors.textSecondary,
    fontSize: 12,
    marginTop: 5,
  },
  profileCompletion: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  progressBar: {
    height: 10,
    backgroundColor: globalStyles.colors.neutralLight,
    borderRadius: 5,
    marginHorizontal: 10,
    overflow: 'hidden',
    flex: 1,
  },
  progress: {
    height: '100%',
    backgroundColor: globalStyles.colors.success,
  },
  verificationNotice: {
    backgroundColor: globalStyles.colors.neutralLight,
    padding: 15,
    borderRadius: 4,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: globalStyles.colors.accent,
  },
  boldText: {
    fontWeight: 'bold',
  },
  formActions: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 30,
    marginBottom: 40,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: globalStyles.colors.primary,
  },
  primaryButtonText: {
    color: globalStyles.colors.white,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: globalStyles.colors.backgroundLight,
  },
  secondaryButtonText: {
    color: globalStyles.colors.text,
  },
  disabledButton: {
    opacity: 0.7,
  },
  checkboxGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 8,
  },
  multiSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderWidth: 1,
    borderColor: globalStyles.colors.border,
    borderRadius: 4,
    marginBottom: 10,
    backgroundColor: globalStyles.colors.white,
  },
  multiSelectValue: {
    fontSize: 16,
    color: globalStyles.colors.text,
  },
  multiSelectPlaceholder: {
    fontSize: 16,
    color: globalStyles.colors.textSecondary,
  },
  selectedChipsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: globalStyles.colors.primaryLight,
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  selectedChipText: {
    marginRight: 5,
    color: globalStyles.colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(74, 144, 226, 0.3)', // Use primary color with opacity
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: globalStyles.colors.white,
    borderRadius: 8,
    padding: 20,
    maxHeight: '80%',
    shadowColor: globalStyles.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: globalStyles.colors.text,
  },
  modalFooter: {
    marginTop: 15,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: globalStyles.colors.border,
  },
  optionText: {
    fontSize: 16,
    color: globalStyles.colors.text,
  },
  modalButton: {
    backgroundColor: globalStyles.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 20,
  },
  modalButtonText: {
    color: globalStyles.colors.white,
    fontWeight: 'bold',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default TherapistProfileScreen;