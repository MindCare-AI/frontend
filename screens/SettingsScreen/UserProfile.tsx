import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Button } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';

const UserProfile: React.FC = () => {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    bio: '',
    profile_pic: '',
    emergency_contact: {
      name: '',
      relationship: '',
      phone: '',
    },
    medical_history: '',
    current_medications: '',
    blood_type: 'O+',
    treatment_plan: '',
    pain_level: 0,
    gender: 'female',
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genderOptions = ['male', 'female', 'non-binary', 'other', 'prefer-not-to-say'];
  const relationships = ['parent', 'spouse', 'sibling', 'friend', 'other'];

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!accessToken) {
          setError('Not authenticated');
          setLoading(false);
          return;
        }

        // Fetch user profile
        const response = await fetch(`${API_BASE_URL}/api/v1/users/profiles/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok && data.id) {
          setUserId(data.id);
          setProfile(data);
        } else {
          setError(data.detail || 'Failed to retrieve profile.');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('An error occurred while fetching your profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [accessToken]);

  // Save changes
  const saveChanges = async () => {
    try {
      if (!accessToken || !userId) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Not authenticated or user ID not found.',
        });
        return;
      }

      const requestBody = {
        bio: profile.bio,
        emergency_contact: profile.emergency_contact,
        medical_history: profile.medical_history,
        current_medications: profile.current_medications,
        blood_type: profile.blood_type,
        treatment_plan: profile.treatment_plan,
        pain_level: profile.pain_level,
        gender: profile.gender,
      };

      const endpoint = `${API_BASE_URL}/api/v1/users/profiles/${userId}/`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Profile saved successfully',
          text2: 'Your profile information has been updated.',
        });
        setProfile(data);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Save Failed',
          text2: data.detail || 'Unable to update profile.',
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An error occurred while saving your profile.',
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#002D62" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Profile</Text>

      {/* Profile Picture */}
      <View style={styles.avatarContainer}>
        {profile.profile_pic ? (
          <Image source={{ uri: profile.profile_pic }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>No Image</Text>
          </View>
        )}
        <Button
          mode="contained"
          onPress={() => fileInputRef.current?.click()}
          style={styles.uploadButton}
        >
          Upload Picture
        </Button>
      </View>

      {/* Bio */}
      <View style={styles.section}>
        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={styles.textInput}
          value={profile.bio}
          onChangeText={(text) => setProfile({ ...profile, bio: text })}
          placeholder="Tell us about yourself"
        />
      </View>

      {/* Gender */}
      <View style={styles.section}>
        <Text style={styles.label}>Gender</Text>
        <Picker
          selectedValue={profile.gender}
          onValueChange={(value) => setProfile({ ...profile, gender: value })}
        >
          {genderOptions.map((option) => (
            <Picker.Item key={option} label={option} value={option} />
          ))}
        </Picker>
      </View>

      {/* Emergency Contact */}
      <View style={styles.section}>
        <Text style={styles.label}>Emergency Contact</Text>
        <TextInput
          style={styles.textInput}
          value={profile.emergency_contact.name}
          onChangeText={(text) =>
            setProfile({
              ...profile,
              emergency_contact: { ...profile.emergency_contact, name: text },
            })
          }
          placeholder="Contact Name"
        />
        <Picker
          selectedValue={profile.emergency_contact.relationship}
          onValueChange={(value) =>
            setProfile({
              ...profile,
              emergency_contact: { ...profile.emergency_contact, relationship: value },
            })
          }
        >
          {relationships.map((option) => (
            <Picker.Item key={option} label={option} value={option} />
          ))}
        </Picker>
        <TextInput
          style={styles.textInput}
          value={profile.emergency_contact.phone}
          onChangeText={(text) =>
            setProfile({
              ...profile,
              emergency_contact: { ...profile.emergency_contact, phone: text },
            })
          }
          placeholder="Phone Number"
        />
      </View>

      {/* Medical Information */}
      <View style={styles.section}>
        <Text style={styles.label}>Medical History</Text>
        <TextInput
          style={styles.textInput}
          value={profile.medical_history}
          onChangeText={(text) => setProfile({ ...profile, medical_history: text })}
          placeholder="Medical History"
        />
        <Text style={styles.label}>Current Medications</Text>
        <TextInput
          style={styles.textInput}
          value={profile.current_medications}
          onChangeText={(text) => setProfile({ ...profile, current_medications: text })}
          placeholder="Current Medications"
        />
        <Text style={styles.label}>Blood Type</Text>
        <Picker
          selectedValue={profile.blood_type}
          onValueChange={(value) => setProfile({ ...profile, blood_type: value })}
        >
          {bloodTypes.map((type) => (
            <Picker.Item key={type} label={type} value={type} />
          ))}
        </Picker>
      </View>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={saveChanges} style={styles.saveButton}>
          Save Profile
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
  },
  buttonContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
});

export default UserProfile;