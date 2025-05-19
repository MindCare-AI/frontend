"use client"

import type React from "react"
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, ScrollView, Switch } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Feather } from "@expo/vector-icons"
import type { SettingsScreenNavigationProp } from "../../navigation/types"
import { ErrorBoundary } from "../../components/MessagingScreen/ErrorBoundary"
import { NetworkStatusBar } from "../../components/MessagingScreen/NetworkStatusBar"

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>()

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <NetworkStatusBar />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Feather name="user" size={20} color="#3B82F6" style={styles.settingIcon} />
                <Text style={styles.settingText}>Profile</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Feather name="shield" size={20} color="#3B82F6" style={styles.settingIcon} />
                <Text style={styles.settingText}>Privacy</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Feather name="lock" size={20} color="#3B82F6" style={styles.settingIcon} />
                <Text style={styles.settingText}>Security</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate("NotificationSettings")}>
              <View style={styles.settingInfo}>
                <Feather name="bell" size={20} color="#3B82F6" style={styles.settingIcon} />
                <Text style={styles.settingText}>Notification Settings</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#64748B" />
            </TouchableOpacity>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Feather name="moon" size={20} color="#3B82F6" style={styles.settingIcon} />
                <Text style={styles.settingText}>Do Not Disturb</Text>
              </View>
              <Switch value={false} onValueChange={() => {}} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appearance</Text>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Feather name="moon" size={20} color="#3B82F6" style={styles.settingIcon} />
                <Text style={styles.settingText}>Dark Mode</Text>
              </View>
              <Switch value={false} onValueChange={() => {}} />
            </View>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Feather name="type" size={20} color="#3B82F6" style={styles.settingIcon} />
                <Text style={styles.settingText}>Font Size</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data & Storage</Text>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Feather name="database" size={20} color="#3B82F6" style={styles.settingIcon} />
                <Text style={styles.settingText}>Storage Usage</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Feather name="wifi" size={20} color="#3B82F6" style={styles.settingIcon} />
                <Text style={styles.settingText}>Network Usage</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
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
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
  },
  logoutButton: {
    margin: 24,
    padding: 16,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "#EF4444",
    fontWeight: "600",
    fontSize: 16,
  },
})

export default SettingsScreen
