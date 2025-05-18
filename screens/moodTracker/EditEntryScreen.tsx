"use client"

import { useState } from "react"
import { View, StyleSheet, ScrollView, Alert } from "react-native"
import { useTheme, Text, Button, TextInput } from "react-native-paper"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../../navigation/mood/MoodNavigator"
import { ACTIVITIES, getMoodDescription, getEnergyDescription } from "../../types/mood/mood"
import Slider from "@react-native-community/slider"
import { Dropdown } from "react-native-paper-dropdown"

type EditEntryScreenProps = NativeStackScreenProps<RootStackParamList, "EditEntry">

export default function EditEntryScreen({ route, navigation }: EditEntryScreenProps) {
  const { entry } = route.params
  const theme = useTheme()
  const [moodRating, setMoodRating] = useState(entry.mood_rating)
  const [energyLevel, setEnergyLevel] = useState(entry.energy_level)
  const [activity, setActivity] = useState(entry.activity)
  const [notes, setNotes] = useState(entry.notes)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const activityList = ACTIVITIES.map((act) => ({
    label: act,
    value: act,
  }))

  const handleSave = () => {
    if (!activity) {
      Alert.alert("Error", "Please select an activity")
      return
    }

    setIsSubmitting(true)

    // In a real app, this would be an API call to update the entry
    setTimeout(() => {
      setIsSubmitting(false)
      Alert.alert("Success", "Mood entry updated successfully", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ])
    }, 1000)
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <View style={styles.formSection}>
          <View style={styles.sliderHeader}>
            <Text variant="titleMedium">Mood Rating</Text>
            <Text variant="bodyMedium">
              {moodRating} - {getMoodDescription(moodRating)}
            </Text>
          </View>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderIcon}>😔</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={moodRating}
              onValueChange={setMoodRating}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor="#ddd"
              thumbTintColor={theme.colors.primary}
            />
            <Text style={styles.sliderIcon}>😄</Text>
          </View>
        </View>

        <View style={styles.formSection}>
          <View style={styles.sliderHeader}>
            <Text variant="titleMedium">Energy Level</Text>
            <Text variant="bodyMedium">{getEnergyDescription(energyLevel)}</Text>
          </View>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderIcon}>⚡</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={5}
              step={1}
              value={energyLevel}
              onValueChange={setEnergyLevel}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor="#ddd"
              thumbTintColor={theme.colors.primary}
            />
            <Text style={styles.sliderIcon}>⚡⚡</Text>
          </View>
        </View>

        <View style={styles.formSection}>          <Text variant="titleMedium" style={styles.inputLabel}>
            Activity
          </Text>
          <Dropdown
            label={"Select an activity"}
            mode={"outlined"}
            value={activity}
            onSelect={(value) => value !== undefined && setActivity(value)}
            options={activityList}
          />
        </View>

        <View style={styles.formSection}>
          <Text variant="titleMedium" style={styles.inputLabel}>
            Notes (Optional)
          </Text>
          <TextInput
            mode="outlined"
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
            placeholder="How are you feeling? What's on your mind?"
            style={styles.notesInput}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.button}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={isSubmitting}
            disabled={isSubmitting || !activity}
            style={styles.button}
          >
            Save Changes
          </Button>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  formContainer: {
    padding: 16,
  },
  formSection: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderIcon: {
    fontSize: 20,
    marginHorizontal: 8,
  },
  inputLabel: {
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: "white",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
})
