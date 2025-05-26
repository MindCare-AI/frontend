import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

export interface UserTypeData {
  user_type: 'patient' | 'therapist';
}

export interface PatientProfileData {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  gender?: 'M' | 'F' | 'O' | 'N';
  blood_type?: string;
  profile_pic?: any;
}

export interface TherapistProfileData {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  bio?: string;
  specializations?: string[];
  years_of_experience?: number;
  license_number?: string;
  profile_picture?: any;
}

export interface TherapistVerificationData {
  license_image: any;
  selfie_image: any;
  license_number: string;
  issuing_authority: string;
}

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('accessToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const getMultipartHeaders = async () => {
  const token = await AsyncStorage.getItem('accessToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data',
  };
};

export const setUserType = async (userType: 'patient' | 'therapist') => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/users/set-user-type/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ user_type: userType }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to set user type');
  }
  
  return response.json();
};

export const updatePatientProfile = async (profileId: number, data: PatientProfileData) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/patient/profiles/${profileId}/`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update patient profile');
  }
  
  return response.json();
};

export const updateTherapistProfile = async (profileId: number, data: TherapistProfileData) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/therapist/profiles/${profileId}/`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update therapist profile');
  }
  
  return response.json();
};

export const uploadPatientProfilePicture = async (profileId: number, imageUri: string) => {
  const token = await AsyncStorage.getItem('accessToken');
  const formData = new FormData();
  
  formData.append('profile_pic', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'profile_pic.jpg',
  } as any);

  const response = await fetch(`${API_URL}/patient/profiles/${profileId}/`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload profile picture');
  }
  
  return response.json();
};

export const submitTherapistVerification = async (profileId: number, data: TherapistVerificationData) => {
  const token = await AsyncStorage.getItem('accessToken');
  const formData = new FormData();
  
  formData.append('license_image', {
    uri: data.license_image,
    type: 'image/jpeg',
    name: 'license.jpg',
  } as any);
  
  formData.append('selfie_image', {
    uri: data.selfie_image,
    type: 'image/jpeg',
    name: 'selfie.jpg',
  } as any);
  
  formData.append('license_number', data.license_number);
  formData.append('issuing_authority', data.issuing_authority);

  const response = await fetch(`${API_URL}/therapist/profiles/${profileId}/verify/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit verification');
  }
  
  return response.json();
};

export const getCurrentUser = async () => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/users/me/`, {
    headers,
  });
  
  if (!response.ok) {
    throw new Error('Failed to get user data');
  }
  
  return response.json();
};
