"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, Loader2 } from "lucide-react"
import Button from "../../../components/Appointments/ui/button"
import { Card, CardContent } from "../../../components/Appointments/ui/card"
import { TherapistCard } from "../../../components/Appointments/therapist-card"
import { AppointmentCalendar } from "../../../components/Appointments/appointment-calendar"
import { AppointmentForm } from "../../../components/Appointments/appointment-form"
import { Alert, AlertDescription, AlertTitle } from "../../../components/Appointments/ui/Alert"
import { useRouter } from "next/router"
import axios from "axios"
import { API_URL } from "../../../config"
import { getAuthToken } from "../../../lib/utils"
import { getTherapistAvailability, bookAppointment } from "../../../API/appointments/patient"
import { TimeSlot } from "../../../API/appointments/types"

// Interface for therapist data
interface Therapist {
  id: number;
  first_name: string;
  last_name: string;
  specializations: string[];
  years_of_experience: number;
  profile_picture?: string;
  bio?: string;
  hourly_rate?: number;
  rating?: number;
}

export default function BookAppointment() {
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [bookingStep, setBookingStep] = useState(1)
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Fetch therapists
  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        setLoading(true)
        const token = await getAuthToken()
        
        const response = await axios.get(`${API_URL}/therapist/profiles/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })
        
        setTherapists(response.data.results)
      } catch (err) {
        console.error("Error fetching therapists:", err)
        setError("Failed to load therapists. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchTherapists()
  }, [])

  const handleTherapistSelect = (therapist: Therapist) => {
    setSelectedTherapist(therapist)
    setBookingStep(2)
  }

  const handleDateSelect = async (date: string) => {
    try {
      setLoading(true)
      setSelectedDate(date)
      
      if (selectedTherapist) {
        // Fetch available time slots for the selected date and therapist
        const availabilityResponse = await getTherapistAvailability(
          selectedTherapist.id, 
          date
        )
        
        setAvailableSlots(availabilityResponse.available_slots)
      }
      
      setBookingStep(3)
    } catch (err) {
      console.error("Error fetching available time slots:", err)
      setError("Failed to load available time slots for this date")
    } finally {
      setLoading(false)
    }
  }

  const handleTimeSelect = (timeSlot: TimeSlot) => {
    setSelectedTime(timeSlot)
    setBookingStep(4)
  }

  const handleBack = () => {
    if (bookingStep > 1) {
      setBookingStep(bookingStep - 1)
    }
  }

  const handleSubmit = async (formData: { notes: string, duration_minutes: number }) => {
    if (!selectedTherapist || !selectedDate || !selectedTime) {
      setError("Missing required booking information")
      return
    }
    
    try {
      setSubmitting(true)
      
      // Format appointment date with time
      const [hours, minutes] = selectedTime.start.split(':')
      const appointmentDate = new Date(selectedDate)
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0)
      
      // Book appointment
      await bookAppointment(selectedTherapist.id, {
        appointment_date: appointmentDate.toISOString(),
        duration_minutes: formData.duration_minutes,
        notes: formData.notes
      })
      
      // Redirect to confirmation page
      router.push('/patient/appointment-confirmation')
    } catch (err) {
      console.error("Error booking appointment:", err)
      setError("Failed to book appointment. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={handleBack} disabled={bookingStep === 1}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold ml-2">Book an Appointment</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div
            className={`rounded-full h-8 w-8 flex items-center justify-center ${bookingStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            1
          </div>
          <div className={`h-1 w-12 ${bookingStep >= 2 ? "bg-primary" : "bg-muted"}`}></div>
          <div
            className={`rounded-full h-8 w-8 flex items-center justify-center ${bookingStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            2
          </div>
          <div className={`h-1 w-12 ${bookingStep >= 3 ? "bg-primary" : "bg-muted"}`}></div>
          <div
            className={`rounded-full h-8 w-8 flex items-center justify-center ${bookingStep >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            3
          </div>
          <div className={`h-1 w-12 ${bookingStep >= 4 ? "bg-primary" : "bg-muted"}`}></div>
          <div
            className={`rounded-full h-8 w-8 flex items-center justify-center ${bookingStep >= 4 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            4
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )}

      {!loading && bookingStep === 1 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Select a Therapist</h2>
          {therapists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {therapists.map((therapist) => (
                <TherapistCard
                  key={therapist.id}
                  therapist={therapist}
                  onSelect={() => handleTherapistSelect(therapist)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No therapists available at this time</p>
            </div>
          )}
        </div>
      )}

      {!loading && bookingStep === 2 && selectedTherapist && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Select a Date</h2>
          <Card>
            <CardContent className="p-4">
              <AppointmentCalendar 
                therapistId={selectedTherapist.id} 
                onSelectDate={handleDateSelect} 
              />
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && bookingStep === 3 && selectedDate && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Select a Time</h2>
          <Card>
            <CardContent className="p-4">
              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {availableSlots.map((slot, index) => (
                    <Button 
                      key={index} 
                      variant="outline" 
                      className="h-12" 
                      onClick={() => handleTimeSelect(slot)}
                    >
                      {slot.start}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">
                    No available time slots for this date. Please select another date.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => setBookingStep(2)}
                  >
                    Choose Another Date
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && bookingStep === 4 && selectedTime && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Appointment Details</h2>
          <AppointmentForm 
            therapist={selectedTherapist!}
            date={selectedDate!}
            timeSlot={selectedTime}
            onSubmit={handleSubmit}
            isSubmitting={submitting}
          />
        </div>
      )}
    </div>
  )
}
