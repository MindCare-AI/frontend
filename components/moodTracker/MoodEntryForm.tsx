import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { Button, Surface, Text, TextInput, HelperText, Menu, Divider } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
// Import our custom slider instead
import WebFriendlySlider from '../common/WebFriendlySlider';
import { Formik, FormikProps } from 'formik';
import * as Yup from 'yup';

import { MoodFormData } from '../../types/Mood';
import { ACTIVITY_OPTIONS, ENERGY_LEVELS, getMoodDescription } from '../../constants/moodTypes';

// Check if platform is web to avoid using native driver
const isWeb = Platform.OS === 'web';

interface MoodEntryFormProps {
  onSubmit: (data: MoodFormData) => Promise<void>;
  initialValues?: Partial<MoodFormData>;
  onCancel?: () => void;
}

const MoodValidationSchema = Yup.object().shape({
  mood_rating: Yup.number().required('Mood rating is required').min(1).max(10),
  energy_level: Yup.number().min(1).max(5),
});

const MoodEntryForm: React.FC<MoodEntryFormProps> = ({ 
  onSubmit, 
  initialValues, 
  onCancel 
}) => {
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [activitiesMenuVisible, setActivitiesMenuVisible] = useState(false);

  // Animation references
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const defaultValues: MoodFormData = {
    mood_rating: initialValues?.mood_rating || 5,
    energy_level: initialValues?.energy_level,
    activities: initialValues?.activities || undefined,
    logged_at: initialValues?.logged_at || new Date().toISOString(),
  };

  // Entry animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: !isWeb,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: !isWeb,
      }),
    ]).start();
  }, []);

  // Colors for the blue and white theme
  const colors = {
    primary: '#0d6efd',
    lightBlue: '#cfe2ff',
    white: '#ffffff',
    background: '#f8f9fa',
  };

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }],
        width: '100%',
      }}
    >
      <Formik
        initialValues={defaultValues}
        validationSchema={MoodValidationSchema}
        onSubmit={async (values, { resetForm, setSubmitting }) => {
          try {
            await onSubmit(values);
            resetForm();
          } catch (error) {
            console.error('Error submitting mood entry:', error);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ 
          handleChange, 
          handleBlur, 
          handleSubmit, 
          setFieldValue, 
          values, 
          errors, 
          touched, 
          isSubmitting 
        }: FormikProps<MoodFormData>) => (
          <Surface style={[styles.container, { backgroundColor: colors.white }]}>
            <Text variant="titleLarge" style={[styles.title, { color: colors.primary }]}>
              {initialValues ? 'Edit Mood Entry' : 'How are you feeling today?'}
            </Text>
            
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>
                Mood: {values.mood_rating}/10 - {getMoodDescription(values.mood_rating)}
              </Text>
              <WebFriendlySlider
                value={values.mood_rating}
                onValueChange={value => {
                  const ratingValue = Math.round(value);
                  // Animate the slider change
                  const smallBounce = Animated.sequence([
                    Animated.timing(scaleAnim, {
                      toValue: 1.03,
                      duration: 100,
                      useNativeDriver: !isWeb,
                    }),
                    Animated.timing(scaleAnim, {
                      toValue: 1,
                      duration: 100,
                      useNativeDriver: !isWeb,
                    }),
                  ]);
                  smallBounce.start();
                  setFieldValue('mood_rating', ratingValue);
                }}
                minimumValue={1}
                maximumValue={10}
                step={1}
                style={styles.slider}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor="#e0e0e0"
              />
              {touched.mood_rating && errors.mood_rating && (
                <HelperText type="error">{errors.mood_rating as string}</HelperText>
              )}
            </View>
            
            <View style={styles.energyContainer}>
              <Text style={styles.label}>Energy Level</Text>
              <View style={styles.energyLevelsContainer}>
                {ENERGY_LEVELS.map((level) => (
                  <Button
                    key={level.value}
                    mode={values.energy_level === level.value ? "contained" : "outlined"}
                    onPress={() => setFieldValue('energy_level', level.value)}
                    style={styles.energyButton}
                  >
                    {level.label}
                  </Button>
                ))}
              </View>
            </View>
            
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Activity</Text>
              <Menu
                visible={activitiesMenuVisible}
                onDismiss={() => setActivitiesMenuVisible(false)}
                anchor={
                  <Button 
                    mode="outlined" 
                    onPress={() => setActivitiesMenuVisible(true)}
                    style={styles.dropdownButton}
                  >
                    {values.activities || 'Select Activity'}
                  </Button>
                }
              >
                {ACTIVITY_OPTIONS.map((activity) => (
                  <React.Fragment key={activity.value}>
                    <Menu.Item
                      onPress={() => {
                        setFieldValue('activities', activity.value);
                        setActivitiesMenuVisible(false);
                      }}
                      title={activity.label}
                    />
                    <Divider />
                  </React.Fragment>
                ))}
              </Menu>
            </View>
            
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Date and Time</Text>
              <Button
                mode="outlined"
                onPress={() => setDatePickerVisible(true)}
                style={styles.dateButton}
              >
                {new Date(values.logged_at || Date.now()).toLocaleString()}
              </Button>
              
              {datePickerVisible && (
                <DateTimePicker
                  value={new Date(values.logged_at || Date.now())}
                  mode="datetime"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setDatePickerVisible(false);
                    if (selectedDate) {
                      setFieldValue('logged_at', selectedDate.toISOString());
                    }
                  }}
                />
              )}
            </View>
            
            <View style={styles.buttonContainer}>
              {onCancel && (
                <Button 
                  mode="outlined" 
                  onPress={onCancel}
                  style={styles.button} 
                  disabled={isSubmitting}
                  textColor={colors.primary}
                >
                  Cancel
                </Button>
              )}
              <Button 
                mode="contained" 
                onPress={() => handleSubmit()} 
                style={styles.button}
                loading={isSubmitting}
                disabled={isSubmitting}
                buttonColor={colors.primary}
              >
                {initialValues ? 'Update' : 'Save'}
              </Button>
            </View>
          </Surface>
        )}
      </Formik>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
    fontSize: 24,
  },
  ratingContainer: {
    marginBottom: 24,
  },
  ratingLabel: {
    marginBottom: 12,
    fontSize: 16,
  },
  slider: {
    height: 40,
  },
  energyContainer: {
    marginBottom: 24,
  },
  energyLevelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  energyButton: {
    marginVertical: 6,
    width: '18%',
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 12,
    fontSize: 16,
  },
  dropdownButton: {
    width: '100%',
  },
  dateButton: {
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  button: {
    width: '40%',
    borderRadius: 25,
    paddingVertical: 6,
  },
});

export default MoodEntryForm;
