import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { FileText, Upload, Calendar, CheckCircle } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';

interface TherapistLicenseVerificationProps {
  onNext: () => void;
  onBack: () => void;
}

const TherapistLicenseVerification: React.FC<TherapistLicenseVerificationProps> = ({ 
  onNext, 
  onBack 
}) => {
  const [licenseNumber, setLicenseNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [licenseDocument, setLicenseDocument] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [documentName, setDocumentName] = useState('');

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        setLicenseDocument(result.assets[0].uri);
        setDocumentName(result.assets[0].name || 'Selected document');
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to select document. Please try again.");
    }
  };

  const handleNext = async () => {
    // Basic validation
    if (!licenseNumber.trim()) {
      Alert.alert('Required Field', 'Please enter your license number.');
      return;
    }

    if (!expiryDate.trim()) {
      Alert.alert('Required Field', 'Please enter your license expiry date.');
      return;
    }

    // Very simple date validation (MM/YYYY)
    const dateRegex = /^(0[1-9]|1[0-2])\/\d{4}$/;
    if (!dateRegex.test(expiryDate)) {
      Alert.alert('Invalid Date', 'Please enter a valid date in MM/YYYY format.');
      return;
    }

    if (!licenseDocument) {
      Alert.alert('Document Required', 'Please upload a copy of your license.');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, you would upload the document and form data here
      
      setIsLoading(false);
      onNext();
    } catch (error) {
      console.error('Error submitting license verification:', error);
      Alert.alert('Error', 'Failed to submit your license information. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>License Verification</Text>
        <Text style={styles.subtitle}>
          Please provide your license details for verification. This helps us ensure the quality of our platform.
        </Text>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>License Number</Text>
            <View style={styles.inputContainer}>
              <View style={{width: 24, height: 24, alignItems: 'center', justifyContent: 'center'}}>
                <FileText size={20} />
              </View>
              <TextInput
                style={styles.input}
                value={licenseNumber}
                onChangeText={setLicenseNumber}
                placeholder="Enter your license number"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Expiry Date</Text>
            <View style={styles.inputContainer}>
              <View style={{width: 24, height: 24, alignItems: 'center', justifyContent: 'center'}}>
                <Calendar size={20} />
              </View>
              <TextInput
                style={styles.input}
                value={expiryDate}
                onChangeText={setExpiryDate}
                placeholder="MM/YYYY"
                placeholderTextColor="#999"
                keyboardType="numbers-and-punctuation"
                maxLength={7}
              />
            </View>
          </View>

          <View style={styles.uploadSection}>
            <Text style={styles.label}>License Document</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
              <View style={{width: 24, height: 24, alignItems: 'center', justifyContent: 'center'}}>
                <Upload size={20} />
              </View>
              <Text style={styles.uploadButtonText}>Upload License (PDF or Image)</Text>
            </TouchableOpacity>
            
            {licenseDocument && (
              <View style={styles.documentPreview}>
                <View style={{width: 24, height: 24, alignItems: 'center', justifyContent: 'center'}}>
                  <CheckCircle size={20} />
                </View>
                <Text style={styles.documentName} numberOfLines={1} ellipsizeMode="middle">
                  {documentName}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.infoPanel}>
            <Text style={styles.infoPanelTitle}>Why do we verify licenses?</Text>
            <Text style={styles.infoPanelText}>
              License verification helps us maintain high standards of care on our platform. 
              Your information is secure and only used for verification purposes.
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.nextButton, 
              isLoading && styles.disabledButton
            ]} 
            onPress={handleNext}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.nextButtonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.skipButton} onPress={onNext}>
          <Text style={styles.skipButtonText}>Skip for now (You can complete verification later)</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E4F0F6',
  },
  content: {
    padding: 30,
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
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#002D62',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F7FAFC',
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 6,
  },
  uploadSection: {
    marginBottom: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#002D62',
    borderRadius: 8,
    paddingVertical: 14,
    backgroundColor: '#F2F8FD',
    gap: 10,
  },
  uploadButtonText: {
    color: '#002D62',
    fontWeight: '500',
    fontSize: 16,
  },
  documentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  documentName: {
    flex: 1,
    fontSize: 14,
    color: '#2E7D32',
  },
  infoPanel: {
    backgroundColor: '#EFF8FF',
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoPanelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D47A1',
    marginBottom: 6,
  },
  infoPanelText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
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
  disabledButton: {
    backgroundColor: '#9FB1C7',
  },
  skipButton: {
    marginTop: 20,
    paddingVertical: 8,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default TherapistLicenseVerification;
