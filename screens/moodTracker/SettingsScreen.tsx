"use client"

import { useState } from "react"
import { View, StyleSheet, ScrollView, Alert, Platform } from "react-native"
import { useTheme, Text, List, Divider, Button, Switch, RadioButton } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import { MaterialCommunityIcons } from "@expo/vector-icons"

export default function SettingsScreen() {
  const theme = useTheme()

  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [reminderTime, setReminderTime] = useState("evening")
  const [dataExportFormat, setDataExportFormat] = useState("csv")

  const handleClearData = () => {
    Alert.alert("Clear All Data", "Are you sure you want to clear all your mood data? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear Data",
        style: "destructive",
        onPress: () => {
          // In a real app, this would call an API to clear user data
          Alert.alert("Success", "All mood data has been cleared")
        },
      },
    ])
  }

  const handleExportData = () => {
    Alert.alert("Export Data", `Your data will be exported in ${dataExportFormat.toUpperCase()} format.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Export",
        onPress: () => {
          // In a real app, this would call an API to export user data
          Alert.alert("Success", `Data exported in ${dataExportFormat.toUpperCase()} format`)
        },
      },
    ])
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Settings
          </Text>
        </View>

        <List.Section>
          <List.Subheader>Appearance</List.Subheader>
          <List.Item
            title="Dark Mode"
            description="Enable dark theme"
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={(props) => <Switch value={darkMode} onValueChange={setDarkMode} />}
          />
          <Divider />
          <List.Item
            title="Text Size"
            description="Adjust the text size"
            left={(props) => <List.Icon {...props} icon="format-size" />}
            right={(props) => <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />}
            onPress={() => Alert.alert("Text Size", "This would open text size settings")}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>Notifications</List.Subheader>
          <List.Item
            title="Enable Notifications"
            description="Get reminders to log your mood"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={(props) => <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />}
          />

          {notificationsEnabled && (
            <>
              <Divider />
              <List.Item
                title="Reminder Time"
                description="When to remind you to log your mood"
                left={(props) => <List.Icon {...props} icon="clock-time-four" />}
              />
              <RadioButton.Group onValueChange={(value) => setReminderTime(value)} value={reminderTime}>
                <View style={styles.radioOption}>
                  <RadioButton.Item label="Morning (9:00 AM)" value="morning" position="leading" />
                </View>
                <View style={styles.radioOption}>
                  <RadioButton.Item label="Afternoon (2:00 PM)" value="afternoon" position="leading" />
                </View>
                <View style={styles.radioOption}>
                  <RadioButton.Item label="Evening (8:00 PM)" value="evening" position="leading" />
                </View>
              </RadioButton.Group>
            </>
          )}
        </List.Section>

        <List.Section>
          <List.Subheader>Data Management</List.Subheader>
          <List.Item
            title="Export Format"
            description="Choose the format for data export"
            left={(props) => <List.Icon {...props} icon="file-export" />}
          />
          <RadioButton.Group onValueChange={(value) => setDataExportFormat(value)} value={dataExportFormat}>
            <View style={styles.radioOption}>
              <RadioButton.Item label="CSV" value="csv" position="leading" />
            </View>
            <View style={styles.radioOption}>
              <RadioButton.Item label="JSON" value="json" position="leading" />
            </View>
            <View style={styles.radioOption}>
              <RadioButton.Item label="PDF" value="pdf" position="leading" />
            </View>
          </RadioButton.Group>

          <Divider />
          <List.Item
            title="Export All Data"
            description="Download all your mood data"
            left={(props) => <List.Icon {...props} icon="download" />}
            onPress={handleExportData}
          />

          <Divider />
          <List.Item
            title="Clear All Data"
            description="Delete all your mood entries"
            left={(props) => <List.Icon {...props} icon="delete" color="red" />}
            onPress={handleClearData}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>About</List.Subheader>
          <List.Item
            title="Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
          <Divider />
          <List.Item
            title="Privacy Policy"
            left={(props) => <List.Icon {...props} icon="shield-account" />}
            onPress={() => Alert.alert("Privacy Policy", "This would open the privacy policy")}
          />
          <Divider />
          <List.Item
            title="Terms of Service"
            left={(props) => <List.Icon {...props} icon="file-document" />}
            onPress={() => Alert.alert("Terms of Service", "This would open the terms of service")}
          />
        </List.Section>

        <View style={styles.logoutContainer}>
          <Button
            mode="outlined"
            icon="logout"
            onPress={() => Alert.alert("Logout", "This would log you out")}
            style={styles.logoutButton}
            labelStyle={styles.logoutButtonContent}
          >
            Logout
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  header: {
    padding: 16,
  },
  title: {
    fontWeight: "bold",
  },
  radioOption: {
    paddingLeft: Platform.OS === "ios" ? 0 : 16,
  },
  logoutContainer: {
    padding: 16,
    marginBottom: 16,
  },
  logoutButton: {
    borderColor: "red",
  },
  logoutButtonContent: {
    color: "red",
  },
})
