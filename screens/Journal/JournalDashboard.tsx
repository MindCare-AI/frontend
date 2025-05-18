"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Dimensions, Platform } from "react-native"
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
import { colors, spacing, fontSizes } from "../../components/Journal/theme"

// Simple icons for React Native
const PlusIcon = () => <Text style={{ fontSize: 24, color: colors.white }}>+</Text>

const SettingsIcon = () => <Text style={{ fontSize: 24, color: colors.gray }}>⚙️</Text>

const TrashIcon = () => <Text style={{ fontSize: 20, color: colors.white }}>🗑️</Text>

const AlertIcon = () => <Text style={{ fontSize: 20, color: colors.danger }}>⚠️</Text>

const { width } = Dimensions.get("window")
const numColumns = Platform.OS === "web" && width > 768 ? 3 : 2
const cardWidth = (width - spacing.md * 2 - spacing.md * (numColumns - 1)) / numColumns

export default function JournalDashboard() {
  const { journals, entries, addJournal, updateJournal, deleteJournal, addEntry, updateEntry, deleteEntry, fetchEntries, fetchCategories } =
    useJournal()

  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null)
  const [editingJournal, setEditingJournal] = useState<Journal | null>(null)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [newJournalTitle, setNewJournalTitle] = useState("")
  const [newJournalColor, setNewJournalColor] = useState(colors.primary)
  const [newEntryContent, setNewEntryContent] = useState("")

  useEffect(() => {
    fetchCategories()
    fetchEntries()
  }, [])

  const [isEntryModalVisible, setIsEntryModalVisible] = useState(false)
  const [isNewJournalModalVisible, setIsNewJournalModalVisible] = useState(false)
  const [isEditJournalModalVisible, setIsEditJournalModalVisible] = useState(false)
  const [isDeleteJournalModalVisible, setIsDeleteJournalModalVisible] = useState(false)
  const [isEditEntryModalVisible, setIsEditEntryModalVisible] = useState(false)
  const [isDeleteEntryModalVisible, setIsDeleteEntryModalVisible] = useState(false)
  const [isAddingEntry, setIsAddingEntry] = useState(false)

  const colorOptions = [
    "#4287f5", // blue
    "#43d9b8", // teal
    "#f54242", // red
    "#f5a742", // orange
    "#9c42f5", // purple
    "#f542a7", // pink
    "#42f569", // green
    "#424242", // dark gray
  ]

  const handleJournalPress = (journal: Journal) => {
    console.log("Journal pressed:", journal.title) // Add this for debugging
    setSelectedJournal(journal)
    setIsAddingEntry(false) // Default to viewing entries
    setIsEntryModalVisible(true)
  }

  const handleJournalLongPress = (journal: Journal) => {
    console.log("Journal long pressed:", journal.title) // Add this for debugging
    setEditingJournal(journal)
    setNewJournalTitle(journal.title || '')
    setNewJournalColor(journal.color || colors.primary)
    setIsEditJournalModalVisible(true)
  }

  const handleEntryLongPress = (entry: JournalEntry) => {
    console.log("Entry long pressed:", entry.id) // Add this for debugging
    setEditingEntry(entry)
    setNewEntryContent(entry.content)
    setIsEditEntryModalVisible(true)
  }

  const handleNewJournalPress = () => {
    setNewJournalTitle("")
    setNewJournalColor(colors.primary)
    setIsNewJournalModalVisible(true)
  }

  const handleAddJournal = () => {
    if (newJournalTitle.trim()) {
      addJournal({
        name: newJournalTitle,
        color: newJournalColor,
        icon: null,
      })
      setIsNewJournalModalVisible(false)
    } else {
      Alert.alert("Error", "Journal title cannot be empty")
    }
  }

  const handleEditJournal = () => {
    if (editingJournal && newJournalTitle.trim()) {
      updateJournal(editingJournal.id, {
        name: newJournalTitle,
        color: newJournalColor || undefined
      })
      setIsEditJournalModalVisible(false)
      setEditingJournal(null)
    }
  }

  const handleDeleteJournal = () => {
    if (editingJournal) {
      deleteJournal(editingJournal.id)
      setIsDeleteJournalModalVisible(false)
      setEditingJournal(null)
      setSelectedJournal(null)
      setIsEntryModalVisible(false)
    }
  }

  const handleAddEntry = () => {
    if (selectedJournal && newEntryContent.trim()) {
      addEntry({
        content: newEntryContent,
        category: selectedJournal.id,
        is_private: true,
        shared_with_therapist: false,
        title: ''
      })
      setNewEntryContent("")
      setIsAddingEntry(false)
    }
  }

  const handleUpdateEntry = () => {
    if (editingEntry) {
      updateEntry(editingEntry.id, { content: newEntryContent })
      setIsEditEntryModalVisible(false)
      setEditingEntry(null)
      setNewEntryContent("")
    }
  }

  const handleDeleteEntry = () => {
    if (editingEntry) {
      deleteEntry(editingEntry.id)
      setIsDeleteEntryModalVisible(false)
      setEditingEntry(null)
    }
  }

  const entriesForSelectedJournal = Array.isArray(entries) ? 
    entries.filter((entry) => selectedJournal && entry.category === selectedJournal.id) 
    : []

  const renderJournalItem = ({ item }: { item: Journal }) => (
    <JournalItem
      journal={item}
      onJournalPress={handleJournalPress}
      onJournalLongPress={handleJournalLongPress}
      width={cardWidth}
    />
  )

  const renderEntryItem = ({ item }: { item: JournalEntry }) => (
    <EntryItem entry={item} onEntryLongPress={handleEntryLongPress} />
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Journals</Text>
        <IconButton icon={<SettingsIcon />} onPress={() => {}} />
      </View>

      <FlatList
        data={journals}
        renderItem={renderJournalItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns}
        columnWrapperStyle={styles.journalGrid}
        contentContainerStyle={styles.journalList}
        ListFooterComponent={() => <NewJournalCard onPress={handleNewJournalPress} width={cardWidth} />}
      />

      <View style={styles.fab}>
        <Button onPress={handleNewJournalPress} style={styles.fabButton}>
          <PlusIcon />
        </Button>
      </View>

      {/* Journal Entry Modal */}
      <Dialog
        visible={isEntryModalVisible}
        onClose={() => setIsEntryModalVisible(false)}
        title={selectedJournal?.title}
        footer={
          isAddingEntry ? (
            <View style={styles.dialogFooter}>
              <Button variant="outline" onPress={() => setIsAddingEntry(false)}>
                Cancel
              </Button>
              <Button onPress={handleAddEntry}>Save Entry</Button>
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

      {/* New Journal Modal */}
      <Dialog
        visible={isNewJournalModalVisible}
        onClose={() => setIsNewJournalModalVisible(false)}
        title="Create New Journal"
        footer={
          <View style={styles.dialogFooter}>
            <Button variant="outline" onPress={() => setIsNewJournalModalVisible(false)}>
              Cancel
            </Button>
            <Button onPress={handleAddJournal}>Create Journal</Button>
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
          <View style={styles.colorPicker}>
            {colorOptions.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  newJournalColor === color && styles.selectedColorOption,
                ]}
                onPress={() => setNewJournalColor(color)}
              />
            ))}
          </View>
        </View>
      </Dialog>

      {/* Edit Journal Modal */}
      <Dialog
        visible={isEditJournalModalVisible}
        onClose={() => setIsEditJournalModalVisible(false)}
        title="Edit Journal"
        footer={
          <View style={styles.dialogFooter}>
            <Button variant="destructive" onPress={() => setIsDeleteJournalModalVisible(true)}>
              <View style={styles.buttonWithIcon}>
                <TrashIcon />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </View>
            </Button>
            <View style={styles.rightButtons}>
              <Button variant="outline" onPress={() => setIsEditJournalModalVisible(false)} style={styles.cancelButton}>
                Cancel
              </Button>
              <Button onPress={handleEditJournal}>Save Changes</Button>
            </View>
          </View>
        }
      >
        <View>
          <Input label="Journal Name" value={newJournalTitle} onChangeText={setNewJournalTitle} />

          <Text style={styles.colorPickerLabel}>Choose Color</Text>
          <View style={styles.colorPicker}>
            {colorOptions.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  newJournalColor === color && styles.selectedColorOption,
                ]}
                onPress={() => setNewJournalColor(color)}
              />
            ))}
          </View>
        </View>
      </Dialog>

      {/* Delete Journal Confirmation Modal */}
      <Dialog
        visible={isDeleteJournalModalVisible}
        onClose={() => setIsDeleteJournalModalVisible(false)}
        title="Delete Journal"
        footer={
          <View style={styles.dialogFooter}>
            <Button variant="outline" onPress={() => setIsDeleteJournalModalVisible(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onPress={handleDeleteJournal}>
              Delete Journal
            </Button>
          </View>
        }
      >
        <View style={styles.deleteConfirmation}>
          <View style={styles.alertIconContainer}>
            <AlertIcon />
          </View>
          <Text style={styles.deleteConfirmationText}>
            Are you sure you want to delete "{editingJournal?.title}"? This will permanently remove the journal and all
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
            <Button variant="destructive" onPress={() => setIsDeleteEntryModalVisible(true)}>
              <View style={styles.buttonWithIcon}>
                <TrashIcon />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </View>
            </Button>
            <View style={styles.rightButtons}>
              <Button variant="outline" onPress={() => setIsEditEntryModalVisible(false)} style={styles.cancelButton}>
                Cancel
              </Button>
              <Button onPress={handleUpdateEntry}>Save Changes</Button>
            </View>
          </View>
        }
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
            <Button variant="outline" onPress={() => setIsDeleteEntryModalVisible(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onPress={handleDeleteEntry}>
              Delete Entry
            </Button>
          </View>
        }
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
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: "bold",
    color: colors.white,
  },
  journalList: {
    padding: spacing.md,
    paddingBottom: 100, // Extra space for FAB
  },
  journalGrid: {
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  fab: {
    position: "absolute",
    bottom: spacing.xl,
    alignSelf: "center",
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
  },
  entryModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    marginBottom: spacing.md,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
    paddingVertical: spacing.xl,
  },
  emptyEntriesText: {
    fontSize: fontSizes.md,
    color: colors.gray,
    marginBottom: spacing.md,
  },
  createFirstEntryButton: {
    marginTop: spacing.sm,
  },
  colorPickerLabel: {
    fontSize: fontSizes.sm,
    fontWeight: "500",
    marginBottom: spacing.xs,
    color: colors.darkGray,
  },
  colorPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.md,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    margin: spacing.xs,
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: colors.white,
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
    marginBottom: spacing.md,
  },
  deleteConfirmationText: {
    textAlign: "center",
    color: colors.darkGray,
  },
})
