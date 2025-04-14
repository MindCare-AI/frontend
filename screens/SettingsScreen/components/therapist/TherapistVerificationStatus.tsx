//screens/SettingsScreen/components/therapist/TherapistVerificationStatus.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, Badge, ProgressBar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../../../../config';
import { useAuth } from '../../../../contexts/AuthContext';
import { gsap } from 'gsap';
import * as DocumentPicker from 'expo-document-picker';
import { Upload } from 'lucide-react-native';

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

export const TherapistVerificationStatus: React.FC<TherapistVerificationStatusProps> = ({ profile, refetchProfile }) => {
  const { accessToken } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);

  const statusColors: Record<VerificationStatus, string> = {
    pending: '#FF9800',
    verified: '#4CAF50',
    rejected: '#F44336',
    in_progress: '#2196F3'
  };

  const statusMessages = {
    pending: 'Your verification is being reviewed',
    verified: 'Your account is verified',
    rejected: 'Verification failed. Please upload new documents',
    in_progress: 'Your verification is in progress'
  };

  useEffect(() => {
    gsap.from(containerRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: "power2.out"
    });
  }, []);

  const handleDocumentUpload = async () => {
    try {
      setUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true
      });

      if (!result.canceled) {
        const document = result.assets[0];
        const formData = new FormData();
        formData.append('verification_documents', {
          uri: document.uri,
          name: document.name || 'verification.jpg',
          type: document.mimeType,
        } as any);

        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            setProgress((event.loaded / event.total) * 100);
          }
        });

        const response = await fetch(`${API_URL}/therapist/profiles/${profile.unique_id}/verify/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        // Success animation and feedback
        setProgress(100);
        setTimeout(() => {
          setProgress(0);
          refetchProfile && refetchProfile();
        }, 1000);

        gsap.to(containerRef.current, {
          scale: 1.02,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut"
        });
      }
    } catch (error) {
      console.error('Error uploading verification document:', error);
      Alert.alert(
        'Upload Failed',
        'Please try again or contact support if the problem persists.'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <View ref={containerRef} style={styles.container}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Verification Status
      </Text>
      
      <View style={styles.statusContainer}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Badge 
            style={[
              styles.badge, 
              { backgroundColor: statusColors[profile.verification_status] }
            ]}
          >
            {profile.verification_status.toUpperCase()}
          </Badge>
        </View>

        <Text style={[
          styles.statusMessage,
          { color: statusColors[profile.verification_status] }
        ]}>
          {statusMessages[profile.verification_status]}
        </Text>

        {uploading && (
          <View style={styles.progressContainer}>
            <ProgressBar 
              progress={progress / 100} 
              color={statusColors.in_progress}
              style={styles.progressBar}
            />
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        )}

        {profile.verification_status !== 'verified' && (
          <Button 
            mode="contained" 
            onPress={handleDocumentUpload}
            loading={uploading}
            style={styles.uploadButton}
            icon={() => <Upload size={20} color="white" />}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Verification Documents'}
          </Button>
        )}

        {profile.verification_notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notes}>
              {profile.verification_notes}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1A1A1A',
  },
  statusContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
  },
  statusRow: { 
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  badge: { 
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusMessage: {
    fontSize: 14,
    fontStyle: 'italic'
  },
  progressContainer: {
    marginVertical: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    color: '#666',
  },
  uploadButton: { 
    marginTop: 16,
    backgroundColor: '#002D62'
  },
  notesContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFF9C4',
    borderRadius: 8,
  },
  notesLabel: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#1A1A1A',
  },
  notes: { 
    color: '#666',
    fontStyle: 'italic',
  }
});