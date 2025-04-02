//screens/SettingsScreen/components/therapist/TherapistVerificationStatus.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Badge } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../../../../config';
import { useAuth } from '../../../../contexts/AuthContext';

type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'in_progress';

export interface TherapistVerificationProfile {
  unique_id: string; // Use unique_id for endpoint
  verification_status: VerificationStatus;
  verification_notes?: string;
}

interface TherapistVerificationStatusProps {
  profile: TherapistVerificationProfile;
  refetchProfile?: () => void; // Optional refetch function to update profile data after upload
}

const statusColors: Record<VerificationStatus, string> = {
  pending: 'orange',
  verified: 'green',
  rejected: 'red',
  in_progress: 'blue'
};

export const TherapistVerificationStatus: React.FC<TherapistVerificationStatusProps> = ({ profile, refetchProfile }) => {
  const { accessToken } = useAuth();

  const handleDocumentUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (result.assets?.[0]?.uri) {
      const formData = new FormData();
      formData.append('verification_documents', {
        uri: result.assets[0].uri,
        name: 'verification.jpg',
        type: 'image/jpeg',
      } as any);

      try {
        const response = await fetch(
          `${API_URL}/therapist/profiles/${profile.unique_id}/verify/`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              // Do not set Content-Type for FormData uploads
            },
            body: formData,
          }
        );
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }
        console.log('Verification document uploaded successfully.');
        // Refresh the profile after a successful upload if refetchProfile is provided
        refetchProfile && refetchProfile();
      } catch (error) {
        console.error('Error uploading verification document:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Verification Status
      </Text>
      <View style={styles.statusRow}>
        <Text>Status:</Text>
        <Badge style={[styles.badge, { backgroundColor: statusColors[profile.verification_status] }]}>
          {profile.verification_status.toUpperCase()}
        </Badge>
      </View>
      {profile.verification_status !== 'verified' && (
        <Button 
          mode="contained" 
          onPress={handleDocumentUpload}
          style={styles.button}
        >
          Upload Verification Documents
        </Button>
      )}
      {profile.verification_notes && (
        <Text style={styles.notes}>
          Notes: {profile.verification_notes}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  sectionTitle: { marginBottom: 16 },
  statusRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  badge: { 
    marginLeft: 8,
    color: 'white'
  },
  button: { 
    marginTop: 8 
  },
  notes: { 
    marginTop: 8,
    fontStyle: 'italic'
  }
});