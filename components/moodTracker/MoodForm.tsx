// components/moodTracker/MoodForm.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Platform,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import  Slider  from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import * as Haptics from 'expo-haptics';
import { MoodFormData } from '../../types/Mood';
import { MOOD_ACTIVITIES, ENERGY_LEVELS, getMoodColor } from '../../utils/constants';

interface MoodFormProps {
  initialValues?: Partial<MoodFormData>;
  onSubmit: (data: MoodFormData) => Promise<void>;
  isLoading: boolean;
}

const MoodForm: React.FC<MoodFormProps> = ({ 
  initialValues, 
  onSubmit,
  isLoading
}) => {
  const [moodRating, setMoodRating] = useState<number>(initialValues?.mood_rating || 5);
  const [energyLevel, setEnergyLevel] = useState<number>(initialValues?.energy_level || 3);
  const [activities, setActivities] = useState<string>(initialValues?.activities || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleMoodChange = (value: number) => {
    setMoodRating(value);
    // Provide haptic feedback on iOS/Android
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleEnergyChange = (value: number) => {
    setEnergyLevel(value);
  };

  const handleActivitiesChange = (value: string) => {
    setActivities(value);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        mood_rating: moodRating,
        energy_level: energyLevel,
        activities
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const moodColor = getMoodColor(moodRating);
  const isDisabled = isLoading || isSubmitting;

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Mood Rating Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How are you feeling?</Text>
        <Text style={[styles.moodValue, { color: moodColor }]}>
          {moodRating}/10
        </Text>
        <View style={styles.moodTextContainer}>
          <Text style={styles.moodTextLow}>Low</Text>
          <Text style={styles.moodTextHigh}>High</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={moodRating}
          onValueChange={handleMoodChange}
          minimumTrackTintColor={moodColor}
          maximumTrackTintColor="#d3d3d3"
          thumbTintColor={moodColor}
          disabled={isDisabled}
        />
        <View style={styles.sliderMarkers}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((mark) => (
            <View key={`mark-${mark}`} style={styles.sliderMark} />
          ))}
        </View>
      </View>

      {/* Energy Level Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Energy Level</Text>
        <Text style={styles.energyValue}>
          {ENERGY_LEVELS.find(el => el.value === energyLevel)?.label || 'Moderate'}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={5}
          step={1}
          value={energyLevel}
          onValueChange={handleEnergyChange}
          minimumTrackTintColor="#002D62"
          maximumTrackTintColor="#d3d3d3"
          thumbTintColor="#002D62"
          disabled={isDisabled}
        />
        <View style={styles.energyMarkers}>
          {ENERGY_LEVELS.map(({ value, label }) => (
            <Text key={`energy-${value}`} style={styles.energyLabel}>
              {value}
            </Text>
          ))}
        </View>
      </View>

      {/* Activities Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activities</Text>
        <View style={styles.pickerContainer}>
          {Platform.OS === 'web' ? (
            <select
              value={activities}
              onChange={(e) => handleActivitiesChange(e.target.value)}
              style={styles.webPicker as any}
              disabled={isDisabled}
            >
              <option value="">Select an activity...</option>
              {MOOD_ACTIVITIES.map((activity) => (
                <option key={activity} value={activity}>
                  {activity}
                </option>
              ))}
            </select>
          ) : (
            <Picker
              selectedValue={activities}
              onValueChange={handleActivitiesChange}
              style={styles.picker}
              enabled={!isDisabled}
            >
              <Picker.Item label="Select an activity..." value="" />
              {MOOD_ACTIVITIES.map((activity) => (
                <Picker.Item key={activity} label={activity} value={activity} />
              ))}
            </Picker>
          )}
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          isDisabled && styles.disabledButton
        ]}
        onPress={handleSubmit}
        disabled={isDisabled}
        activeOpacity={0.8}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>
            {initialValues ? 'Update Mood' : 'Log Mood'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  moodValue: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  moodTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  moodTextLow: {
    fontSize: 14,
    color: '#888',
  },
  moodTextHigh: {
    fontSize: 14,
    color: '#888',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderMarkers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -10,
  },
  sliderMark: {
    width: 2,
    height: 10,
    backgroundColor: '#ccc',
  },
  energyValue: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
    color: '#002D62',
  },
  energyMarkers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -5,
  },
  energyLabel: {
    fontSize: 12,
    color: '#666',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    width: '100%',
    height: 50,
  },
  webPicker: {
    width: '100%',
    height: 50,
    padding: 10,
    borderWidth: 0, // Changed from 'border: none' to appropriate React Native style
    backgroundColor: 'transparent',
  },
  submitButton: {
    backgroundColor: '#002D62',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default MoodForm;