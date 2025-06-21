import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, Platform } from 'react-native';
import { Camera, Upload, User } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadPatientProfilePicture } from '../../API/settings/patient_profile';

interface PatientProfilePictureProps {
  onNext: () => void;
  onBack: () => void;
  currentUser?: any;
}

const PatientProfilePicture: React.FC<PatientProfilePictureProps> = ({ onNext, onBack, currentUser }) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Web-specific file input handler
  const handleWebFileInput = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // This enables camera on mobile web
      
      input.onchange = (event: any) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setProfileImage(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        }
      };
      
      input.click();
    }
  };

  // Web camera capture (using getUserMedia)
  const handleWebCamera = async () => {
    if (Platform.OS === 'web') {
      try {
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          Alert.alert('Not Supported', 'Camera is not supported on this browser');
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' } // Front camera
        });
        
        // Create video element
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();
        
        // Create canvas for capture
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Create a modal or overlay for camera preview
        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.8);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        `;
        
        video.style.cssText = `
          width: 300px;
          height: 300px;
          object-fit: cover;
          border-radius: 50%;
          border: 3px solid white;
        `;
        
        const captureBtn = document.createElement('button');
        captureBtn.textContent = 'Capture';
        captureBtn.style.cssText = `
          margin-top: 20px;
          padding: 10px 20px;
          background: #002D62;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        `;
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.cssText = `
          margin-top: 10px;
          padding: 10px 20px;
          background: #ccc;
          color: black;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        `;
        
        overlay.appendChild(video);
        overlay.appendChild(captureBtn);
        overlay.appendChild(cancelBtn);
        document.body.appendChild(overlay);
        
        captureBtn.onclick = () => {
          canvas.width = 300;
          canvas.height = 300;
          ctx?.drawImage(video, 0, 0, 300, 300);
          
          const dataURL = canvas.toDataURL('image/jpeg', 0.8);
          setProfileImage(dataURL);
          
          // Cleanup
          stream.getTracks().forEach(track => track.stop());
          document.body.removeChild(overlay);
        };
        
        cancelBtn.onclick = () => {
          stream.getTracks().forEach(track => track.stop());
          document.body.removeChild(overlay);
        };
        
      } catch (error) {
        console.error('Camera error:', error);
        Alert.alert('Camera Error', 'Unable to access camera. Please try uploading a file instead.');
      }
    }
  };

  const pickImage = async (useCamera: boolean = false) => {
    if (Platform.OS === 'web') {
      if (useCamera) {
        await handleWebCamera();
      } else {
        handleWebFileInput();
      }
      return;
    }

    // Mobile implementation (existing code)
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
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleNext = async () => {
    if (profileImage) {
      try {
        setUploading(true);
        
        let imageData;
        
        if (Platform.OS === 'web') {
          // For web, convert data URL to blob
          const response = await fetch(profileImage);
          const blob = await response.blob();
          
          imageData = {
            uri: profileImage,
            fileName: 'profile.jpg',
            mimeType: 'image/jpeg',
            blob: blob // Include blob for web
          };
        } else {
          // Mobile implementation
          imageData = {
            uri: profileImage,
            fileName: 'profile.jpg',
            mimeType: 'image/jpeg'
          };
        }
        
        await uploadPatientProfilePicture(imageData);
        console.log('Profile picture uploaded successfully');
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        Alert.alert('Error', 'Failed to upload profile picture. You can add it later.');
      } finally {
        setUploading(false);
      }
    }
    onNext();
  };

  const handleSkip = () => {
    onNext();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Add your profile picture</Text>
        <Text style={styles.subtitle}>
          Help others recognize you with a profile picture
        </Text>

        <View style={styles.imageContainer}>
          <View style={styles.imagePreview}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.image} />
            ) : (
              <View style={styles.placeholder}>
                <User size={60} />
              </View>
            )}
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.actionButton} onPress={() => pickImage(true)}>
            <Camera size={20} />
            <Text style={styles.actionButtonText}>
              {Platform.OS === 'web' ? 'Use Camera' : 'Take Photo'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => pickImage(false)}>
            <Upload size={20} />
            <Text style={styles.actionButtonText}>
              {Platform.OS === 'web' ? 'Upload File' : 'Choose from Gallery'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.nextButton, uploading && styles.disabledButton]} 
          onPress={handleNext}
          disabled={uploading}
        >
          <Text style={styles.nextButtonText}>
            {uploading ? 'Uploading...' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E4F0F6',
  },
  content: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
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
    marginBottom: 40,
    lineHeight: 22,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonGroup: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 12,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#002D62',
    fontSize: 16,
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    paddingHorizontal: 30,
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
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  skipButtonText: {
    color: '#666',
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
  disabledButton: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PatientProfilePicture;
