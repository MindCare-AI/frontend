// Mock data for the application

// Therapists
export const THERAPISTS = [
    {
      id: "dr-johnson",
      name: "Dr. Sarah Johnson",
      specialty: "Cognitive Behavioral Therapy",
    },
    {
      id: "dr-chen",
      name: "Dr. Michael Chen",
      specialty: "Anxiety & Depression",
    },
    {
      id: "dr-patel",
      name: "Dr. Anita Patel",
      specialty: "Stress Management",
    },
  ]
  
  // Session Types
  export const SESSION_TYPES = [
    {
      id: "initial",
      name: "Initial Consultation (60 min)",
    },
    {
      id: "followup",
      name: "Follow-up Session (45 min)",
    },
    {
      id: "cbt",
      name: "Cognitive Behavioral Therapy (50 min)",
    },
  ]
  
  // Upcoming Appointments
  export const APPOINTMENTS = [
    {
      id: 1,
      date: "May 10, 2025",
      time: "10:00 AM",
      therapist: "Dr. Sarah Johnson",
      type: "Follow-up Session",
      status: "Confirmed",
      notes: "Please bring your therapy journal to discuss progress since last session.",
    },
    {
      id: 2,
      date: "May 17, 2025",
      time: "2:30 PM",
      therapist: "Dr. Sarah Johnson",
      type: "Cognitive Behavioral Therapy",
      status: "Pending",
      notes: "Focus on stress management techniques.",
    },
    {
      id: 3,
      date: "May 24, 2025",
      time: "11:15 AM",
      therapist: "Dr. Michael Chen",
      type: "Initial Consultation",
      status: "Confirmed",
      notes: "First session with Dr. Chen to discuss treatment options.",
    },
  ]
  
  // Appointment History
  export const APPOINTMENT_HISTORY = [
    {
      id: 101,
      date: "April 26, 2025",
      therapist: "Dr. Sarah Johnson",
      type: "Follow-up Session",
      status: "Completed",
    },
    {
      id: 102,
      date: "April 12, 2025",
      therapist: "Dr. Sarah Johnson",
      type: "Cognitive Behavioral Therapy",
      status: "Completed",
    },
    {
      id: 103,
      date: "March 29, 2025",
      therapist: "Dr. Michael Chen",
      type: "Initial Consultation",
      status: "Completed",
    },
    {
      id: 104,
      date: "March 15, 2025",
      therapist: "Dr. Sarah Johnson",
      type: "Follow-up Session",
      status: "Cancelled",
    },
    {
      id: 105,
      date: "February 28, 2025",
      therapist: "Dr. Anita Patel",
      type: "Stress Management",
      status: "Completed",
    },
  ]
  