"use client"

import type React from "react"
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, ScrollView, Switch } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Feather } from "@expo/vector-icons"
import type { NotificationSettingsScreenNavigationProp } from "../../navigation/types"
import { ErrorBoundary } from "../../components/MessagingScreen/ErrorBoundary"
import { NetworkStatusBar } from "../../components/MessagingScreen/NetworkStatusBar"

const NotificationSettingsScreen: React.FC = () => {
  const navigation = useNavigation<NotificationSettingsScreenNavigationProp>()

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <NetworkStatusBar />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Notification Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Message Notifications</Text>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingText}>Show Notifications</Text>
              </View>
              <Switch value={true} onValueChange={() => {}} />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingText}>Sound</Text>
              </View>
              <Switch value={true} onValueChange={() => {}} />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingText}>Vibration</Text>
              </View>
              <Switch value={true} onValueChange={() => {}} />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingText}>Show Preview</Text>
              </View>
              <Switch value={true} onValueChange={() => {}} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Group Notifications</Text>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingText}>Show Notifications</Text>
              </View>
              <Switch value={true} onValueChange={() => {}} />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingText}>Sound</Text>
              </View>
              <Switch value={true} onValueChange={() => {}} />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingText}>Vibration</Text>
              </View>
              <Switch value={true} onValueChange={() => {}} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Other Notifications</Text>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingText}>New Contact Requests</Text>
              </View>
              <Switch value={true} onValueChange={() => {}} />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingText}>Group Invites</Text>
              </View>
              <Switch value={true} onValueChange={() => {}} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  section: {
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    fontSize: 16,
  },
})

export default NotificationSettingsScreen
