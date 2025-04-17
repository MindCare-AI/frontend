//screens/SettingsScreen/hooks/patient/usePatientProfile.ts
import { API_URL } from '../../../../config';
import axios from 'axios';
import { useAuth } from '../../../../contexts/AuthContext';
import { PatientProfile } from '../../../../types/profile';

export const usePatientProfile = () => {
  const { accessToken, user } = useAuth();

  const saveProfile = async (
    payload: Partial<PatientProfile>
  ): Promise<PatientProfile | null> => {
    if (!user?.patient_profile?.id) {
      throw new Error('Patient profile not found');
    }
    // Normalize payload: ensure treatment_plan and pain_level are set properly
    const normalizedPayload = {
      ...payload,
      treatment_plan: payload.treatment_plan === undefined ? null : payload.treatment_plan,
      pain_level: payload.pain_level === undefined ? null : payload.pain_level,
    };

    try {
      const response = await axios.patch<PatientProfile>(
        `${API_URL}/patient/profiles/${user.patient_profile.id}/`,
        normalizedPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      // Normalize response to ensure fields like treatment_plan are never undefined
      const updatedProfile: PatientProfile = {
        ...response.data,
        treatment_plan:
          response.data.treatment_plan === undefined
            ? null
            : response.data.treatment_plan,
        pain_level:
          response.data.pain_level === undefined ? null : response.data.pain_level,
      };
      return updatedProfile;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.detail || 'Error updating profile'
      );
    }
  };

  return { saveProfile };
};
