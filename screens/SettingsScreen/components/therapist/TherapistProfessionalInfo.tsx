//screens/SettingsScreen/components/therapist/TherapistProfessionalInfo.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { TextInput, Text, HelperText, RadioButton, Chip } from 'react-native-paper';
import type { TherapistProfile as TherapistProfileType } from '../../../../types/profile';
import { treatmentApproachOptions } from '../../constants';

interface TherapistProfessionalInfoProps {
  profile: TherapistProfileType;
  setProfile: (profile: Partial<TherapistProfileType>) => void;
}

export const TherapistProfessionalInfo: React.FC<TherapistProfessionalInfoProps> = ({ profile, setProfile }) => {
  const [countryCode, setCountryCode] = useState<string>('+1');
  const [localPhone, setLocalPhone] = useState<string>(
    profile.phone_number?.replace(/^\+\d+/, '') || ''
  );

  useEffect(() => {
    setProfile({ ...profile, phone_number: `${countryCode}${localPhone}` });
  }, [countryCode, localPhone]);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const initial = Array.isArray(profile.treatment_approaches) && profile.treatment_approaches.length
    ? profile.treatment_approaches[0]
    : 'CBT';
  const [selectedApproach, setSelectedApproach] = useState(initial);
  useEffect(() => {
    setProfile({ ...profile, treatment_approaches: [selectedApproach] });
  }, [selectedApproach]);

  const selectedDays: string[] = Array.isArray(profile.available_days)
    ? profile.available_days
    : Object.keys(profile.available_days || {});

  const animateChip = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 100, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, easing: Easing.out(Easing.ease), useNativeDriver: true })
    ]).start();
  };

  const toggleDay = (day: string) => {
    animateChip();
    const key = day.toLowerCase();
    const current = (!Array.isArray(profile.available_days) && profile.available_days)
      ? { ...profile.available_days }
      : {};
    if (key in current) delete current[key];
    else current[key] = [];
    setProfile({ ...profile, available_days: current });
  };

  const isLicenseValid = (n: string) => /^[A-Z]{2}-\d{6}$/.test(n);
  const hasLicenseError = !!profile.license_number && !isLicenseValid(profile.license_number);

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Professional Information
      </Text>

      {/* Email */}
      <TextInput
        label="Email"
        value={profile.email}
        onChangeText={text => setProfile({ ...profile, email: text })}
        style={styles.input}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Phone - manually input country code and phone number */}
      <View style={styles.phoneRow}>
        <TextInput
          label="Country Code"
          value={countryCode}
          onChangeText={setCountryCode}
          style={[styles.input, styles.countryCodeInput]}
          mode="outlined"
          keyboardType="phone-pad"
          autoCapitalize="none"
        />
        <TextInput
          label="Phone Number"
          value={localPhone}
          onChangeText={setLocalPhone}
          style={[styles.input, { flex: 1, marginLeft: 8 }]}
          mode="outlined"
          keyboardType="phone-pad"
          placeholder="1234567890"
        />
      </View>

      {/* Specialization */}
      <TextInput
        label="Specialization"
        value={profile.specialization}
        onChangeText={t => setProfile({ ...profile, specialization: t })}
        style={styles.input}
        mode="outlined"
      />

      {/* License */}
      <View>
        <TextInput
          label="License Number"
          value={profile.license_number || ''}
          onChangeText={t => setProfile({ ...profile, license_number: t.toUpperCase() })}
          error={hasLicenseError}
          style={styles.input}
          mode="outlined"
          placeholder="XX-123456"
        />
        <HelperText type={hasLicenseError ? 'error' : 'info'} visible>
          {hasLicenseError ? 'Format: XX-123456' : 'Enter your license number'}
        </HelperText>
      </View>

      {/* Years of Experience */}
      <TextInput
        label="Years of Experience"
        value={String(profile.years_of_experience)}
        onChangeText={t => {
          const y = parseInt(t) || 0;
          if (y >= 0 && y <= 100) setProfile({ ...profile, years_of_experience: y });
        }}
        keyboardType="numeric"
        style={styles.input}
        mode="outlined"
      />

      {/* Available Days */}
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Available Days
      </Text>
      <View style={styles.chipRow}>
        {daysOfWeek.map(d => (
          <Animated.View key={d} style={{ transform: [{ scale: scaleAnim }] }}>
            <Chip
              onPress={() => toggleDay(d)}
              style={{
                backgroundColor: selectedDays.includes(d) ? '#002D62' : '#E4F0F6',
                borderColor: '#002D62',
                borderWidth: 1,
                margin: 4
              }}
              textStyle={{ color: selectedDays.includes(d) ? '#FFF' : '#000' }}
            >
              {d}
            </Chip>
          </Animated.View>
        ))}
      </View>

      {/* Treatment */}
      <Text variant="titleMedium" style={[styles.sectionTitle, { marginTop: 16 }]}>
        Treatment Approach
      </Text>
      <RadioButton.Group value={selectedApproach} onValueChange={setSelectedApproach}>
        {treatmentApproachOptions.map(opt => (
          <View key={opt} style={styles.radioRow}>
            <RadioButton value={opt} />
            <Text>{opt}</Text>
          </View>
        ))}
      </RadioButton.Group>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', borderRadius: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#002D62', marginBottom: 8 },
  input: { backgroundColor: '#F8F9FA', marginBottom: 8 },
  countryCodeInput: { width: 80 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  radioRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
});