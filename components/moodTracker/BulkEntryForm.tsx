"use client"

import { useState } from "react"
import { View, StyleSheet, ScrollView, Platform } from "react-native"
import { Modal, Portal, Text, Button, useTheme, Chip, IconButton } from "react-native-paper"
import DateTimePicker from "@react-native-community/datetimepicker"
import { format } from "date-fns"
import { ACTIVITIES } from "../../types/mood/mood"

interface BulkEntryFormProps {
  visible: boolean
  onDismiss: () => void
  onSave: () => void
}

interface BulkEntry {
  id: string
  date: Date
  mood_rating: number
  activity: string
}

export default function BulkEntryForm({ visible, onDismiss, onSave }: BulkEntryFormProps) {
  const theme = useTheme()
  const [entries, setEntries] = useState<BulkEntry[]>([
    {
      id: "1",
      date: new Date(),
      mood_rating: 5,
      activity: "",
    },
  ])
  const [showDatePicker, setShowDatePicker] = useState<string | null>(null)
  const [showActivityPicker, setShowActivityPicker] = useState<string | null>(null)

  const handleAddEntry = () => {
    setEntries([
      ...entries,
      {
        id: Date.now().toString(),
        date: new Date(),
        mood_rating: 5,
        activity: "",
      },
    ])
  }

  const handleRemoveEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries(entries.filter((entry) => entry.id !== id))
    }
  }

  const handleDateChange = (id: string, date: Date) => {
    setEntries(entries.map((entry) => (entry.id === id ? { ...entry, date } : entry)))
    if (Platform.OS !== "ios") {
      setShowDatePicker(null)
    }
  }

  const handleMoodChange = (id: string, value: number) => {
    setEntries(entries.map((entry) => (entry.id === id ? { ...entry, mood_rating: value } : entry)))
  }

  const handleActivityChange = (id: string, activity: string) => {
    setEntries(entries.map((entry) => (entry.id === id ? { ...entry, activity } : entry)))
    setShowActivityPicker(null)
  }

  const handleSave = () => {
    // Validate entries
    const isValid = entries.every((entry) => entry.activity)
    if (!isValid) {
      alert("Please select an activity for each entry")
      return
    }

    onSave()
  }

  const renderMoodChips = (entryId: string, selectedMood: number) => {
    return (
      <View style={styles.moodChipsContainer}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((mood) => (
          <Chip
            key={mood}
            selected={selectedMood === mood}
            onPress={() => handleMoodChange(entryId, mood)}
            style={[styles.moodChip, selectedMood === mood && { backgroundColor: theme.colors.primary }]}
            textStyle={selectedMood === mood ? { color: "white" } : undefined}
          >
            {mood}
          </Chip>
        ))}
      </View>
    )
  }

  const renderActivityPicker = (entryId: string) => {
    if (showActivityPicker !== entryId) return null

    return (
      <View style={styles.activityPickerContainer}>
        <ScrollView style={styles.activityScroll}>
          {ACTIVITIES.map((activity) => (
            <Button
              key={activity}
              mode="text"
              onPress={() => handleActivityChange(entryId, activity)}
              style={styles.activityButton}
            >
              {activity}
            </Button>
          ))}
        </ScrollView>
        <Button onPress={() => setShowActivityPicker(null)}>Cancel</Button>
      </View>
    )
  }

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={Platform.OS === "web" ? styles.webModalContainer : styles.modalContainer}
      >
        <View style={styles.header}>
          <Text variant="titleLarge">Bulk Entry</Text>
          <Text variant="bodySmall" style={styles.subtitle}>
            Add multiple mood entries at once
          </Text>
        </View>

        <ScrollView style={styles.scrollView}>
          {entries.map((entry) => (
            <View key={entry.id} style={styles.entryContainer}>
              <View style={styles.entryHeader}>
                <Text variant="titleMedium">Entry {entries.indexOf(entry) + 1}</Text>
                <IconButton
                  icon="close"
                  size={20}
                  onPress={() => handleRemoveEntry(entry.id)}
                  disabled={entries.length === 1}
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text variant="bodyMedium">Date & Time:</Text>
                <Button mode="outlined" onPress={() => setShowDatePicker(entry.id)} style={styles.dateButton}>
                  {format(entry.date, "MMM d, yyyy h:mm a")}
                </Button>

                {showDatePicker === entry.id && (
                  <DateTimePicker
                    value={entry.date}
                    mode="datetime"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(_, date) => date && handleDateChange(entry.id, date)}
                  />
                )}
              </View>

              <View style={styles.fieldContainer}>
                <Text variant="bodyMedium">Mood Rating:</Text>
                {renderMoodChips(entry.id, entry.mood_rating)}
              </View>

              <View style={styles.fieldContainer}>
                <Text variant="bodyMedium">Activity:</Text>
                <Button
                  mode="outlined"
                  onPress={() => setShowActivityPicker(entry.id)}
                  style={styles.activitySelectButton}
                >
                  {entry.activity || "Select Activity"}
                </Button>
                {renderActivityPicker(entry.id)}
              </View>
            </View>
          ))}

          <Button mode="outlined" icon="plus" onPress={handleAddEntry} style={styles.addButton}>
            Add Another Entry
          </Button>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button mode="outlined" onPress={onDismiss} style={styles.button}>
            Cancel
          </Button>
          <Button mode="contained" onPress={handleSave} style={styles.button}>
            Save All Entries
          </Button>
        </View>
      </Modal>
    </Portal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "white",
    margin: 0,
    marginTop: "auto",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: "80%",
  },
  webModalContainer: {
    backgroundColor: "white",
    margin: 40,
    padding: 20,
    borderRadius: 8,
    maxHeight: "80%",
    maxWidth: 600,
    alignSelf: "center",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  subtitle: {
    color: "#666",
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  entryContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  dateButton: {
    marginTop: 8,
  },
  moodChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 8,
  },
  moodChip: {
    margin: 2,
  },
  activitySelectButton: {
    marginTop: 8,
  },
  activityPickerContainer: {
    marginTop: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 8,
  },
  activityScroll: {
    maxHeight: 200,
  },
  activityButton: {
    justifyContent: "flex-start",
    paddingVertical: 4,
  },
  addButton: {
    margin: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
})
