import React, { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TherapistCard } from '../../components/AppointmentManagementScreen/TherapistCard';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useTherapistAvailability } from '../../hooks/AppointmentManagementScreen/useTherapistAvailability';
import { LoadingIndicator, ErrorMessage } from '../../components/ui';
import type { TherapistProfile } from '../../types/profile';
import { globalStyles } from '../../styles/global';

const BookAppointmentScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    therapists,
    loading,
    error,
    fetchTherapists,
  } = useTherapistAvailability();

  const handleTherapistSelect = (therapist: TherapistProfile) => {
    navigation.navigate('AppointmentManagement', {
      therapistId: therapist.id,
    });
  };

  useEffect(() => {
    fetchTherapists();
  }, [fetchTherapists]);

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error.toString()}
        onDismiss={() => {}}
      />
    );
  }

  return (
    <ScrollView style={{
      flex: 1,
      backgroundColor: globalStyles.colors.white,
    }}>
      <View style={{
        padding: globalStyles.spacing.md,
      }}>
        <Text style={{
          ...globalStyles.h2,
          color: globalStyles.colors.neutralDark,
        }}>Available Therapists</Text>
      </View>
      {therapists.length > 0 ? (
        therapists.map((therapist) => (
          <TherapistCard
            key={therapist.id}
            therapist={therapist}
            isSelected={false}
            onSelect={() => handleTherapistSelect(therapist)}
          />
        ))
      ) : (
        <Text style={{
          textAlign: 'center',
          color: globalStyles.colors.neutralMedium,
          marginTop: globalStyles.spacing.md,
          fontSize: 14,
        }}>No therapists available at the moment</Text>
      )}
    </ScrollView>
  );
};

export default BookAppointmentScreen;