"use client"

import { useState } from "react"
import Button from "../Appointments/ui/button"
import { Card, CardContent } from "../Appointments/ui/card"
import Input from "../Appointments/ui/input"
import Label from "../Appointments/ui/Label"
import Textarea from "../Appointments/ui/Textarea"
import {Slider} from "../Appointments/ui/slider"
import { formatDate } from "../../lib/Appointments/utils"
import { TimeSlot } from "../../API/appointments/types"

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
  date: string; // ISO date string YYYY-MM-DD
  timeSlot: TimeSlot;
  onSubmit: (formData: { notes: string; duration_minutes: number }) => void;
  isSubmitting: boolean;
}

export function AppointmentForm({ therapist, date, timeSlot, onSubmit, isSubmitting }: AppointmentFormProps) {
  const [painLevel, setPainLevel] = useState(0)
  const [notes, setNotes] = useState("")
  const [insuranceInfo, setInsuranceInfo] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Build notes including pain level and insurance
    const fullNotes = notes
      ? `Pain Level: ${painLevel}/10. Insurance: ${insuranceInfo}. ${notes}`
      : `Pain Level: ${painLevel}/10`
    onSubmit({ notes: fullNotes, duration_minutes: 60 })
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
                <p className="text-sm font-medium">Date</p>
                <p className="text-sm text-muted-foreground">{formatDate(new Date(date))}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Time</p>
                <p className="text-sm text-muted-foreground">{timeSlot.start}</p>
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

          {/* error handling lifted to parent */}

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
