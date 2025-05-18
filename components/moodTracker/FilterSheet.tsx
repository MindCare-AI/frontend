"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, ScrollView, Platform } from "react-native"
import { Modal, Portal, Text, Button, RadioButton, Divider, TextInput, useTheme } from "react-native-paper"
import { type SortBy, type SortOrder, ACTIVITIES } from "../../types/mood/mood"
import MultiSlider from "@ptomasroos/react-native-multi-slider"

interface FilterSheetProps {
  visible: boolean
  onDismiss: () => void
  initialValues: {
    sortBy: SortBy
    sortOrder: SortOrder
    moodRange: [number, number]
    activity: string
    searchText: string
  }
  onApplyFilters: (
    sortBy: SortBy,
    sortOrder: SortOrder,
    moodRange: [number, number],
    activity: string,
    searchText: string,
  ) => void
}

export default function FilterSheet({ visible, onDismiss, initialValues, onApplyFilters }: FilterSheetProps) {
  const theme = useTheme()

  const [sortBy, setSortBy] = useState<SortBy>(initialValues.sortBy)
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialValues.sortOrder)
  const [moodRange, setMoodRange] = useState<[number, number]>(initialValues.moodRange)
  const [activity, setActivity] = useState(initialValues.activity)
  const [searchText, setSearchText] = useState(initialValues.searchText)

  // Update local state when initialValues change
  useEffect(() => {
    setSortBy(initialValues.sortBy)
    setSortOrder(initialValues.sortOrder)
    setMoodRange(initialValues.moodRange)
    setActivity(initialValues.activity)
    setSearchText(initialValues.searchText)
  }, [initialValues])

  const handleReset = () => {
    setSortBy("logged_at")
    setSortOrder("desc")
    setMoodRange([1, 10])
    setActivity("all")
    setSearchText("")
  }

  const handleApply = () => {
    onApplyFilters(sortBy, sortOrder, moodRange, activity, searchText)
  }

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={Platform.OS === "web" ? styles.webModalContainer : styles.modalContainer}
      >
        <View style={styles.header}>
          <Text variant="titleLarge">Filter & Sort</Text>
          <Text variant="bodySmall" style={styles.subtitle}>
            Customize how your mood entries are displayed
          </Text>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Sort By
            </Text>
            <RadioButton.Group onValueChange={(value) => setSortBy(value as SortBy)} value={sortBy}>
              <RadioButton.Item label="Date Logged" value="logged_at" />
              <RadioButton.Item label="Creation Date" value="created_at" />
              <RadioButton.Item label="Mood Rating" value="mood_rating" />
            </RadioButton.Group>
          </View>

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Sort Order
            </Text>
            <RadioButton.Group onValueChange={(value) => setSortOrder(value as SortOrder)} value={sortOrder}>
              <View style={styles.radioRow}>
                <RadioButton.Item label="Newest First" value="desc" />
                <RadioButton.Item label="Oldest First" value="asc" />
              </View>
            </RadioButton.Group>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <View style={styles.sliderHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Mood Range
              </Text>
              <Text variant="bodyMedium">
                {moodRange[0]} - {moodRange[1]}
              </Text>
            </View>
            <View style={styles.sliderContainer}>
              <MultiSlider
                values={[moodRange[0], moodRange[1]]}
                min={1}
                max={10}
                step={1}
                sliderLength={Platform.OS === "web" ? 300 : 280}
                onValuesChange={(values) => setMoodRange([values[0], values[1]] as [number, number])}
                selectedStyle={{ backgroundColor: theme.colors.primary }}
                markerStyle={{ backgroundColor: theme.colors.primary }}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Activity
            </Text>
            <RadioButton.Group onValueChange={setActivity} value={activity}>
              <RadioButton.Item label="All Activities" value="all" />
              {ACTIVITIES.map((act) => (
                <RadioButton.Item key={act} label={act} value={act.toLowerCase()} />
              ))}
            </RadioButton.Group>
          </View>

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Search Notes
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Search in notes..."
              value={searchText}
              onChangeText={setSearchText}
              style={styles.searchInput}
            />
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button mode="outlined" onPress={handleReset} style={styles.button}>
            Reset
          </Button>
          <Button mode="contained" onPress={handleApply} style={styles.button}>
            Apply Filters
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
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  radioRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sliderContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  searchInput: {
    marginTop: 8,
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
