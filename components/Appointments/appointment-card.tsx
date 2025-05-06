import { Badge } from "../Appointments/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../Appointments/ui/card"
import { formatDate, getStatusColor } from "../../lib/Appointments/utils"

// Import Appointment type
import { Appointment, AppointmentStatus } from "../../API/appointments/types"

interface AppointmentCardProps {
  appointment: Appointment;
  userType: 'patient' | 'therapist';
  actions?: React.ReactNode;
}

export function AppointmentCard({ appointment, userType, actions = null }: AppointmentCardProps) {
  const statusColor = getStatusColor(appointment.status)
  
  // Determine name and specialty based on userType
  const displayName = userType === "patient" 
    ? `${appointment.therapist.first_name} ${appointment.therapist.last_name}`
    : `${appointment.patient.first_name} ${appointment.patient.last_name}`;
  
  const specialty = userType === "patient" ? "Therapist" : "Patient";

  // Parse ISO date string
  const appointmentDate = new Date(appointment.appointment_date);
  const formattedDate = formatDate(appointmentDate);
  const formattedTime = appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Extract pain level from notes if present
  const painLevelMatch = appointment.notes?.match(/Pain Level: (\d+)\/10/);
  const painLevel = painLevelMatch ? parseInt(painLevelMatch[1], 10) : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{displayName}</CardTitle>
            <p className="text-sm text-muted-foreground">{specialty}</p>
          </div>
          <Badge className={statusColor}>{appointment.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <div>
              <p className="font-medium">Date & Time</p>
              <p className="text-muted-foreground">
                {formattedDate} at {formattedTime}
              </p>
            </div>
            <div>
              <p className="font-medium">Duration</p>
              <p className="text-muted-foreground">{appointment.duration} minutes</p>
            </div>
          </div>

          {appointment.notes && (
            <div>
              <p className="font-medium">Notes</p>
              <p className="text-muted-foreground">{appointment.notes}</p>
            </div>
          )}

          {painLevel !== null && (
            <div>
              <p className="font-medium">Pain Level</p>
              <p className="text-muted-foreground">{painLevel}/10</p>
            </div>
          )}

          {appointment.video_session_link && appointment.status === "confirmed" && (
            <div>
              <p className="font-medium">Video Session</p>
              <a
                href={appointment.video_session_link}
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Join Video Session
              </a>
            </div>
          )}

          {actions}
        </div>
      </CardContent>
    </Card>
  )
}
