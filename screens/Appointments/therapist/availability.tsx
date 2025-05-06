"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, Plus, Save, Trash2, Loader2 } from "lucide-react"
import Button from "../../../components/Appointments/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/Appointments/ui/card"
import  Checkbox from "../../../components/Appointments/ui/checkbox"
import Label from "../../../components/Appointments/ui/Label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/Appointments/ui/select"
import Separator from "../../../components/Appointments/ui/separator"
import  Input  from "../../../components/Appointments/ui/input"
import { Alert, AlertDescription, AlertTitle } from "../../../components/Appointments/ui/Alert"
import { useRouter } from "next/router"
import { 
  getTherapistAvailability, 
  updateTherapistAvailability, 
  TherapistAvailability,
  TimeSlot,
  DayOfWeek
} from "../../../API/settings/therapist_availability"
import { checkTherapistProfileExists } from "../../../API/settings/therapist_profile"

export default function TherapistAvailabilityScreen() {
  const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as DayOfWeek[]
  const router = useRouter()

  const [isTherapist, setIsTherapist] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  const [availableDays, setAvailableDays] = useState<Record<DayOfWeek, boolean>>({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  })

  const [timeSlots, setTimeSlots] = useState<TherapistAvailability>({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  })

  const [videoSessionLink, setVideoSessionLink] = useState("")

  // Check if user is a therapist
  useEffect(() => {
    const verifyTherapistAccess = async () => {
      try {
        const hasTherapistProfile = await checkTherapistProfileExists()
        setIsTherapist(hasTherapistProfile)
        
        if (!hasTherapistProfile) {
          router.push('/dashboard') // Redirect non-therapists
        }
      } catch (err) {
        console.error("Error verifying therapist access:", err)
        setError("Failed to verify your account type")
      }
    }
    
    verifyTherapistAccess()
  }, [router])

  // Fetch therapist availability
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!isTherapist) return

      try {
        setLoading(true)
        const availability = await getTherapistAvailability()
        
        // Set video session link
        if (availability.video_session_link) {
          setVideoSessionLink(availability.video_session_link)
        }
        
        // Update time slots and available days
        const updatedAvailableDays = { ...availableDays }
        
        daysOfWeek.forEach(day => {
          const slots = availability[day] || []
          if (slots.length > 0) {
            updatedAvailableDays[day] = true
          }
        })
        
        setTimeSlots(availability)
        setAvailableDays(updatedAvailableDays)
      } catch (err) {
        console.error("Error fetching therapist availability:", err)
        setError("Failed to load availability data")
      } finally {
        setLoading(false)
      }
    }
    
    fetchAvailability()
  }, [isTherapist])

  const toggleDay = (day: DayOfWeek) => {
    setAvailableDays({
      ...availableDays,
      [day]: !availableDays[day],
    })

    // If turning off a day, clear its time slots
    if (availableDays[day]) {
      setTimeSlots({
        ...timeSlots,
        [day]: [],
      })
    } else if (!timeSlots[day] || timeSlots[day].length === 0) {
      // If turning on a day with no slots, add a default slot
      setTimeSlots({
        ...timeSlots,
        [day]: [{ start: "09:00", end: "17:00" }],
      })
    }
  }

  const addTimeSlot = (day: DayOfWeek) => {
    const daySlots = timeSlots[day] || []
    const lastSlot = daySlots.length > 0 ? daySlots[daySlots.length - 1] : null
    const newSlot: TimeSlot = { 
      start: lastSlot ? lastSlot.end : "09:00", 
      end: lastSlot ? "18:00" : "17:00" 
    }

    setTimeSlots({
      ...timeSlots,
      [day]: [...(timeSlots[day] || []), newSlot],
    })
  }

  const removeTimeSlot = (day: DayOfWeek, index: number) => {
    const newSlots = [...(timeSlots[day] || [])]
    newSlots.splice(index, 1)

    setTimeSlots({
      ...timeSlots,
      [day]: newSlots,
    })
  }

  const updateTimeSlot = (day: DayOfWeek, index: number, field: 'start' | 'end', value: string) => {
    const newSlots = [...(timeSlots[day] || [])]
    if (newSlots[index]) {
      newSlots[index] = { ...newSlots[index], [field]: value }
    }

    setTimeSlots({
      ...timeSlots,
      [day]: newSlots,
    })
  }

  const saveAvailability = async () => {
    if (!isTherapist) return
    
    try {
      setSaving(true)
      setError(null)
      setSuccessMessage(null)
      
      // Prepare the availability data - only include days that are enabled
      const availabilityData: TherapistAvailability = { video_session_link: videoSessionLink }
      
      daysOfWeek.forEach(day => {
        if (availableDays[day] && timeSlots[day] && timeSlots[day].length > 0) {
          availabilityData[day] = timeSlots[day]
        }
      })
      
      await updateTherapistAvailability(availabilityData)
      setSuccessMessage("Availability saved successfully!")
    } catch (err) {
      console.error("Error saving therapist availability:", err)
      setError("Failed to save availability. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (!isTherapist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            This page is only accessible to therapists.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4">Loading availability settings...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/therapist/dashboard">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-2xl font-bold ml-2">Set Your Availability</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-4 bg-green-50 border-green-500">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {daysOfWeek.map((day) => (
              <div key={day}>
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox 
                    id={`day-${day}`} 
                    checked={availableDays[day]} 
                    onCheckedChange={() => toggleDay(day)} 
                  />
                  <Label htmlFor={`day-${day}`} className="text-lg font-medium">
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </Label>
                </div>

                {availableDays[day] && (
                  <div className="pl-6 space-y-4">
                    {(timeSlots[day] || []).map((slot, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="grid grid-cols-2 gap-2 flex-1">
                          <div>
                            <Label htmlFor={`${day}-start-${index}`}>Start Time</Label>
                            <Select
                              value={slot.start}
                              onValueChange={(value) => updateTimeSlot(day, index, "start", value)}
                            >
                              <SelectTrigger id={`${day}-start-${index}`}>
                                <SelectValue placeholder="Select start time" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 24 }).map((_, hour) => (
                                  <SelectItem key={hour} value={`${hour.toString().padStart(2, "0")}:00`}>
                                    {`${hour.toString().padStart(2, "0")}:00`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor={`${day}-end-${index}`}>End Time</Label>
                            <Select
                              value={slot.end}
                              onValueChange={(value) => updateTimeSlot(day, index, "end", value)}
                            >
                              <SelectTrigger id={`${day}-end-${index}`}>
                                <SelectValue placeholder="Select end time" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 24 }).map((_, hour) => (
                                  <SelectItem key={hour} value={`${hour.toString().padStart(2, "0")}:00`}>
                                    {`${hour.toString().padStart(2, "0")}:00`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {(timeSlots[day]?.length || 0) > 1 && (
                          <Button variant="ghost" size="icon" onClick={() => removeTimeSlot(day, index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}

                    <Button variant="outline" size="sm" onClick={() => addTimeSlot(day)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Time Slot
                    </Button>
                  </div>
                )}

                {day !== daysOfWeek[daysOfWeek.length - 1] && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Video Session Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="video-session-link">Video Session Link</Label>
              <Input 
                id="video-session-link"
                type="text"
                placeholder="https://zoom.us/j/your-meeting-id"
                value={videoSessionLink}
                onChange={(e) => setVideoSessionLink(e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Provide your default video conferencing link for telehealth sessions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveAvailability} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Availability
        </Button>
      </div>
    </div>
  )
}
