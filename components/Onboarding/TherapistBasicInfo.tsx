import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { User, Phone, Briefcase, DollarSign } from 'lucide-react-native';
import { getCurrentUserData, getTherapistProfile, updateTherapistProfilePartial } from '../../API/settings/therapist_profile';

interface TherapistBasicData {
  first_name: string;
  last_name: string;
  phone_number: string;
  bio: string;
  specializations: string[];
  years_of_experience: number;
  treatment_approaches: string[];
  languages: string[];
  hourly_rate: string;
  accepts_insurance: boolean;
  insurance_providers: string[];
  session_duration: number;
}

// Updated TherapistProfile to match the one in therapist_profile.ts
interface TherapistProfile {
  id?: string | number;
  user?: string | number;
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  phone_number?: string;
  bio?: string;
  specializations?: string[];
  experience?: string;
  years_of_experience?: number;
  license_number?: string;
  license_expiry?: string;
  profile_picture?: string;
  treatment_approaches?: string[];
  languages?: string[];
  rating?: number;
  total_ratings?: number;
  total_sessions?: number;
  profile_completion?: number;
  is_verified?: boolean;
  verification_status?: string;
  hourly_rate?: string | number;
  accepts_insurance?: boolean;
  insurance_providers?: string; // Changed to string only, not string[]
  session_duration?: number;
  name?: string;
  phone?: string;
  specialization?: string | string[];
  availability?: any;
  [key: string]: any;
}

interface TherapistBasicInfoProps {
  onNext: (data: TherapistBasicData) => void;
  onBack: () => void;
  currentUser?: any;
}

const SPECIALIZATIONS = [
  { value: "anxiety_disorders", label: "Anxiety Disorders" },
  { value: "depressive_disorders", label: "Depressive Disorders" },
  { value: "bipolar_disorders", label: "Bipolar Disorders" },
  { value: "eating_disorders", label: "Eating Disorders" },
  { value: "ocd", label: "Obsessive-Compulsive Disorders" },
  { value: "trauma_ptsd", label: "Trauma and PTSD" },
  { value: "personality_disorders", label: "Personality Disorders" },
  { value: "substance_abuse", label: "Substance Abuse" },
  { value: "child_adolescent", label: "Child & Adolescent Issues" },
  { value: "relationship_couples", label: "Relationship/Couples Therapy" },
  { value: "grief_loss", label: "Grief and Loss" },
  { value: "stress_management", label: "Stress Management" },
  { value: "life_coaching", label: "Life Coaching" },
];

const TREATMENT_APPROACHES = [
  { value: "CBT", label: "Cognitive Behavioral Therapy" },
  { value: "DBT", label: "Dialectical Behavior Therapy" },
  { value: "Psychodynamic", label: "Psychodynamic Therapy" },
  { value: "Humanistic", label: "Humanistic Therapy" },
  { value: "EMDR", label: "EMDR" },
  { value: "Family_Systems", label: "Family Systems Therapy" },
];

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Chinese", 
  "Japanese", "Korean", "Italian", "Portuguese", 
  "Russian", "Arabic"
];

const INSURANCE_PROVIDERS = [
  "Blue Cross Blue Shield", "Aetna", "Cigna", "UnitedHealth", 
  "Humana", "Kaiser Permanente", "Anthem", "Medicaid", "Medicare"
];

const TherapistBasicInfo: React.FC<TherapistBasicInfoProps> = ({ onNext, onBack, currentUser }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [formData, setFormData] = useState<TherapistBasicData>({
    first_name: currentUser?.first_name || '',
    last_name: currentUser?.last_name || '',
    phone_number: currentUser?.phone_number || '',
    bio: '',
    specializations: [],
    years_of_experience: 0,
    treatment_approaches: [],
    languages: [],
    hourly_rate: '',
    accepts_insurance: false,
    insurance_providers: [],
    session_duration: 60,
  });
  const [profileId, setProfileId] = useState<string | number | null>(null);

  // Fetch therapist profile on component mount
  useEffect(() => {
    const fetchTherapistProfile = async () => {
      try {
        setLoading(true);
        
        // First get user data to confirm profile ID
        const userData = await getCurrentUserData();
        console.log('User data fetched:', userData.id);
        
        if (userData?.therapist_profile?.id) {
          setProfileId(userData.therapist_profile.id);
          
          // Then fetch the complete therapist profile
          const profile = await getTherapistProfile();
          console.log('Therapist profile fetched:', profile.id);
          
          // Pre-populate form with existing data
          setFormData(prevData => ({
            ...prevData,
            first_name: profile.first_name || prevData.first_name,
            last_name: profile.last_name || prevData.last_name,
            phone_number: profile.phone_number || prevData.phone_number,
            bio: profile.bio || prevData.bio,
            specializations: profile.specializations || prevData.specializations,
            years_of_experience: profile.years_of_experience || prevData.years_of_experience,
            treatment_approaches: profile.treatment_approaches || prevData.treatment_approaches,
            languages: profile.languages || prevData.languages,
            hourly_rate: profile.hourly_rate?.toString() || prevData.hourly_rate,
            accepts_insurance: profile.accepts_insurance || prevData.accepts_insurance,
            insurance_providers: profile.insurance_providers 
              ? (Array.isArray(profile.insurance_providers) 
                 ? profile.insurance_providers
                 : [profile.insurance_providers]) 
              : prevData.insurance_providers,
            session_duration: profile.session_duration || prevData.session_duration,
          }));
        }
      } catch (error) {
        console.error('Error fetching therapist profile:', error);
        Alert.alert(
          'Profile Error',
          'Could not load your profile information. You can continue with blank form.',
          [{ text: 'OK' }]
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTherapistProfile();
  }, []);

  const handleNext = async () => {
    if (!formData.first_name || !formData.last_name || !formData.phone_number) {
      Alert.alert('Required Fields', 'Please fill in all required fields.');
      return;
    }

    try {
      setSaving(true);
      console.log('Saving therapist basic info:', formData);
      
      // Format the data according to the API's expected structure for PATCH requests
      const apiData: Partial<TherapistProfile> = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        bio: formData.bio,
        // Keep arrays as arrays for these fields according to API documentation
        specializations: formData.specializations,
        treatment_approaches: formData.treatment_approaches,
        languages: formData.languages, 
        years_of_experience: formData.years_of_experience,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : undefined,
        accepts_insurance: formData.accepts_insurance,
        // Convert insurance_providers to string as required by the TherapistProfile interface
        insurance_providers: formData.accepts_insurance && formData.insurance_providers.length > 0 
          ? formData.insurance_providers.join(',') 
          : '',
        session_duration: formData.session_duration
      };
      
      // Update therapist profile using PATCH for partial updates
      await updateTherapistProfilePartial(apiData);
      
      // Continue with onboarding flow
      onNext(formData);
    } catch (error) {
      console.error('Error updating therapist profile:', error);
      Alert.alert('Error', 'Failed to save your information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof TherapistBasicData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: 'specializations' | 'treatment_approaches' | 'languages' | 'insurance_providers', value: string) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const renderMultiSelect = (
    title: string,
    field: 'specializations' | 'treatment_approaches' | 'languages' | 'insurance_providers',
    options: { value: string; label: string }[] | string[]
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.multiSelectContainer}>
        {options.map((option) => {
          const value = typeof option === 'string' ? option : option.value;
          const label = typeof option === 'string' ? option : option.label;
          const isSelected = (formData[field] as string[]).includes(value);
          
          return (
            <TouchableOpacity
              key={value}
              style={[styles.multiSelectItem, isSelected && styles.multiSelectItemSelected]}
              onPress={() => toggleArrayField(field, value)}
            >
              <Text style={[styles.multiSelectText, isSelected && styles.multiSelectTextSelected]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#002D62" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={true}
        bounces={true}
        alwaysBounceVertical={true}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{...styles.scrollContent, paddingBottom: 200}}
        scrollEventThrottle={16}
        onWheel={(e) => {
          // Handle mouse wheel scrolling events for web
        }}
      >
        <Text style={styles.title}>Professional Profile</Text>
        <Text style={styles.subtitle}>Complete your professional information</Text>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <User size={20} color="#002D62" />
            <TextInput
              style={styles.input}
              placeholder="First Name *"
              value={formData.first_name}
              onChangeText={(text) => updateField('first_name', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <User size={20} color="#002D62" />
            <TextInput
              style={styles.input}
              placeholder="Last Name *"
              value={formData.last_name}
              onChangeText={(text) => updateField('last_name', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Phone size={20} color="#002D62" />
            <TextInput
              style={styles.input}
              placeholder="Phone Number *"
              value={formData.phone_number}
              onChangeText={(text) => updateField('phone_number', text)}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.textAreaGroup}>
            <TextInput
              style={styles.textArea}
              placeholder="Professional biography"
              value={formData.bio}
              onChangeText={(text) => updateField('bio', text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Professional Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Information</Text>
          
          <View style={styles.inputGroup}>
            <Briefcase size={20} color="#002D62" />
            <TextInput
              style={styles.input}
              placeholder="Years of Experience"
              value={formData.years_of_experience.toString()}
              onChangeText={(text) => updateField('years_of_experience', parseInt(text) || 0)}
              keyboardType="numeric"
            />
          </View>
        </View>

        {renderMultiSelect(
          "Specializations",
          "specializations",
          SPECIALIZATIONS
        )}

        {renderMultiSelect(
          "Treatment Approaches",
          "treatment_approaches",
          TREATMENT_APPROACHES
        )}

        {renderMultiSelect(
          "Languages",
          "languages",
          LANGUAGES
        )}

        {/* Business Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Settings</Text>
          
          <View style={styles.inputGroup}>
            <DollarSign size={20} color="#002D62" />
            <TextInput
              style={styles.input}
              placeholder="Hourly Rate (USD)"
              value={formData.hourly_rate}
              onChangeText={(text) => updateField('hourly_rate', text)}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Briefcase size={20} color="#002D62" />
            <TextInput
              style={styles.input}
              placeholder="Session Duration (minutes)"
              value={formData.session_duration.toString()}
              onChangeText={(text) => updateField('session_duration', parseInt(text) || 60)}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={[styles.checkboxContainer, formData.accepts_insurance && styles.checkboxSelected]}
            onPress={() => updateField('accepts_insurance', !formData.accepts_insurance)}
          >
            <Text style={[styles.checkboxText, formData.accepts_insurance && styles.checkboxTextSelected]}>
              Accepts Insurance
            </Text>
          </TouchableOpacity>
        </View>

        {formData.accepts_insurance && renderMultiSelect(
          "Insurance Providers",
          "insurance_providers",
          INSURANCE_PROVIDERS
        )}

        {/* Buttons at the bottom */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={onBack} disabled={saving}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.nextButton, saving && styles.disabledButton]} 
            onPress={handleNext}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.nextButtonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    overflow: 'visible',  // Changed from 'hidden' to 'visible'
  },
  container: {
    flex: 1,
    backgroundColor: '#E4F0F6',
    width: '100%',
  },
  scrollContent: {
    padding: 20,
    // Increase padding bottom for more scroll space at the end
    paddingBottom: 200,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#002D62',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#002D62',
    marginBottom: 15,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 12,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  textAreaGroup: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  textArea: {
    fontSize: 16,
    color: '#333',
    minHeight: 100,
  },
  multiSelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  multiSelectItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  multiSelectItemSelected: {
    backgroundColor: '#002D62',
    borderColor: '#002D62',
  },
  multiSelectText: {
    fontSize: 14,
    color: '#333',
  },
  multiSelectTextSelected: {
    color: '#fff',
  },
  checkboxContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
  },
  checkboxSelected: {
    backgroundColor: '#002D62',
    borderColor: '#002D62',
  },
  checkboxText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  checkboxTextSelected: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 30,
    marginBottom: 50,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#002D62',
  },
  backButtonText: {
    color: '#002D62',
    fontWeight: 'bold',
    fontSize: 16,
  },
  nextButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#002D62',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E4F0F6',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#002D62',
  },
  disabledButton: {
    backgroundColor: '#88a3bd',
  },
});

export default TherapistBasicInfo;
