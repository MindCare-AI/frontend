import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '../../../contexts/appoint_therapist/AppContext';
import SectionHeader from '../../../components/Appointments/therapist_dashboard/SectionHeader';
import AppointmentCard from '../../../components/Appointments/therapist_dashboard/AppointmentCard';
import UpcomingAppointmentCard from '../../../components/Appointments/therapist_dashboard/UpcomingAppointmentCard';
import WaitingListCard from '../../../components/Appointments/therapist_dashboard/WaitingListCard';
import SessionNoteCard from '../../../components/Appointments/therapist_dashboard/SessionNoteCard';
import EmptyState from '../../../components/Appointments/therapist_dashboard/EmptyState';
import RescheduleModal from '../../../components/Appointments/therapist_dashboard/RescheduleModal';
import EditNoteModal from '../../../components/Appointments/therapist_dashboard/EditNoteModal';
import AvailabilityModal from '../../../components/Appointments/therapist_dashboard/AvailabilityModal';
import { Appointment, SessionNote } from '../../../types/appoint_therapist/index';

const DashboardScreenT: React.FC = () => {
  const {
    todayAppointments,
    upcomingAppointments,
    waitingList,
    sessionNotes,
    timeSlots,
    confirmAppointment,
    completeAppointment,
    rescheduleAppointment,
    toggleAppointmentExpand,
    notifyPatient,
    removeFromWaitingList,
    updateSessionNote,
    addTimeSlot,
    removeTimeSlot,
  } = useAppContext();

  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editNoteModalVisible, setEditNoteModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<SessionNote | null>(null);
  const [availabilityModalVisible, setAvailabilityModalVisible] = useState(false);

  const dimensions = useWindowDimensions();
  const isLargeScreen = dimensions.width >= 768;

  const handleReschedulePress = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleModalVisible(true);
  };

  const handleEditNotePress = (note: SessionNote) => {
    setSelectedNote(note);
    setEditNoteModalVisible(true);
  };

  // Render the dashboard content
  const renderDashboardContent = () => {
    if (isLargeScreen) {
      // Two-column layout for larger screens
      return (
        <View style={styles.twoColumnContainer}>
          <View style={styles.column}>
            <View style={styles.section}>
              <SectionHeader title="Today's Appointments" icon="calendar-today" />
              <View style={styles.sectionContent}>
                {todayAppointments.length > 0 ? (
                  todayAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onConfirm={confirmAppointment}
                      onComplete={completeAppointment}
                      onReschedule={handleReschedulePress}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon="calendar"
                    message="No appointments scheduled for today."
                  />
                )}
              </View>
            </View>

            <View style={styles.section}>
              <SectionHeader title="Session Notes" icon="file-document" />
              <View style={styles.sectionContent}>
                {sessionNotes.length > 0 ? (
                  sessionNotes.map((note) => (
                    <SessionNoteCard
                      key={note.id}
                      note={note}
                      onEdit={handleEditNotePress}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon="file-document"
                    message="No session notes available."
                  />
                )}
              </View>
            </View>
          </View>

          <View style={styles.column}>
            <View style={styles.section}>
              <SectionHeader title="Upcoming Appointments" icon="calendar-month" />
              <View style={styles.sectionContent}>
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => (
                    <UpcomingAppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onToggleExpand={toggleAppointmentExpand}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon="calendar"
                    message="No upcoming appointments."
                  />
                )}
              </View>
            </View>

            <View style={styles.section}>
              <SectionHeader title="Waiting List" icon="clock" />
              <View style={styles.sectionContent}>
                {waitingList.length > 0 ? (
                  waitingList.map((entry) => (
                    <WaitingListCard
                      key={entry.id}
                      entry={entry}
                      onNotify={notifyPatient}
                      onRemove={removeFromWaitingList}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon="clock"
                    message="No patients on the waiting list."
                  />
                )}
              </View>
            </View>
          </View>
        </View>
      );
    } else {
      // Single-column layout for smaller screens
      return (
        <View style={styles.singleColumnContainer}>
          <View style={styles.section}>
            <SectionHeader title="Today's Appointments" icon="calendar-today" />
            <View style={styles.sectionContent}>
              {todayAppointments.length > 0 ? (
                todayAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onConfirm={confirmAppointment}
                    onComplete={completeAppointment}
                    onReschedule={handleReschedulePress}
                  />
                ))
              ) : (
                <EmptyState
                  icon="calendar"
                  message="No appointments scheduled for today."
                />
              )}
            </View>
          </View>

          <View style={styles.section}>
            <SectionHeader title="Upcoming Appointments" icon="calendar-month" />
            <View style={styles.sectionContent}>
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                  <UpcomingAppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onToggleExpand={toggleAppointmentExpand}
                  />
                ))
              ) : (
                <EmptyState
                  icon="calendar"
                  message="No upcoming appointments."
                />
              )}
            </View>
          </View>

          <View style={styles.section}>
            <SectionHeader title="Waiting List" icon="clock" />
            <View style={styles.sectionContent}>
              {waitingList.length > 0 ? (
                waitingList.map((entry) => (
                  <WaitingListCard
                    key={entry.id}
                    entry={entry}
                    onNotify={notifyPatient}
                    onRemove={removeFromWaitingList}
                  />
                ))
              ) : (
                <EmptyState
                  icon="clock"
                  message="No patients on the waiting list."
                />
              )}
            </View>
          </View>

          <View style={styles.section}>
            <SectionHeader title="Session Notes" icon="file-document" />
            <View style={styles.sectionContent}>
              {sessionNotes.length > 0 ? (
                sessionNotes.map((note) => (
                  <SessionNoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleEditNotePress}
                  />
                ))
              ) : (
                <EmptyState
                  icon="file-document"
                  message="No session notes available."
                />
              )}
            </View>
          </View>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>My Schedule</Text>
        </View>

        {renderDashboardContent()}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="clock"
        color="white"
        onPress={() => setAvailabilityModalVisible(true)}
      />

      <RescheduleModal
        visible={rescheduleModalVisible}
        appointment={selectedAppointment}
        onDismiss={() => setRescheduleModalVisible(false)}
        onReschedule={rescheduleAppointment}
      />

      <EditNoteModal
        visible={editNoteModalVisible}
        note={selectedNote}
        onDismiss={() => setEditNoteModalVisible(false)}
        onSave={updateSessionNote}
      />

      <AvailabilityModal
        visible={availabilityModalVisible}
        timeSlots={timeSlots}
        onDismiss={() => setAvailabilityModalVisible(false)}
        onAddTimeSlot={addTimeSlot}
        onRemoveTimeSlot={removeTimeSlot}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
  },
  twoColumnContainer: {
    flexDirection: 'row',
    padding: 8,
  },
  singleColumnContainer: {
    padding: 8,
  },
  column: {
    flex: 1,
    padding: 8,
  },
  section: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  sectionContent: {
    padding: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#003366',
  },
});

export default DashboardScreenT;