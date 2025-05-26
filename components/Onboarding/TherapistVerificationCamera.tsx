import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, Animated, TextInput } from 'react-native';
import { Camera, Upload, FileText, User, CheckCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { submitTherapistVerification } from '../../utils/onboardingAPI';

interface TherapistVerificationCameraProps {
  onNext: () => void;
  onBack: () => void;
  currentUser?: any;
}

const TherapistVerificationCamera: React.FC<TherapistVerificationCameraProps> = ({ 
  onNext, 
  onBack, 
  currentUser 
}) => {
  const [licenseImage, setLicenseImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [uploading, setUploading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const pickImage = async (type: 'license' | 'selfie', useCamera: boolean = false) => {
    try {
      let result;
      if (useCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission needed', 'Camera permission is required to take photos.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: type === 'license' ? [4, 3] : [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: type === 'license' ? [4, 3] : [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        if (type === 'license') {
          setLicenseImage(result.assets[0].uri);
        } else {
          setSelfieImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!licenseImage || !selfieImage || !licenseNumber || !issuingAuthority) {
      Alert.alert('Required Fields', 'Please complete all verification steps.');
      return;
    }

    try {
      setUploading(true);
      const verificationData = {
        license_image: licenseImage,
        selfie_image: selfieImage,
        license_number: licenseNumber,
        issuing_authority: issuingAuthority,
      };

      if (currentUser?.profile_id) {
        await submitTherapistVerification(currentUser.profile_id, verificationData);
        console.log('Verification submitted successfully');
      }
      onNext();
    } catch (error) {
      console.error('Error submitting verification:', error);
      Alert.alert('Error', 'Failed to submit verification. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const renderImageSection = (
    title: string,
    subtitle: string,
    image: string | null,
    onCameraPress: () => void,
    onGalleryPress: () => void,
    icon: React.ReactNode
  ) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      
      <View style={styles.imageContainer}>
        {image ? (
          <View style={styles.imagePreview}>
            <Image source={{ uri: image }} style={styles.image} />
            <View style={styles.successOverlay}>
              <CheckCircle size={30} color="#4CAF50" />
            </View>
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.imageButton} onPress={onCameraPress}>
          <Camera size={16} color="#002D62" />
          <Text style={styles.imageButtonText}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.imageButton} onPress={onGalleryPress}>
          <Upload size={16} color="#002D62" />
          <Text style={styles.imageButtonText}>Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <Text style={styles.title}>Professional Verification</Text>
        <Text style={styles.subtitle}>
          Help us verify your credentials to ensure patient safety
        </Text>

        {renderImageSection(
          'Professional License',
          'Take a clear photo of your therapy license',
          licenseImage,
          () => pickImage('license', true),
          () => pickImage('license', false),
          <FileText size={24} color="#002D62" />
        )}

        {renderImageSection(
          'Identity Verification',
          'Take a current selfie for identity verification',
          selfieImage,
          () => pickImage('selfie', true),
          () => pickImage('selfie', false),
          <User size={24} color="#002D62" />
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>License Details</Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="License Number *"
              value={licenseNumber}
              onChangeText={setLicenseNumber}
            />
          </View>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Issuing Authority *"
              value={issuingAuthority}
              onChangeText={setIssuingAuthority}
            />
          </View>
        </View>
      </View>

      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.submitButton, uploading && styles.disabledButton]} 
          onPress={handleSubmit}
          disabled={uploading}
        >
          <Text style={styles.submitButtonText}>
            {uploading ? 'Submitting...' : 'Submit for Verification'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E4F0F6',
  },
  content: {
    flex: 1,
    padding: 20,
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
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#002D62',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePreview: {
    position: 'relative',
  },
  image: {
    width: 120,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  successOverlay: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 2,
  },
  imagePlaceholder: {
    width: 120,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 12,
    color: '#999',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  imageButtonText: {
    color: '#002D62',
    fontSize: 14,
    fontWeight: '500',
  },
  inputGroup: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 12,
  },
  input: {
    fontSize: 16,
    color: '#333',
  },
  navigationContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12,
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
  submitButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#002D62',
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default TherapistVerificationCamera;
