import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TherapistCard } from '../../components/TherapistCard';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { useTherapistAvailability } from '../../hooks/AppointmentManagementScreen/useTherapistAvailability';
import { LoadingIndicator, ErrorMessage } from '../../components/ui';
import type { TherapistProfile } from '../../types/profile';

const BookAppointmentScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    therapists,
    loading,
    error,
    fetchTherapists,
  } = useTherapistAvailability();

  // Select therapist and go to their appointment management screen
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Therapists</Text>
      </View>
      <View style={styles.therapistsContainer}>
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
          <Text style={styles.noTherapistsText}>No therapists available at the moment</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  therapistsContainer: {
    padding: 20,
  },
  noTherapistsText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 16,
    fontSize: 14,
  },
});

export default BookAppointmentScreen;
