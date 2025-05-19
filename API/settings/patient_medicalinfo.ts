import axios from 'axios';
import { API_URL } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPatientProfile } from './patient_profile'; // import helper

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
}

export interface MedicalHistoryItem {
  id?: number;
  title: string;
  description: string;
  date_occurred: string | null;
}

export interface HealthMetric {
  id?: number;
  metric_type: string;
  value: string;
}

export interface MedicalInfo {
  medicalHistory: MedicalHistoryItem[];
  healthMetrics: HealthMetric[];
  currentMedications: string[];
  emergencyContact: EmergencyContact;
}

export const getMedicalInfo = async (): Promise<MedicalInfo> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) throw new Error('Authentication token not found');

    // Fetch medical history
      const historyResponse = await axios.get<any>(
      `${API_URL}/patient/medical-history/`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('[MedicalInfo] GET /patient/medical-history/', historyResponse.data);

    // Handle paginated response (DRF default)
    let historyData: any[] = [];
    if (Array.isArray(historyResponse.data)) {
      historyData = historyResponse.data;
    } else if (Array.isArray(historyResponse.data.results)) {
      historyData = historyResponse.data.results;
    }

    // Fetch health metrics
    const metricsResponse = await axios.get<any>(
      `${API_URL}/patient/health-metrics/`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('[MedicalInfo] GET /patient/health-metrics/', metricsResponse.data);
    let metricsData: any[] = [];
    if (Array.isArray(metricsResponse.data)) {
      metricsData = metricsResponse.data;
    } else if (Array.isArray(metricsResponse.data.results)) {
      metricsData = metricsResponse.data.results;
    }

    // Fetch patient profile for emergency contact info
    const profileResponse = await axios.get<any[]>(
      `${API_URL}/patient/profiles/`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const profile = profileResponse.data.length > 0 ? profileResponse.data[0] : {};

    // Transform backend data into our frontend format
    const medicalHistory: MedicalHistoryItem[] = historyData.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      date_occurred: item.date_occurred || null,
    }));

    const healthMetrics: HealthMetric[] = metricsData.map((item: any) => ({
      id: item.id,
      metric_type: item.metric_type || item.metric_name || '',
      value: item.value,
    }));

    // Extract medications from health metrics if needed
    const medications = healthMetrics
      .filter((metric: any) => (metric.metric_type || '').toLowerCase().includes('medication'))
      .map((metric: any) => metric.value);

    // Build emergency contact from profile or provide default
    const emergencyContact = profile.emergency_contact || {
      name: '',
      relationship: '',
      phoneNumber: ''
    };
    if (typeof emergencyContact.phone === 'string') {
      emergencyContact.phoneNumber = emergencyContact.phone;
    }

    return {
      medicalHistory,
      healthMetrics,
      currentMedications: medications,
      emergencyContact
    };
  } catch (error) {
    console.error('[MedicalInfo] Error fetching medical info:', error);
    throw error;
  }
};

export const updateMedicalInfo = async (
  medicalInfo: any
): Promise<any> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) throw new Error('Authentication token not found');

    // Step 1: Fetch single patient profile to get its ID
    const patientProfile = await getPatientProfile();
    const profileId = patientProfile.id;
    if (!profileId) {
      throw new Error(
        'Patient profile not found. Please complete your profile before updating medical information.'
      );
    }

    // Step 2: Update emergency contact on that profile
    await axios.patch(
      `${API_URL}/patient/profiles/${profileId}/`,
      {
        emergency_contact: {
          name: medicalInfo.emergencyContact?.name || '',
          relationship: medicalInfo.emergencyContact?.relationship || '',
          phone: medicalInfo.emergencyContact?.phoneNumber || ''
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    // Only update medical history if title or description is present
    if (medicalInfo.title || medicalInfo.description) {
      // Step 3: Update or create medical history entry
      const historyResponse = await axios.get<any[]>(
        `${API_URL}/patient/medical-history/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      let historyId: number | null = null;
      const payload: any = {
        title: medicalInfo.title || 'Medical History',
        description: medicalInfo.description || '',
      };
      let dateOccurred = (medicalInfo as any).date_occurred;
      if (
        typeof dateOccurred === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(dateOccurred)
      ) {
        payload.date_occurred = dateOccurred;
      } else {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        payload.date_occurred = `${yyyy}-${mm}-${dd}`;
      }
      if (historyResponse.data && historyResponse.data.length > 0) {
        historyId = historyResponse.data[0].id;
        try {
          console.log('[MedicalInfo] PUT /patient/medical-history/', { id: historyId, payload });
          await axios.put(
            `${API_URL}/patient/medical-history/${historyId}/`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              }
            }
          );
        } catch (err: any) {
          if (err.response) {
            console.error('[MedicalInfo] PUT error:', {
              status: err.response.status,
              data: err.response.data,
              payload
            });
          } else {
            console.error('[MedicalInfo] PUT error:', err);
          }
          throw err;
        }
      } else {
        try {
          console.log('[MedicalInfo] POST /patient/medical-history/', payload);
          await axios.post(
            `${API_URL}/patient/medical-history/`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              }
            }
          );
        } catch (err: any) {
          if (err.response) {
            console.error('[MedicalInfo] POST error:', {
              status: err.response.status,
              data: err.response.data,
              payload
            });
          } else {
            console.error('[MedicalInfo] POST error:', err);
          }
          throw err;
        }
      }
    }

    // Only update health metrics if present
    if (Array.isArray(medicalInfo.healthMetrics) && medicalInfo.healthMetrics.length > 0) {
      // Fetch existing health metrics to avoid duplicates
      const metricsResponse = await axios.get<any>(
        `${API_URL}/patient/health-metrics/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      let existingMetrics: any[] = [];
      if (Array.isArray(metricsResponse.data)) {
        existingMetrics = metricsResponse.data;
      } else if (Array.isArray(metricsResponse.data.results)) {
        existingMetrics = metricsResponse.data.results;
      }

      for (const metric of medicalInfo.healthMetrics) {
        // Check if this metric already exists (by type and value)
        const exists = existingMetrics.some(
          (m) =>
            (m.metric_type === (metric.metric_type === 'Blood Pressure'
              ? 'blood_pressure'
              : metric.metric_type === 'Weight'
                ? 'weight'
                : metric.metric_type === 'Heart Rate'
                  ? 'heart_rate'
                  : metric.metric_type)) &&
            m.value === metric.value
        );
        if (exists) {
          console.log('[MedicalInfo] Skipping duplicate health metric:', metric);
          continue;
        }
        try {
          const medPayload = {
            metric_type: metric.metric_type === 'Blood Pressure'
              ? 'blood_pressure'
              : metric.metric_type === 'Weight'
                ? 'weight'
                : metric.metric_type === 'Heart Rate'
                  ? 'heart_rate'
                  : metric.metric_type,
            value: metric.value,
          };
          console.log('[MedicalInfo] POST /patient/health-metrics/', medPayload);
          await axios.post(
            `${API_URL}/patient/health-metrics/`,
            medPayload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              }
            }
          );
        } catch (err: any) {
          if (err.response) {
            console.error('[MedicalInfo] Medication POST error:', {
              status: err.response.status,
              data: err.response.data,
              metric
            });
          } else {
            console.error('[MedicalInfo] Medication POST error:', err);
          }
        }
      }
    }

    return medicalInfo;
  } catch (error) {
    console.error('[MedicalInfo] Error updating medical info:', error);
    if (typeof error === 'object' && error !== null && 'response' in error && (error as any).response) {
      console.error('Backend error details:', (error as any).response.data);
    }
    throw error;
  }
};