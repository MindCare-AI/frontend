"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CheckCircle2, Loader2 } from "lucide-react"
import Button from "../../../components/Appointments/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/Appointments/ui/card"
import { Alert, AlertDescription, AlertTitle } from "../../../components/Appointments/ui/Alert"
import { useRouter } from "next/router"
import { Appointment } from "../../../API/appointments/types"

export default function AppointmentConfirmation() {
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // For a real implementation, you would get the appointment details from the API
  // using the ID passed in the URL or from the session storage
  useEffect(() => {
    // Try to get appointment from session storage or query params
    const appointmentData = sessionStorage.getItem('lastBookedAppointment')
    
    if (appointmentData) {
      try {
        const parsedAppointment = JSON.parse(appointmentData) as Appointment
        setAppointment(parsedAppointment)
      } catch (err) {
        console.error("Error parsing appointment data:", err)
        setError("Failed to load appointment details")
      }
    } else {
      // If no appointment data is found, show default message
      // In a real app, you might redirect or fetch data from API
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Appointment Booked!</CardTitle>
          <CardDescription>Your appointment has been successfully scheduled</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <p className="text-sm font-medium">Therapist</p>
                {appointment ? (
                  <>
                    <p className="text-lg">
                      {appointment.therapist.first_name} {appointment.therapist.last_name}
                    </p>
                  </>
                ) : (
                  <p className="text-lg">Your selected therapist</p>
                )}
              </div>

              <div className="border-b pb-4">
                <p className="text-sm font-medium">Date & Time</p>
                {appointment ? (
                  <>
                    <p className="text-lg">
                      {new Date(appointment.appointment_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(appointment.appointment_date).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} 
                      ({appointment.duration} minutes)
                    </p>
                  </>
                ) : (
                  <p className="text-lg">Your selected date and time</p>
                )}
              </div>

              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-lg">Scheduled</p>
                <p className="text-sm text-muted-foreground">Awaiting therapist confirmation</p>
              </div>
            </div>
          )}

          <div className="space-y-2 pt-4">
            <p className="text-sm text-center">
              You will receive an email confirmation shortly. The therapist will review and confirm your appointment.
            </p>

            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/patient/dashboard">Return to Dashboard</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/patient/book-appointment">Book Another Appointment</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
