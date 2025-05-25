"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Dimensions, Platform, Animated, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useJournal } from "../../contexts/Journal/JournalContext"
import type { Journal, JournalEntry } from "../../types/Journal/index"
import { Button } from "../../components/Journal/Button"
import { Dialog } from "../../components/Journal/Dialog"
import { Input } from "../../components/Journal/Input"
import { TextArea } from "../../components/Journal/TextArea"
import { IconButton } from "../../components/Journal/IconButton"
import { JournalItem } from "../../components/Journal/JournalItem"
import { EntryItem } from "../../components/Journal/EntryItem"
import { NewJournalCard } from "../../components/Journal/NewJournalCard"
import { colors, spacing, fontSizes, journalColors, journalGradients, shadows, borderRadius } from "../../components/Journal/theme"

// Simple icons for React Native
const TrashIcon = () => <Text style={{ fontSize: 20, color: colors.white }}>🗑️</Text>

const AlertIcon = () => <Text style={{ fontSize: 20, color: colors.danger }}>⚠️</Text>

const { width } = Dimensions.get("window")
const numColumns = Platform.OS === "web" && width > 768 ? 3 : 2
// Improved card width calculation with better spacing
const horizontalPadding = spacing.lg
const cardSpacing = spacing.md
const availableWidth = width - (horizontalPadding * 2) - (cardSpacing * (numColumns - 1))
const cardWidth = availableWidth / numColumns

export default function JournalDashboard() {
  const { journals, entries, addJournal, updateJournal, deleteJournal, addEntry, updateEntry, deleteEntry, fetchEntries, fetchCategories, loading, error } =
    useJournal()

  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null)
  const [editingJournal, setEditingJournal] = useState<Journal | null>(null)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [newJournalTitle, setNewJournalTitle] = useState("")
  const [newJournalColor, setNewJournalColor] = useState(journalGradients[0].start) // Use first gradient color as default
  const [newEntryContent, setNewEntryContent] = useState("")

  // Use gradient start colors for the color options
  const colorOptions = journalGradients.map(gradient => gradient.start)

  // Animation values for enhanced popups
  const dialogScaleAnim = useRef(new Animated.Value(0)).current
  const dialogOpacityAnim = useRef(new Animated.Value(0)).current

  // Animation for staggered card appearance
  const cardAnimations = useRef<Animated.Value[]>([]).current
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetchCategories()
        await fetchEntries()
      } catch (error) {
        console.error("Error initializing journal data:", error)
        Alert.alert("Error", "Failed to load journal data. Please try again.")
      }
    }
    
    initializeData()
  }, [])

  const [isEntryModalVisible, setIsEntryModalVisible] = useState(false)
  const [isNewJournalModalVisible, setIsNewJournalModalVisible] = useState(false)
  const [isEditJournalModalVisible, setIsEditJournalModalVisible] = useState(false)
  const [isDeleteJournalModalVisible, setIsDeleteJournalModalVisible] = useState(false)
  const [isEditEntryModalVisible, setIsEditEntryModalVisible] = useState(false)
  const [isDeleteEntryModalVisible, setIsDeleteEntryModalVisible] = useState(false)
  const [isAddingEntry, setIsAddingEntry] = useState(false)

  // Add loading states for individual actions
  const [isCreatingJournal, setIsCreatingJournal] = useState(false)
  const [isUpdatingJournal, setIsUpdatingJournal] = useState(false)
  const [isDeletingJournal, setIsDeletingJournal] = useState(false)
  const [isCreatingEntry, setIsCreatingEntry] = useState(false)
  const [isUpdatingEntry, setIsUpdatingEntry] = useState(false)
  const [isDeletingEntry, setIsDeletingEntry] = useState(false)

  // Initialize animations for cards
  useEffect(() => {
    const totalCards = journals.length + 1 // +1 for new journal card
    cardAnimations.length = totalCards
    
    for (let i = 0; i < totalCards; i++) {
      if (!cardAnimations[i]) {
        cardAnimations[i] = new Animated.Value(0)
      }
    }
  }, [journals.length])

  // Animate cards in sequence when journals load
  useEffect(() => {
    if (journals.length > 0 && isInitialLoad) {
      const totalCards = journals.length + 1
      const animations = []
      
      // Reset all animations
      cardAnimations.forEach((anim, index) => {
        if (index < totalCards) {
          anim.setValue(0)
        }
      })

      // Create staggered animations
      for (let i = 0; i < totalCards; i++) {
        animations.push(
          Animated.timing(cardAnimations[i], {
            toValue: 1,
            duration: 600,
            delay: i * 150, // 150ms delay between each card
            useNativeDriver: true,
          })
        )
      }

      // Start all animations
      Animated.stagger(150, animations).start(() => {
        setIsInitialLoad(false)
      })
    }
  }, [journals.length, isInitialLoad])

  const handleJournalPress = (journal: Journal) => {
    console.log("Journal pressed:", journal.name)
    setSelectedJournal(journal)
    setIsAddingEntry(false)
    setIsEntryModalVisible(true)
  }

  const handleJournalLongPress = (journal: Journal) => {
    console.log("Journal long pressed:", journal.name)
    setEditingJournal(journal)
    setNewJournalTitle(journal.name)
    setNewJournalColor(journal.color || colors.primary)
    setIsEditJournalModalVisible(true)
  }

  const handleEntryLongPress = (entry: JournalEntry) => {
    console.log("Entry long pressed:", entry.id)
    setEditingEntry(entry)
    setNewEntryContent(entry.content)
    setIsEditEntryModalVisible(true)
  }

  const handleNewJournalPress = () => {
    setNewJournalTitle("")
    setNewJournalColor(journalGradients[0].start) // Reset to first gradient color
    setIsNewJournalModalVisible(true)
  }

  const handleAddJournal = async () => {
    if (!newJournalTitle.trim()) {
      Alert.alert("Error", "Journal title cannot be empty")
      return
    }

    try {
      setIsCreatingJournal(true)
      await addJournal({
        name: newJournalTitle,
        color: newJournalColor,
        icon: null,
      })
      setIsNewJournalModalVisible(false)
      setNewJournalTitle("")
      setNewJournalColor(colors.primary)
    } catch (error) {
      Alert.alert("Error", "Failed to create journal. Please try again.")
    } finally {
      setIsCreatingJournal(false)
    }
  }

  const handleEditJournal = async () => {
    if (!editingJournal || !newJournalTitle.trim()) {
      Alert.alert("Error", "Journal title cannot be empty")
      return
    }

    try {
      setIsUpdatingJournal(true)
      await updateJournal(editingJournal.id, {
        name: newJournalTitle,
        color: newJournalColor || undefined
      })
      setIsEditJournalModalVisible(false)
      setEditingJournal(null)
    } catch (error) {
      Alert.alert("Error", "Failed to update journal. Please try again.")
    } finally {
      setIsUpdatingJournal(false)
    }
  }

  const handleDeleteJournal = async () => {
    if (!editingJournal) return

    try {
      setIsDeletingJournal(true)
      await deleteJournal(editingJournal.id)
      setIsDeleteJournalModalVisible(false)
      setEditingJournal(null)
      setSelectedJournal(null)
      setIsEntryModalVisible(false)
    } catch (error) {
      Alert.alert("Error", "Failed to delete journal. Please try again.")
    } finally {
      setIsDeletingJournal(false)
    }
  }

  const handleAddEntry = async () => {
    if (!selectedJournal || !newEntryContent.trim()) {
      Alert.alert("Error", "Entry content cannot be empty")
      return
    }

    try {
      setIsCreatingEntry(true)
      await addEntry({
        content: newEntryContent,
        category: selectedJournal.id,
        is_private: true,
        shared_with_therapist: false,
        title: ''
      })
      setNewEntryContent("")
      setIsAddingEntry(false)
    } catch (error) {
      Alert.alert("Error", "Failed to create entry. Please try again.")
    } finally {
      setIsCreatingEntry(false)
    }
  }

  const handleUpdateEntry = async () => {
    if (!editingEntry || !newEntryContent.trim()) {
      Alert.alert("Error", "Entry content cannot be empty")
      return
    }

    try {
      setIsUpdatingEntry(true)
      await updateEntry(editingEntry.id, { content: newEntryContent })
      setIsEditEntryModalVisible(false)
      setEditingEntry(null)
      setNewEntryContent("")
    } catch (error) {
      Alert.alert("Error", "Failed to update entry. Please try again.")
    } finally {
      setIsUpdatingEntry(false)
    }
  }

  const handleDeleteEntry = async () => {
    if (!editingEntry) return

    try {
      setIsDeletingEntry(true)
      await deleteEntry(editingEntry.id)
      setIsDeleteEntryModalVisible(false)
      setEditingEntry(null)
    } catch (error) {
      Alert.alert("Error", "Failed to delete entry. Please try again.")
    } finally {
      setIsDeletingEntry(false)
    }
  }

  const entriesForSelectedJournal = Array.isArray(entries) ? 
    entries.filter((entry) => selectedJournal && entry.category === selectedJournal.id) 
    : []

  // Create data array that includes journals + new journal card
  const gridData = [...journals, { id: 'new-journal', isNewCard: true }]

  const renderGridItem = ({ item, index }: { item: any, index: number }) => {
    // Get the animation value for this card
    const animationValue = cardAnimations[index] || new Animated.Value(1)
    
    const animatedStyle = {
      opacity: animationValue,
      transform: [
        {
          scale: animationValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1],
          }),
        },
        {
          translateY: animationValue.interpolate({
            inputRange: [0, 1],
            outputRange: [30, 0],
          }),
        },
      ],
    }

    if (item.isNewCard) {
      return (
        <Animated.View style={[{ width: cardWidth }, animatedStyle]}>
          <NewJournalCard onPress={handleNewJournalPress} width={cardWidth} />
        </Animated.View>
      )
    }
    
    return (
      <Animated.View style={[{ width: cardWidth }, animatedStyle]}>
        <JournalItem
          journal={item}
          onJournalPress={handleJournalPress}
          onJournalLongPress={handleJournalLongPress}
          width={cardWidth}
        />
      </Animated.View>
    )
  }

  // Add the missing renderEntryItem function
  const renderEntryItem = ({ item }: { item: JournalEntry }) => (
    <EntryItem
      entry={item}
      onEntryLongPress={handleEntryLongPress}
    />
  )

  // Enhanced dialog animation
  const animateDialogIn = () => {
    Animated.parallel([
      Animated.spring(dialogScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(dialogOpacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const animateDialogOut = (callback: () => void) => {
    Animated.parallel([
      Animated.spring(dialogScaleAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(dialogOpacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(callback)
  }

  // Enhanced color picker component with gradient colors
  const ColorPicker = ({ selectedColor, onColorSelect }: { selectedColor: string, onColorSelect: (color: string) => void }) => (
    <View style={styles.colorPicker}>
      {colorOptions.map((color: string, index: number) => (
        <TouchableOpacity
          key={color}
          style={[
            styles.colorOption,
            { backgroundColor: color },
            selectedColor === color && styles.selectedColorOption,
          ]}
          onPress={() => onColorSelect(color)}
          activeOpacity={0.8}
        >
          {selectedColor === color && (
            <Text style={styles.checkMark}>✓</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  )

  // Show loading screen if initial data is loading
  if (loading && journals.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading journals...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Journals</Text>
          <Text style={styles.subtitle}>{journals.length} {journals.length === 1 ? 'journal' : 'journals'}</Text>
        </View>
      </View>

      <FlatList
        data={gridData}
        renderItem={renderGridItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.journalGrid : undefined}
        contentContainerStyle={styles.journalList}
        showsVerticalScrollIndicator={false}
        // Improved spacing between items
        ItemSeparatorComponent={() => <View style={{ height: cardSpacing }} />}
      />

      {/* Enhanced Journal Entry Modal */}
      <Dialog
        visible={isEntryModalVisible}
        onClose={() => setIsEntryModalVisible(false)}
        title={selectedJournal?.name}
        enhanced={true}
        footer={
          isAddingEntry ? (
            <View style={styles.dialogFooter}>
              <Button 
                variant="outline" 
                onPress={() => setIsAddingEntry(false)}
                disabled={isCreatingEntry}
              >
                Cancel
              </Button>
              <Button 
                onPress={handleAddEntry}
                isLoading={isCreatingEntry}
                disabled={isCreatingEntry}
              >
                Save Entry
              </Button>
            </View>
          ) : null
        }
      >
        <View>
          <View style={styles.entryModalHeader}>
            <View style={[styles.colorDot, { backgroundColor: selectedJournal?.color }]} />
            <Text style={styles.entryCount}>
              {selectedJournal?.entries_count ?? 0} {selectedJournal?.entries_count === 1 ? "entry" : "entries"}
            </Text>
            <Button variant="outline" size="sm" onPress={() => setIsAddingEntry(!isAddingEntry)}>
              {isAddingEntry ? "View Entries" : "Add Entry"}
            </Button>
          </View>

          {isAddingEntry ? (
            <TextArea
              placeholder="Write your thoughts here..."
              value={newEntryContent}
              onChangeText={setNewEntryContent}
              height={200}
            />
          ) : (
            <View style={styles.entriesList}>
              {entriesForSelectedJournal.length > 0 ? (
                <FlatList
                  data={entriesForSelectedJournal}
                  renderItem={renderEntryItem}
                  keyExtractor={(item) => item.id.toString()}
                  contentContainerStyle={styles.entriesListContent}
                />
              ) : (
                <View style={styles.emptyEntries}>
                  <Text style={styles.emptyEntriesText}>No entries yet</Text>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => setIsAddingEntry(true)}
                    style={styles.createFirstEntryButton}
                  >
                    Create your first entry
                  </Button>
                </View>
              )}
            </View>
          )}
        </View>
      </Dialog>

      {/* Enhanced New Journal Modal */}
      <Dialog
        visible={isNewJournalModalVisible}
        onClose={() => setIsNewJournalModalVisible(false)}
        title="Create New Journal"
        enhanced={true}
        footer={
          <View style={styles.dialogFooter}>
            <Button 
              variant="outline" 
              onPress={() => setIsNewJournalModalVisible(false)}
              disabled={isCreatingJournal}
            >
              Cancel
            </Button>
            <Button 
              onPress={handleAddJournal}
              isLoading={isCreatingJournal}
              disabled={isCreatingJournal}
            >
              Create Journal
            </Button>
          </View>
        }
      >
        <View>
          <Input
            label="Journal Name"
            placeholder="e.g., Dream Journal"
            value={newJournalTitle}
            onChangeText={setNewJournalTitle}
          />

          <Text style={styles.colorPickerLabel}>Choose Color</Text>
          <ColorPicker 
            selectedColor={newJournalColor} 
            onColorSelect={setNewJournalColor}
          />
        </View>
      </Dialog>

      {/* Edit Journal Modal */}
      <Dialog
        visible={isEditJournalModalVisible}
        onClose={() => setIsEditJournalModalVisible(false)}
        title="Edit Journal"
        footer={
          <View style={styles.dialogFooter}>
            <Button 
              variant="destructive" 
              onPress={() => setIsDeleteJournalModalVisible(true)}
              disabled={isUpdatingJournal}
            >
              <View style={styles.buttonWithIcon}>
                <TrashIcon />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </View>
            </Button>
            <View style={styles.rightButtons}>
              <Button 
                variant="outline" 
                onPress={() => setIsEditJournalModalVisible(false)} 
                style={styles.cancelButton}
                disabled={isUpdatingJournal}
              >
                Cancel
              </Button>
              <Button 
                onPress={handleEditJournal}
                isLoading={isUpdatingJournal}
                disabled={isUpdatingJournal}
              >
                Save Changes
              </Button>
            </View>
          </View>
        }
        enhanced={true}
      >
        <View>
          <Input label="Journal Name" value={newJournalTitle} onChangeText={setNewJournalTitle} />

          <Text style={styles.colorPickerLabel}>Choose Color</Text>
          <ColorPicker 
            selectedColor={newJournalColor} 
            onColorSelect={setNewJournalColor}
          />
        </View>
      </Dialog>

      {/* Delete Journal Confirmation Modal */}
      <Dialog
        visible={isDeleteJournalModalVisible}
        onClose={() => setIsDeleteJournalModalVisible(false)}
        title="Delete Journal"
        footer={
          <View style={styles.dialogFooter}>
            <Button 
              variant="outline" 
              onPress={() => setIsDeleteJournalModalVisible(false)}
              disabled={isDeletingJournal}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onPress={handleDeleteJournal}
              isLoading={isDeletingJournal}
              disabled={isDeletingJournal}
            >
              Delete Journal
            </Button>
          </View>
        }
        enhanced={true}
      >
        <View style={styles.deleteConfirmation}>
          <View style={styles.alertIconContainer}>
            <AlertIcon />
          </View>
          <Text style={styles.deleteConfirmationText}>
            Are you sure you want to delete "{editingJournal?.name}"? This will permanently remove the journal and all
            its entries. This action cannot be undone.
          </Text>
        </View>
      </Dialog>

      {/* Edit Entry Modal */}
      <Dialog
        visible={isEditEntryModalVisible}
        onClose={() => setIsEditEntryModalVisible(false)}
        title="Edit Entry"
        footer={
          <View style={styles.dialogFooter}>
            <Button 
              variant="destructive" 
              onPress={() => setIsDeleteEntryModalVisible(true)}
              disabled={isUpdatingEntry}
            >
              <View style={styles.buttonWithIcon}>
                <TrashIcon />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </View>
            </Button>
            <View style={styles.rightButtons}>
              <Button 
                variant="outline" 
                onPress={() => setIsEditEntryModalVisible(false)} 
                style={styles.cancelButton}
                disabled={isUpdatingEntry}
              >
                Cancel
              </Button>
              <Button 
                onPress={handleUpdateEntry}
                isLoading={isUpdatingEntry}
                disabled={isUpdatingEntry}
              >
                Save Changes
              </Button>
            </View>
          </View>
        }
        enhanced={true}
      >
        <TextArea
          placeholder="Edit your entry..."
          value={newEntryContent}
          onChangeText={setNewEntryContent}
          height={200}
        />
      </Dialog>

      {/* Delete Entry Confirmation Modal */}
      <Dialog
        visible={isDeleteEntryModalVisible}
        onClose={() => setIsDeleteEntryModalVisible(false)}
        title="Delete Entry"
        footer={
          <View style={styles.dialogFooter}>
            <Button 
              variant="outline" 
              onPress={() => setIsDeleteEntryModalVisible(false)}
              disabled={isDeletingEntry}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onPress={handleDeleteEntry}
              isLoading={isDeletingEntry}
              disabled={isDeletingEntry}
            >
              Delete Entry
            </Button>
          </View>
        }
        enhanced={true}
      >
        <View style={styles.deleteConfirmation}>
          <View style={styles.alertIconContainer}>
            <AlertIcon />
          </View>
          <Text style={styles.deleteConfirmationText}>
            Are you sure you want to delete this entry? This action cannot be undone.
          </Text>
        </View>
      </Dialog>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  journalList: {
    padding: horizontalPadding,
    paddingBottom: spacing.xl,
  },
  journalGrid: {
    justifyContent: "space-between",
    paddingHorizontal: 0,
  },
  entryModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    marginBottom: spacing.lg,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  entryCount: {
    fontSize: fontSizes.sm,
    color: colors.gray,
    flex: 1,
  },
  entriesList: {
    maxHeight: 400,
  },
  entriesListContent: {
    paddingBottom: spacing.md,
  },
  emptyEntries: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
  },
  emptyEntriesText: {
    fontSize: fontSizes.lg,
    color: colors.gray,
    marginBottom: spacing.md,
  },
  createFirstEntryButton: {
    marginTop: spacing.md,
  },
  colorPickerLabel: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    marginBottom: spacing.md,
    color: colors.darkGray,
  },
  colorPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.lg,
    gap: spacing.sm, // Reduced gap for better spacing
    justifyContent: "flex-start", // Align to start instead of center
  },
  colorOption: {
    width: 45, // Slightly smaller for better fit
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "transparent",
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
    ...shadows.md,
  },
  selectedColorOption: {
    borderColor: colors.white,
    transform: [{ scale: 1.1 }],
    ...shadows.lg,
  },
  checkMark: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: "bold",
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dialogFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rightButtons: {
    flexDirection: "row",
  },
  cancelButton: {
    marginRight: spacing.sm,
  },
  buttonWithIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteButtonText: {
    marginLeft: spacing.xs,
    color: colors.white,
  },
  deleteConfirmation: {
    alignItems: "center",
  },
  alertIconContainer: {
    marginBottom: spacing.lg,
  },
  deleteConfirmationText: {
    textAlign: "center",
    color: colors.darkGray,
    fontSize: fontSizes.md,
    lineHeight: fontSizes.md * 1.4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    textAlign: "center",
  },
})
