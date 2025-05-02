import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Chip, IconButton, Text } from 'react-native-paper';
import { SectionHeader } from './SectionHeader';
import { globalStyles } from '../../styles/global';
import { Education, TherapistProfile } from '../../API/settings/therapist';

interface TherapistInfoFormProps {
  initialData: Partial<TherapistProfile>;
  onSave: (data: Partial<TherapistProfile>) => Promise<void>;
  loading?: boolean;
}

export const TherapistInfoForm: React.FC<TherapistInfoFormProps> = ({
  initialData,
  onSave,
  loading = false,
}) => {
  const [profileData, setProfileData] = useState<Partial<TherapistProfile>>(initialData);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newEducation, setNewEducation] = useState<Partial<Education>>({
    degree: '',
    institution: '',
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    setProfileData(initialData);
  }, [initialData]);

  const handleChange = <K extends keyof TherapistProfile>(field: K, value: TherapistProfile[K]) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleRatesChange = (field: keyof NonNullable<TherapistProfile['rates']>, value: any) => {
    setProfileData(prev => ({
      ...prev,
      rates: {
        ...(prev.rates || {}),
        [field]: field === 'hourly' ? parseFloat(value) : value,
      },
    }));
  };

  const addSpecialty = () => {
    if (newSpecialty.trim()) {
      const updatedSpecialties = [...(profileData.specialties || []), newSpecialty.trim()];
      handleChange('specialties', updatedSpecialties);
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    const updatedSpecialties = (profileData.specialties || []).filter(s => s !== specialty);
    handleChange('specialties', updatedSpecialties);
  };

  const addLanguage = () => {
    if (newLanguage.trim()) {
      const updatedLanguages = [...(profileData.languages || []), newLanguage.trim()];
      handleChange('languages', updatedLanguages);
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    const updatedLanguages = (profileData.languages || []).filter(l => l !== language);
    handleChange('languages', updatedLanguages);
  };

  const addEducation = () => {
    if (newEducation.degree && newEducation.institution) {
      const updatedEducation = [
        ...(profileData.education || []),
        {
          degree: newEducation.degree,
          institution: newEducation.institution,
          year: newEducation.year || new Date().getFullYear(),
        } as Education,
      ];
      handleChange('education', updatedEducation);
      setNewEducation({
        degree: '',
        institution: '',
        year: new Date().getFullYear(),
      });
    }
  };

  const removeEducation = (index: number) => {
    const updatedEducation = (profileData.education || []).filter((_, i) => i !== index);
    handleChange('education', updatedEducation);
  };

  const handleSubmit = async () => {
    try {
      await onSave(profileData);
    } catch (error) {
      console.error('Error saving therapist profile:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <SectionHeader 
        title="Professional Information" 
        description="Details about your professional background" 
      />

      <TextInput
        label="Professional Title"
        value={profileData.title || ''}
        onChangeText={(value) => handleChange('title', value)}
        style={styles.input}
        mode="outlined"
        disabled={loading}
        placeholder="e.g. Licensed Clinical Psychologist"
      />

      <TextInput
        label="Professional Bio"
        value={profileData.bio || ''}
        onChangeText={(value) => handleChange('bio', value)}
        style={styles.input}
        mode="outlined"
        multiline
        numberOfLines={4}
        disabled={loading}
        placeholder="Briefly describe your background and approach to therapy"
      />

      <TextInput
        label="Years of Experience"
        value={profileData.experience?.toString() || ''}
        onChangeText={(value) => {
          const numValue = parseInt(value);
          if (!isNaN(numValue) || value === '') {
            handleChange('experience', value === '' ? undefined : numValue);
          }
        }}
        keyboardType="number-pad"
        style={styles.input}
        mode="outlined"
        disabled={loading}
      />

      <SectionHeader title="Education" description="Add your academic qualifications" />

      <View style={styles.educationForm}>
        <TextInput
          label="Degree"
          value={newEducation.degree}
          onChangeText={(value) => setNewEducation(prev => ({ ...prev, degree: value }))}
          style={[styles.input, styles.educationInput]}
          mode="outlined"
          disabled={loading}
          placeholder="e.g. Ph.D. in Psychology"
        />

        <TextInput
          label="Institution"
          value={newEducation.institution}
          onChangeText={(value) => setNewEducation(prev => ({ ...prev, institution: value }))}
          style={[styles.input, styles.educationInput]}
          mode="outlined"
          disabled={loading}
          placeholder="e.g. Stanford University"
        />

        <View style={styles.educationYearContainer}>
          <TextInput
            label="Year"
            value={newEducation.year?.toString() || ''}
            onChangeText={(value) => {
              const numValue = parseInt(value);
              if (!isNaN(numValue) || value === '') {
                setNewEducation(prev => ({ 
                  ...prev, 
                  year: value === '' ? undefined : numValue 
                }));
              }
            }}
            keyboardType="number-pad"
            style={[styles.input, styles.educationYearInput]}
            mode="outlined"
            disabled={loading}
          />

          <IconButton
            icon="plus"
            size={24}
            onPress={addEducation}
            disabled={!newEducation.degree || !newEducation.institution || loading}
            style={styles.addButton}
          />
        </View>
      </View>

      <View style={styles.educationList}>
        {(profileData.education || []).map((edu, index) => (
          <View key={`edu-${index}`} style={styles.educationItem}>
            <View style={styles.educationDetails}>
              <Text style={styles.educationDegree}>{edu.degree}</Text>
              <Text style={styles.educationInstitution}>{edu.institution}, {edu.year}</Text>
            </View>
            <IconButton
              icon="close"
              size={20}
              onPress={() => removeEducation(index)}
              disabled={loading}
            />
          </View>
        ))}
      </View>

      <SectionHeader title="Specialties" description="Areas of therapeutic expertise" />

      <View style={styles.tagInputContainer}>
        <TextInput
          label="Add Specialty"
          value={newSpecialty}
          onChangeText={setNewSpecialty}
          style={styles.tagInput}
          mode="outlined"
          disabled={loading}
          right={
            <TextInput.Icon 
              icon="plus" 
              onPress={addSpecialty} 
              disabled={!newSpecialty.trim() || loading} 
            />
          }
          onSubmitEditing={addSpecialty}
          placeholder="e.g. Anxiety, Depression"
        />
      </View>

      <View style={styles.chipContainer}>
        {(profileData.specialties || []).map((specialty, index) => (
          <Chip
            key={`specialty-${index}`}
            style={styles.chip}
            onClose={() => removeSpecialty(specialty)}
            disabled={loading}
          >
            {specialty}
          </Chip>
        ))}
      </View>

      <SectionHeader title="Languages Spoken" description="Add languages you can provide therapy in" />

      <View style={styles.tagInputContainer}>
        <TextInput
          label="Add Language"
          value={newLanguage}
          onChangeText={setNewLanguage}
          style={styles.tagInput}
          mode="outlined"
          disabled={loading}
          right={
            <TextInput.Icon 
              icon="plus" 
              onPress={addLanguage} 
              disabled={!newLanguage.trim() || loading} 
            />
          }
          onSubmitEditing={addLanguage}
          placeholder="e.g. English, Spanish"
        />
      </View>

      <View style={styles.chipContainer}>
        {(profileData.languages || []).map((language, index) => (
          <Chip
            key={`lang-${index}`}
            style={styles.chip}
            onClose={() => removeLanguage(language)}
            disabled={loading}
          >
            {language}
          </Chip>
        ))}
      </View>

      <SectionHeader title="Session Rates" description="Your pricing information" />

      <View style={styles.ratesContainer}>
        <TextInput
          label="Hourly Rate"
          value={(profileData.rates?.hourly || '').toString()}
          onChangeText={(value) => {
            // Only allow numbers and decimal point
            if (value === '' || /^\d*\.?\d*$/.test(value)) {
              handleRatesChange('hourly', value);
            }
          }}
          keyboardType="decimal-pad"
          style={[styles.input, { flex: 1 }]}
          mode="outlined"
          disabled={loading}
        />

        <TextInput
          label="Currency"
          value={profileData.rates?.currency || ''}
          onChangeText={(value) => handleRatesChange('currency', value)}
          style={[styles.input, { width: 100, marginLeft: 12 }]}
          mode="outlined"
          disabled={loading}
          placeholder="USD"
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.button}
        loading={loading}
        disabled={loading}
      >
        Save Professional Profile
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
  educationForm: {
    marginBottom: 12,
  },
  educationInput: {
    flex: 1,
  },
  educationYearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  educationYearInput: {
    flex: 1,
  },
  addButton: {
    margin: 0,
  },
  educationList: {
    marginBottom: 16,
  },
  educationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: globalStyles.colors.neutralLightest,
    borderRadius: 8,
  },
  educationDetails: {
    flex: 1,
  },
  educationDegree: {
    fontWeight: '600',
    fontSize: 14,
    color: globalStyles.colors.text,
  },
  educationInstitution: {
    fontSize: 12,
    color: globalStyles.colors.textSecondary,
  },
  tagInputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    backgroundColor: globalStyles.colors.inputBackground,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  chip: {
    margin: 4,
  },
  ratesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: globalStyles.colors.primary,
  },
});