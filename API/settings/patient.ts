import axios from 'axios';
import { API_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MedicalInformation {
  medicalHistory?: string;
  currentMedications?: string[];
  allergies?: string[];
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phoneNumber?: string;
  };
}

/**
 * Fetches the patient's medical information
 * @returns Promise with medical information
 */
export const getMedicalInfo = async (): Promise<MedicalInformation> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await axios.get(`${API_URL}/api/v1/patients/medical-info`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching medical information:', error);
    throw error;
  }
};

/**
 * Updates the patient's medical information
 * @param medicalInfo Medical information to update
 * @returns Promise with updated medical information
 */
export const updateMedicalInfo = async (
  medicalInfo: Partial<MedicalInformation>
): Promise<MedicalInformation> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await axios.put(
      `${API_URL}/api/v1/patients/medical-info`,
      medicalInfo,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating medical information:', error);
    throw error;
  }
};