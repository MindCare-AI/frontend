"use client"

import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, useWindowDimensions, ScrollView, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { format } from "date-fns"
import { createAppointment, getAllTherapistProfiles, getTherapistDropdownOptions } from "../../../API/Appointment/patient"
import { Modal, Button, Select, Alert } from "./ui"
import DayBasedSelector, { AvailabilityDay } from "./ui/DayBasedSelector"
import { useAppointments } from "../../../contexts/appoint_patient/AppointmentContext"

type BookAppointmentModalProps = {
  isOpen: boolean
  onClose: () => void
  onJoinWaitingList: () => void
}

const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({ isOpen, onClose, onJoinWaitingList }) => {
  const [selectedDay, setSelectedDay] = useState<AvailabilityDay | null>(null)
  const [therapist, setTherapist] = useState("")
  const [timeSlot, setTimeSlot] = useState("")
  const [noSlotsAvailable, setNoSlotsAvailable] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [therapists, setTherapists] = useState<Array<{ label: string, value: string }>>([])
  const [timeSlots, setTimeSlots] = useState<Array<{ label: string, value: string, time: string }>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [therapistProfiles, setTherapistProfiles] = useState<any[]>([]);
  const [isLoadingTherapists, setIsLoadingTherapists] = useState(false);
  const [availableDays, setAvailableDays] = useState<AvailabilityDay[]>([]);
  const { width } = useWindowDimensions()
  const { refreshAppointments } = useAppointments() 

  // Fetch therapists when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchTherapists();
    } else {
      // Reset form when modal closes
      setSelectedDay(null);
      setTherapist("");
      setTimeSlot("");
      setNoSlotsAvailable(false);
      setError(null);
      setTherapists([]);
      setTherapistProfiles([]);
      setTimeSlots([]);
      setAvailableDays([]);
    }
  }, [isOpen]);

  const fetchTherapists = async () => {
    setIsLoadingTherapists(true);
    setError(null);
    try {
      console.log("📱 [BookAppointmentModal] Fetching therapists...");
      
      // Try dropdown API first (designed for form dropdowns)
      let response;
      let useDropdownAPI = true;
      
      try {
        response = await getTherapistDropdownOptions();
        console.log("📱 [BookAppointmentModal] Dropdown API response:", response);
        
        // Handle the response format from dropdown API
        if (response && response.results && Array.isArray(response.results)) {
          response = response.results;
        } else if (!Array.isArray(response)) {
          console.log("📱 [BookAppointmentModal] Dropdown API returned unexpected format, trying full profiles");
          throw new Error("Unexpected response format");
        }
      } catch (dropdownError) {
        console.log("📱 [BookAppointmentModal] Dropdown API failed, trying full profiles:", dropdownError);
        useDropdownAPI = false;
        response = await getAllTherapistProfiles();
        console.log("📱 [BookAppointmentModal] Full profiles API response:", response);
      }
      
      // Handle different response formats
      let therapistArray: any[];
      if (Array.isArray(response)) {
        therapistArray = response;
      } else if (response && (response as any).results && Array.isArray((response as any).results)) {
        therapistArray = (response as any).results;
      } else if (response && Array.isArray((response as any).data)) {
        therapistArray = (response as any).data;
      } else {
        console.warn("📱 [BookAppointmentModal] Unexpected response format:", response);
        therapistArray = [];
      }
      
      console.log(`📱 [BookAppointmentModal] Found ${therapistArray.length} therapists`);
      setTherapistProfiles(therapistArray);
      
      if (therapistArray.length === 0) {
        setTherapists([]);
        setError("No therapists are currently available for booking.");
        return;
      }
      
      const mappedTherapists = therapistArray.map((therapist: any) => {
        console.log("📱 [BookAppointmentModal] Mapping therapist:", therapist);
        
        let displayName = '';
        
        // If using dropdown API, it might have a 'name' or 'label' field
        if (useDropdownAPI && (therapist.name || therapist.label)) {
          displayName = therapist.name || therapist.label;
        } else {
          // Handle different possible field names and structures
          let firstName = therapist.first_name || therapist.firstName || '';
          let lastName = therapist.last_name || therapist.lastName || '';
          
          // Trim any whitespace and handle empty strings
          firstName = (firstName || '').trim();
          lastName = (lastName || '').trim();
          
          // Create display name with fallbacks
          if (firstName && lastName) {
            displayName = `${firstName} ${lastName}`;
          } else if (firstName) {
            displayName = firstName;
          } else if (lastName) {
            displayName = lastName;
          } else if (therapist.username) {
            displayName = therapist.username;
          } else if (therapist.email) {
            displayName = therapist.email.split('@')[0]; // Use email prefix
          } else {
            displayName = `Therapist ${therapist.id}`;
          }
        }
        
        // Ensure displayName is never empty or just a period
        if (!displayName || displayName.trim() === '' || displayName.trim() === '.') {
          displayName = `Therapist ${therapist.id || 'Unknown'}`;
        }
        
        // Clean up any stray periods at the beginning or end
        displayName = displayName.trim().replace(/^\.+|\.+$/g, '');
        if (!displayName) {
          displayName = `Therapist ${therapist.id || 'Unknown'}`;
        }
        
        console.log(`📱 [BookAppointmentModal] Therapist ${therapist.id}: final name = "${displayName}"`);
        
        // Ensure we have a valid value (never just a period or empty/whitespace)
        let value = therapist.id?.toString() || therapist.value?.toString() || "";
        value = value.trim();
        if (!value || value === ".") {
          value = `therapist-${Math.random().toString(36).substr(2, 9)}`;
        }
        
        return {
          label: displayName,
          value: value,
        };
      });
      
      console.log("📱 [BookAppointmentModal] Mapped therapists:", mappedTherapists);
      setTherapists(mappedTherapists);
      setError(null);
    } catch (error) {
      console.error("📱 [BookAppointmentModal] Error fetching therapists:", error);
      setTherapists([]);
      setTherapistProfiles([]);
      setError("Failed to load therapists. Please check your connection and try again.");
    } finally {
      setIsLoadingTherapists(false);
    }
  };

  // Process therapist availability into available days
  const processTherapistAvailability = (therapistId: string) => {
    const selectedTherapist = therapistProfiles.find((t) => t.id?.toString() === therapistId);
    
    if (!selectedTherapist || !selectedTherapist.availability) {
      setAvailableDays([]);
      setNoSlotsAvailable(true);
      return;
    }

    console.log("📅 [BookAppointmentModal] Processing availability for therapist:", selectedTherapist.full_name);
    console.log("📅 [BookAppointmentModal] Availability data:", selectedTherapist.availability);

    const days: AvailabilityDay[] = [];
    const today = new Date();
    
    // Get next 14 days to check availability
    for (let i = 0; i < 14; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      
      const dayName = checkDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
      const daySlots = selectedTherapist.availability[dayName] || [];
      
      if (daySlots.length > 0) {
        const dayShort = checkDate.toLocaleDateString("en-US", { weekday: "short" }).trim();
        const dayDate = checkDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }).trim();
        
        // Ensure we have valid day information (never just periods or empty)
        if (dayShort && dayDate && dayShort !== '.' && dayDate !== '.') {
          days.push({
            day: dayName,
            dayName: dayShort,
            date: dayDate,
            slots: daySlots
          });
        }
      }
    }
    
    console.log("📅 [BookAppointmentModal] Generated available days:", days);
    setAvailableDays(days);
    setNoSlotsAvailable(days.length === 0);
    
    // Reset selections
    setSelectedDay(null);
    setTimeSlot("");
    setTimeSlots([]);
  };

  const handleDaySelect = (day: AvailabilityDay) => {
    console.log("📅 [BookAppointmentModal] Day selected:", day);
    
    // Check if this day is already selected to prevent duplicate selection
    if (selectedDay && selectedDay.day === day.day && selectedDay.date === day.date) {
      console.log("📅 [BookAppointmentModal] Day already selected, ignoring duplicate selection");
      return;
    }
    
    setSelectedDay(day);
    setTimeSlot("");
    
    if (!therapist) {
      setTimeSlots([]);
      return;
    }

    setIsLoading(true);
    setTimeSlots([]);

    try {
      // Generate time slots from the selected day's availability
      const formattedSlots: Array<{ label: string, value: string, time: string }> = [];
      
      day.slots.forEach((slot: any, idx: number) => {
        const [startHour, startMinute] = slot.start.split(":").map(Number);
        const [endHour, endMinute] = slot.end.split(":").map(Number);
        
        // Create a date for the selected day
        const baseDate = new Date();
        baseDate.setDate(baseDate.getDate() + Math.floor(Math.random() * 14)); // This should be calculated properly based on the day
        
        let current = new Date(baseDate);
        current.setHours(startHour, startMinute, 0, 0);
        const end = new Date(baseDate);
        end.setHours(endHour, endMinute, 0, 0);
        
        while (current < end) {
          const label = current.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
          
          // Ensure we have valid label and time values (never just periods or empty)
          if (label && label.trim() && label.trim() !== '.') {
            formattedSlots.push({
              label: label.trim(),
              value: `${idx}-${label.trim()}`,
              time: `${current.getHours().toString().padStart(2, '0')}:${current.getMinutes().toString().padStart(2, '0')}`
            });
          }
          current = new Date(current.getTime() + 30 * 60000); // 30 min interval
        }
      });
      
      console.log("📅 [BookAppointmentModal] Generated time slots:", formattedSlots);
      setTimeSlots(formattedSlots);
      setNoSlotsAvailable(formattedSlots.length === 0);
    } catch (error) {
      console.error("📅 [BookAppointmentModal] Error generating time slots:", error);
      setError('Failed to fetch available time slots');
      setNoSlotsAvailable(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!therapist || !selectedDay || !timeSlot) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const selectedSlot = timeSlots.find((slot) => slot.value === timeSlot);
      if (!selectedSlot) throw new Error('Invalid time slot selected');

      // Calculate the actual date for the selected day
      const today = new Date();
      let appointmentDate = new Date(today);
      
      // Find the next occurrence of the selected day
      const selectedDayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(selectedDay.day);
      const todayIndex = today.getDay();
      
      let daysToAdd = selectedDayIndex - todayIndex;
      if (daysToAdd <= 0) {
        daysToAdd += 7; // Next week
      }
      
      appointmentDate.setDate(today.getDate() + daysToAdd);
      
      // Format appointment_date as "YYYY-MM-DD HH:MM"
      const formattedDate = format(appointmentDate, 'yyyy-MM-dd');
      const appointmentDateTime = `${formattedDate} ${selectedSlot.time}`; // "YYYY-MM-DD HH:MM"

      console.log("📅 [BookAppointmentModal] Booking appointment:", {
        therapist: parseInt(therapist),
        appointment_date: appointmentDateTime,
        duration: "60"
      });

      await createAppointment({
        therapist: parseInt(therapist),
        appointment_date: appointmentDateTime,
        duration: "60",
      });

      // Show success message
      console.log("✅ [BookAppointmentModal] Appointment booked successfully!");
      
      // Refresh appointments list to show new appointment immediately
      console.log("📅 [BookAppointmentModal] Refreshing appointments to show new booking");
      
      try {
        // Small delay to ensure appointment is registered in the backend before refreshing
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await refreshAppointments();
        console.log("📅 [BookAppointmentModal] Appointments refreshed successfully");
      } catch (refreshError) {
        console.error("❌ [BookAppointmentModal] Error refreshing appointments:", refreshError);
      }

      // Make sure we close the modal after the refresh is complete
      onClose();
      // Reset form
      setSelectedDay(null);
      setTherapist("");
      setTimeSlot("");
      setNoSlotsAvailable(false);
      setAvailableDays([]);
    } catch (error) {
      console.error("❌ [BookAppointmentModal] Error booking appointment:", error);
      setError('Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <View style={styles.footerContainer}>
      {error && error.trim() && (
        <Text style={styles.errorText}>{error.trim()}</Text>
      )}
      {selectedDay && noSlotsAvailable ? (
        <Button 
          onPress={onJoinWaitingList} 
          colorScheme="primary"
        >
          <Text style={{ color: "#FFFFFF" }}>Join Waiting List</Text>
        </Button>
      ) : (
        <Button
          onPress={handleSubmit}
          isDisabled={!therapist || !selectedDay || (!noSlotsAvailable && !timeSlot) || isSubmitting}
          colorScheme="primary"
        >
          {isSubmitting ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={{ color: "#FFFFFF" }}>Booking...</Text>
            </View>
          ) : (
            <Text style={{ color: "#FFFFFF" }}>Book Appointment</Text>
          )}
        </Button>
      )}
    </View>
  )

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Book New Appointment" 
      footer={footer}
    >
      <ScrollView style={{ width: '100%' }} contentContainerStyle={[styles.container, { maxWidth: width > 600 ? 500 : '100%' }]}> 
        <Text style={styles.description}>
          Select a therapist, date, and time slot to book your appointment.
        </Text>

        <View style={styles.formContainer}>
          {isLoadingTherapists ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4F46E5" />
              <Text style={{ marginLeft: 8, color: '#6B7280' }}>Loading therapists...</Text>
            </View>
          ) : (
            // Adding a React.Fragment with key to ensure proper rendering
            <React.Fragment key="therapist-select">
              <Select
                label="Therapist"
                options={therapists}
                value={therapist}
                onValueChange={(value) => {
                  setTherapist(value);
                  processTherapistAvailability(value);
                }}
                placeholder={therapists.length === 0 ? "No therapists available" : "Select a therapist"}
                style={styles.select}
                isDisabled={therapists.length === 0}
              />
            </React.Fragment>
          )}

          {therapist && (
            <React.Fragment key="day-selector">
              <DayBasedSelector
                label="Available Days"
                availableDays={availableDays.filter(day => day && typeof day === 'object')}
                selectedDay={selectedDay}
                onDaySelect={handleDaySelect}
                style={styles.daySelector}
              />
            </React.Fragment>
          )}

          {isLoading && (
            <React.Fragment key="loading-availability">
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4F46E5" />
                <Text style={{ marginLeft: 8, color: '#6B7280' }}>Checking availability...</Text>
              </View>
            </React.Fragment>
          )}

          {selectedDay && !noSlotsAvailable && !isLoading && timeSlots.length > 0 && (
            <React.Fragment key="time-slot-selector">
              <Select
                label="Time Slot"
                options={timeSlots}
                value={timeSlot}
                onValueChange={setTimeSlot}
                placeholder="Select a time slot"
                style={styles.select}
              />
            </React.Fragment>
          )}

          {selectedDay && therapist && !isLoading && timeSlots.length === 0 && !noSlotsAvailable && (
            <React.Fragment key="no-slots-generated-alert">
              <Alert
                status="warning"
                title="No Time Slots Generated"
                icon={<Ionicons name="time-outline" size={20} color="#F59E0B" />}
              >
                <Text>Unable to generate time slots for this therapist and day. Please select a different day or therapist.</Text>
              </Alert>
            </React.Fragment>
          )}

          {selectedDay && noSlotsAvailable && !isLoading && (
            <React.Fragment key="no-slots-alert">
              <Alert
                status="info"
                title="No Available Slots"
                icon={<Ionicons name="time-outline" size={20} color="#3182CE" />}
              >
                <Text>No available slots for the selected day. Would you like to join the waiting list?</Text>
              </Alert>
            </React.Fragment>
          )}
        </View>
      </ScrollView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    width: '100%',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4A5568',
    marginBottom: 24,
  },
  formContainer: {
    gap: 20,
  },
  select: {
    width: '100%',
  },
  daySelector: {
    width: '100%',
  },
  datePicker: {
    width: '100%',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
  },
  errorText: {
    color: "#E53E3E",
    marginBottom: 12,
    textAlign: "center",
    fontSize: 14,
  },
})

export default BookAppointmentModal
