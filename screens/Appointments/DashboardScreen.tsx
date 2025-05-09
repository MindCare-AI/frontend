"use client"
import { View, Text, StyleSheet, ScrollView, Image, Platform, FlatList, useWindowDimensions } from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"
import type { AppointmentsStackParamList } from "../../navigation/AppointmentsNavigator"
import AppointmentCard from "../../components/Appointments/AppointmentCard"
import Button from "../../components/Appointments/ui/Button"
import { APPOINTMENTS } from "../../data/mockData"
import { useTheme } from "../../contexts/ThemeContext"
import ThemeToggle from "../../components/Appointments/ui/ThemeToggle"

type NavigationProp = NativeStackNavigationProp<AppointmentsStackParamList>

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>()
  const { width } = useWindowDimensions()
  const { colors, theme } = useTheme()

  // Responsive layout breakpoints
  const isSmallScreen = width < 640
  const isMediumScreen = width >= 640 && width < 1024
  const isLargeScreen = width >= 1024

  // Check if appointment is within 15 minutes
  const isWithin15Minutes = (appointmentTime: string, appointmentDate: string) => {
    const now = new Date()
    const appointmentDateTime = new Date(`${appointmentDate} ${appointmentTime}`)
    const timeDiff = appointmentDateTime.getTime() - now.getTime()
    const minutesDiff = timeDiff / (1000 * 60)
    return minutesDiff <= 15 && minutesDiff > 0
  }

  // Get number of columns based on screen size and platform
  const getNumColumns = () => {
    if (Platform.OS !== "web") return Platform.OS === "ios" ? undefined : 1
    if (isLargeScreen) return 3
    if (isMediumScreen) return 2
    return 1
  }

  return (
    <SafeAreaView edges={["bottom"]} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Header with profile */}
        <View style={[styles.profileContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.welcomeText, { color: colors.primary }]}>Welcome, Alex Morgan</Text>
          <View style={styles.profileActions}>
            <ThemeToggle />
            <Image source={{ uri: "https://i.pravatar.cc/100" }} style={styles.profileImage} />
          </View>
        </View>

        {/* Upcoming Appointments Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Upcoming Appointments</Text>
            <Button
              title="Schedule New Session"
              icon="plus"
              onPress={() => navigation.navigate("BookAppointment")}
              primary
            />
          </View>

          {APPOINTMENTS.length > 0 ? (
            Platform.OS === "web" ? (
              // Web-specific grid layout
              <View
                style={[
                  styles.webAppointmentGrid,
                  isSmallScreen && styles.webAppointmentGridSmall,
                  isMediumScreen && styles.webAppointmentGridMedium,
                  isLargeScreen && styles.webAppointmentGridLarge,
                ]}
              >
                {APPOINTMENTS.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    showJoinButton={isWithin15Minutes(appointment.time, appointment.date)}
                    onPress={() => navigation.navigate("AppointmentDetails", { appointmentId: appointment.id })}
                  />
                ))}
              </View>
            ) : (
              // Mobile-specific FlatList
              <FlatList
                data={APPOINTMENTS}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <AppointmentCard
                    appointment={item}
                    showJoinButton={isWithin15Minutes(item.time, item.date)}
                    onPress={() => navigation.navigate("AppointmentDetails", { appointmentId: item.id })}
                  />
                )}
                horizontal={Platform.OS === "ios"}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.appointmentList}
                scrollEnabled={Platform.OS === "ios"}
                numColumns={getNumColumns()}
              />
            )
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
              <Feather name="calendar" size={48} color={colors.primaryLight} />
              <Text style={[styles.emptyStateText, { color: colors.primary }]}>No upcoming appointments</Text>
              <Text style={[styles.emptyStateSubtext, { color: colors.secondary }]}>Schedule your first session</Text>
            </View>
          )}
        </View>

        {/* View History Button */}
        <View style={styles.historyButtonContainer}>
          <Button
            title="View Appointment History"
            icon="clock"
            onPress={() => navigation.navigate("AppointmentHistory")}
            variant="outline"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  profileContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
      },
    }),
  },
  welcomeText: {
    fontSize: 16,
  },
  profileActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 12,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  appointmentList: {
    gap: 12,
    paddingBottom: 8,
    ...(Platform.OS === "android" && {
      paddingHorizontal: 4,
    }),
  },
  webAppointmentGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
  },
  webAppointmentGridSmall: {
    flexDirection: "column",
  },
  webAppointmentGridMedium: {
    justifyContent: "space-between",
  },
  webAppointmentGridLarge: {
    justifyContent: "flex-start",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    padding: 32,
    marginVertical: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
      },
    }),
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  historyButtonContainer: {
    marginTop: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
})
