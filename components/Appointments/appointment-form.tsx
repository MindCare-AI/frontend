"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Button from "../Appointments/ui/button"
import { Card, CardContent } from "../Appointments/ui/card"
import Input from "../Appointments/ui/input"
import Label from "../Appointments/ui/Label"
import Textarea from "../Appointments/ui/Textarea"
import {Slider} from "../Appointments/ui/slider"
import { formatDate } from "../../lib/Appointments/utils"
import { bookAppointment } from "../../API/appointments/patient"

// Import necessary types
import { CreateAppointmentParams } from "../../API/appointments/types"

// Define therapist type that we receive from the page
interface Therapist {
  id: number;
  first_name: string;
  last_name: string;
  full_name?: string;
  specialty: string;
}

interface AppointmentFormProps {
  therapist: Therapist;
  date: Date;
  time: string;
}

export function AppointmentForm({ therapist, date, time }: AppointmentFormProps) {
  const router = useRouter()
  const [painLevel, setPainLevel] = useState(0)
  const [notes, setNotes] = useState("")
  const [insuranceInfo, setInsuranceInfo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Format date and time for the API
    const appointmentDateTime = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    appointmentDateTime.setHours(hours, minutes, 0, 0);
    
    // Create appointment data for the API
    const appointmentData: Omit<CreateAppointmentParams, 'therapist_id'> = {
      appointment_date: appointmentDateTime.toISOString(),
      duration_minutes: 60, // Default duration or make it configurable
      notes: notes ? `Pain Level: ${painLevel}/10. Insurance: ${insuranceInfo}. ${notes}` : `Pain Level: ${painLevel}/10`,
      pain_level: painLevel
    };

    try {
      // Call the API to book the appointment
      await bookAppointment(therapist.id, appointmentData);
      
      // Redirect to confirmation page on success
      router.push("/patient/appointment-confirmation");
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError('Failed to book appointment. Please try again.');
      setIsSubmitting(false);
    }
  }

  const fullName = therapist.full_name || `${therapist.first_name} ${therapist.last_name}`;

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Appointment Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Therapist</p>
                <p className="text-sm text-muted-foreground">{fullName}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Specialty</p>
                <p className="text-sm text-muted-foreground">{therapist.specialty}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Date</p>
                <p className="text-sm text-muted-foreground">{formatDate(date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Time</p>
                <p className="text-sm text-muted-foreground">{time}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pain-level">Pain Level (0-10)</Label>
            <div className="flex items-center space-x-4">
              <Slider
                min={0}
                max={10}
                step={1}
                value={[painLevel]}
                onValueChange={(values: number[]) => setPainLevel(values[0])}
                className="flex-1"
              />
              <span className="w-12 text-center font-medium">{painLevel}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes for Therapist</Label>
            <Textarea
              id="notes"
              placeholder="Describe your concerns or what you'd like to discuss in this session..."
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="insurance">Insurance Information (Optional)</Label>
            <Input 
              placeholder="Insurance provider and policy number"
              value={insuranceInfo}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInsuranceInfo(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600">
              {error}
            </div>
          )}

          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Booking..." : "Book Appointment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
