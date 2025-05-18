"use client"

import React from "react"
import { View, StyleSheet, FlatList, Alert, Platform } from "react-native"
import { Card, Text, IconButton, Menu, Divider, useTheme, Chip } from "react-native-paper"
import { format } from "date-fns"
import type { MoodEntry } from "../../types/mood/mood"
import { getMoodDescription, getEnergyDescription } from "../../types/mood/mood"
import { getMoodColor, getMoodTextColor } from "../../screens/moodTracker/theme/theme"
import { MaterialCommunityIcons } from "@expo/vector-icons"

interface MoodFeedListProps {
  data: MoodEntry[]
  onViewDetails: (entry: MoodEntry) => void
  onEditEntry: (entry: MoodEntry) => void
  isLoading: boolean
  error?: string
}

export default function MoodFeedList({ data, onViewDetails, onEditEntry, isLoading, error }: MoodFeedListProps) {
  const theme = useTheme()
  const [menuVisible, setMenuVisible] = React.useState<Record<number, boolean>>({})

  const toggleMenu = (id: number) => {
    setMenuVisible((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleDelete = (id: number) => {
    Alert.alert("Delete Entry", "Are you sure you want to delete this mood entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          // In a real app, this would call an API to delete the entry
          Alert.alert("Success", `Entry #${id} deleted successfully`)
        },
      },
    ])
  }

  // Get icon for activity
  const getActivityIcon = (activity: string) => {
    const iconMap: Record<string, string> = {
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

  const renderItem = ({ item }: { item: MoodEntry }) => {
    const moodColor = getMoodColor(item.mood_rating)
    const moodTextColor = getMoodTextColor(item.mood_rating)

    return (
      <Card
        style={[styles.card, item.ai_flagged && styles.aiFlaggedCard]}
        onPress={() => onViewDetails(item)}
        mode="elevated"
      >
        {item.ai_flagged && (
          <View style={styles.aiInsightBanner}>
            <MaterialCommunityIcons name="robot" size={16} color="#fff" />
            <Text style={styles.aiInsightText}>AI Insight Available</Text>
          </View>
        )}
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="bodySmall" style={styles.date}>
              {format(item.logged_at, "MMM d, yyyy • h:mm a")}
            </Text>

            <Menu
              visible={menuVisible[item.id] || false}
              onDismiss={() => toggleMenu(item.id)}
              anchor={<IconButton icon="dots-vertical" size={20} onPress={() => toggleMenu(item.id)} />}
            >
              <Menu.Item
                onPress={() => {
                  toggleMenu(item.id)
                  onEditEntry(item)
                }}
                title="Edit"
                leadingIcon="pencil"
              />
              <Divider />
              <Menu.Item
                onPress={() => {
                  toggleMenu(item.id)
                  handleDelete(item.id)
                }}
                title="Delete"
                leadingIcon="delete"
              />
            </Menu>
          </View>

          <View style={styles.chipContainer}>
            <Chip
              style={[styles.moodChip, { backgroundColor: moodColor }]}
              textStyle={{ color: moodTextColor }}
              icon="heart"
            >
              {item.mood_rating} - {getMoodDescription(item.mood_rating)}
            </Chip>

            <Chip style={styles.energyChip} icon="lightning-bolt">
              {getEnergyDescription(item.energy_level)}
            </Chip>
          </View>

          <View style={styles.chipContainer}>
            <Chip
              style={styles.activityChip}
              icon={() => (
                <MaterialCommunityIcons
                  name={getActivityIcon(item.activity) as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={16}
                  color={theme.colors.primary}
                />
              )}
            >
              {item.activity}
            </Chip>

            {item.has_journal && (
              <Chip style={styles.journalChip} icon="book-open">
                Journal
              </Chip>
            )}
          </View>

          {item.notes && (
            <Text style={styles.notes} numberOfLines={2}>
              {item.notes}
            </Text>
          )}

          {item.updated_at && (
            <Text style={styles.updatedText}>Updated: {format(item.updated_at, "MMM d, yyyy • h:mm a")}</Text>
          )}
          
          {/* Web-specific action buttons */}
          <View style={styles.webActions}>
            <IconButton
              icon="pencil"
              mode="contained-tonal"
              size={20}
              onPress={() => onEditEntry(item)}
              style={{ backgroundColor: theme.colors.primary }}
              iconColor="#fff"
            />
            <IconButton
              icon="delete"
              mode="contained-tonal"
              size={20}
              onPress={() => handleDelete(item.id)}
              style={{ backgroundColor: theme.colors.error }}
              iconColor="#fff"
            />
          </View>
        </Card.Content>
      </Card>
    )
  }

  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.error} />
        <Text style={[styles.emptyText, { color: theme.colors.error }]}>Error loading mood entries: {error}</Text>
        <Text style={styles.emptySubText}>Pull down to refresh or try again later</Text>
      </View>
    )
  }

  if (data.length === 0 && !isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="emoticon-sad-outline" size={48} color={theme.colors.outline} />
        <Text style={styles.emptyText}>No mood entries found for the selected filters.</Text>
      </View>
    )
  }

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={true}
    />
  )
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Extra space for FAB
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  aiFlaggedCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B6B",
  },
  aiInsightBanner: {
    backgroundColor: "#FF6B6B",
    padding: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  aiInsightText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "bold",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  date: {
    color: "#666",
    marginTop: 4,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 8,
  },
  moodChip: {
    height: 28,
  },
  energyChip: {
    height: 28,
    backgroundColor: "#f0f0f0",
  },
  activityChip: {
    height: 28,
    backgroundColor: "#e6e0f0",
  },
  journalChip: {
    height: 28,
    backgroundColor: "#f0f0f0",
  },
  notes: {
    marginTop: 8,
    fontSize: 14,
    color: "#333",
  },
  updatedText: {
    marginTop: 4,
    fontSize: 10,
    color: "#888",
    fontStyle: "italic",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    marginTop: 12,
    textAlign: "center",
    color: "#666",
  },
  emptySubText: {
    marginTop: 8,
    textAlign: "center",
    color: "#888",
    fontSize: 12,
  },
  webActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    gap: 8,
  }
})
