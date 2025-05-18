"use client"
import { View, StyleSheet, ScrollView, Alert } from "react-native"
import { useTheme, Text, Button, Chip, Card, Divider } from "react-native-paper"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../../navigation/mood/MoodNavigator"
import { format } from "date-fns"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { getMoodDescription, getEnergyDescription } from "../../types/mood/mood"
import { getMoodColor, getMoodTextColor } from "./theme/theme"

type DetailsScreenProps = NativeStackScreenProps<RootStackParamList, "Details">

export default function DetailsScreen({ route, navigation }: DetailsScreenProps) {
  const { entry } = route.params
  const theme = useTheme()

  const moodColor = getMoodColor(entry.mood_rating)
  const moodTextColor = getMoodTextColor(entry.mood_rating)

  // Get icon for activity
  const getActivityIcon = (activity: string): keyof typeof MaterialCommunityIcons.glyphMap => {
    const iconMap: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
      Exercise: "dumbbell",
      Meditation: "meditation",
      Reading: "book-open-page-variant",
      Socializing: "account-group",
      Cooking: "food-variant",
      Working: "briefcase",
      Sleeping: "sleep",
      Walking: "walk",
      Running: "run",
      Yoga: "yoga",
      Dancing: "music",
      Gaming: "gamepad-variant",
      Traveling: "airplane",
      Shopping: "shopping",
      "Listening to Music": "music-note",
      "Watching TV": "television",
      Gardening: "flower",
      Art: "palette",
      Writing: "pen",
      Cleaning: "broom",
    }

    return iconMap[activity] || "briefcase"
  }

  const handleCreateJournal = () => {
    // In a real app, navigate to journal creation screen
    Alert.alert("Create Journal", "Would you like to create a journal entry for this mood?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Create",
        onPress: () => {
          // Navigate to journal creation
          Alert.alert("Success", "Journal entry created and linked to this mood entry")
        },
      },
    ])
  }

  const handleViewJournal = () => {
    // In a real app, navigate to journal view
    Alert.alert("Journal Entry", "This would display the full journal entry associated with this mood")
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.dateContainer}>
        <Text variant="bodyMedium" style={styles.date}>
          {format(entry.logged_at, "MMMM d, yyyy • h:mm a")}
        </Text>
      </View>

      <View style={styles.section}>
        <Text variant="bodySmall" style={styles.sectionLabel}>
          Mood Rating
        </Text>
        <Chip style={[styles.chip, { backgroundColor: moodColor }]} textStyle={{ color: moodTextColor }} icon="heart">
          {entry.mood_rating} - {getMoodDescription(entry.mood_rating)}
        </Chip>
      </View>

      <View style={styles.section}>
        <Text variant="bodySmall" style={styles.sectionLabel}>
          Energy Level
        </Text>
        <Chip style={styles.chip} icon="lightning-bolt">
          {getEnergyDescription(entry.energy_level)}
        </Chip>
      </View>

      <View style={styles.section}>
        <Text variant="bodySmall" style={styles.sectionLabel}>
          Activity
        </Text>
        <Chip
          style={[styles.chip, { backgroundColor: "#e6e0f0" }]}
          icon={() => (
            <MaterialCommunityIcons name={getActivityIcon(entry.activity)} size={16} color={theme.colors.primary} />
          )}
        >
          {entry.activity}
        </Chip>
      </View>

      {entry.notes && (
        <View style={styles.section}>
          <Text variant="bodySmall" style={styles.sectionLabel}>
            Notes
          </Text>
          <Text style={styles.notes}>{entry.notes}</Text>
        </View>
      )}

      <View style={styles.timestampsSection}>
        <Text variant="bodySmall" style={styles.sectionLabel}>
          Timestamps
        </Text>
        <View style={styles.timestampRow}>
          <Text style={styles.timestampLabel}>Created:</Text>
          <Text style={styles.timestampValue}>{format(entry.created_at, "MMM d, yyyy • h:mm a")}</Text>
        </View>
        {entry.updated_at && (
          <View style={styles.timestampRow}>
            <Text style={styles.timestampLabel}>Last Updated:</Text>
            <Text style={styles.timestampValue}>{format(entry.updated_at, "MMM d, yyyy • h:mm a")}</Text>
          </View>
        )}
      </View>

      {entry.ai_flagged && entry.ai_insights && (
        <Card style={styles.aiCard}>
          <Card.Content>
            <View style={styles.aiHeader}>
              <MaterialCommunityIcons name="robot" size={24} color={theme.colors.primary} />
              <Text variant="titleMedium" style={styles.aiTitle}>
                AI Insight
              </Text>
            </View>
            <Text style={styles.aiInsight}>{entry.ai_insights}</Text>
          </Card.Content>
        </Card>
      )}

      <Divider style={styles.divider} />

      <View style={styles.buttonContainer}>
        {entry.has_journal ? (
          <Button mode="contained" icon="book-open" onPress={handleViewJournal} style={styles.button}>
            View Journal
          </Button>
        ) : (
          <Button mode="outlined" icon="book-open" onPress={handleCreateJournal} style={styles.button}>
            Add Journal
          </Button>
        )}

        <Button
          mode="outlined"
          icon="pencil"
          onPress={() => navigation.navigate("EditEntry", { entry })}
          style={styles.button}
        >
          Edit Entry
        </Button>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  dateContainer: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  date: {
    color: "#666",
  },
  section: {
    padding: 16,
    backgroundColor: "white",
    marginTop: 12,
  },
  sectionLabel: {
    color: "#666",
    marginBottom: 8,
  },
  chip: {
    alignSelf: "flex-start",
  },
  notes: {
    fontSize: 16,
    lineHeight: 24,
  },
  timestampsSection: {
    padding: 16,
    backgroundColor: "white",
    marginTop: 12,
  },
  timestampRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  timestampLabel: {
    color: "#666",
    width: 100,
  },
  timestampValue: {
    flex: 1,
  },
  aiCard: {
    margin: 16,
    backgroundColor: "#f8f0ff",
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  aiTitle: {
    marginLeft: 8,
    color: "#6200ee", // Replaced theme.colors.primary with a static purple color
  },
  aiInsight: {
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    marginVertical: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
})
