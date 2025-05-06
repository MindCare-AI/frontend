"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Calendar, Loader2 } from "lucide-react"
import Button from "../../../components/Appointments/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/Appointments/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/Appointments/ui/tabs"
import { Badge } from "../../../components/Appointments/ui/badge"
import { AppointmentCard } from "../../../components/Appointments/appointment-card"
import { Alert, AlertDescription, AlertTitle } from "../../../components/Appointments/ui/Alert"
import { useRouter } from "next/router"
import { Appointment } from "../../../API/appointments/types"
import { getAppointmentHistory, getUpcomingAppointments, cancelPatientAppointment } from "../../../API/appointments/patient"
import { getWaitingList, cancelWaitingListEntry } from "../../../API/appointments/waitingList"
import { WaitingListEntry } from "../../../API/appointments/types"

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Fetch patient data
  const fetchPatientData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch upcoming appointments
      const upcomingResponse = await getUpcomingAppointments()
      
      // Fetch past appointments
      const pastResponse = await getAppointmentHistory({
        status: 'completed,cancelled'
      })
      
      // Combine appointments
      setAppointments([...upcomingResponse.results, ...pastResponse.results])
      
      // Fetch waiting list entries
      const waitingListResponse = await getWaitingList()
      setWaitingList(waitingListResponse.results)
      
    } catch (err) {
      console.error("Error fetching patient data:", err)
      setError("Failed to load your appointment data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPatientData()
  }, [fetchPatientData])

  const cancelWaitingRequest = async (entryId: number) => {
    try {
      setLoading(true)
      await cancelWaitingListEntry(entryId)
      // Update local state
      setWaitingList(prevList => prevList.filter(entry => entry.id !== entryId))
    } catch (err) {
      console.error("Error cancelling waiting list entry:", err)
      setError("Failed to cancel waiting list request")
    } finally {
      setLoading(false)
    }
  }

  const cancelAppointment = async (appointmentId: number) => {
    try {
      setLoading(true)
      await cancelPatientAppointment(appointmentId)
      // Update appointment status in local state
      setAppointments(prev => 
        prev.map(app => 
          app.id === appointmentId ? { ...app, status: 'cancelled' } : app
        )
      )
    } catch (err) {
      console.error("Error cancelling appointment:", err)
      setError("Failed to cancel appointment")
    } finally {
      setLoading(false)
    }
  }

  // Filter appointments and waiting list based on active tab
  const getFilteredContent = () => {
    switch (activeTab) {
      case "upcoming":
        return appointments.filter(app => 
          ["scheduled", "confirmed"].includes(app.status)
        )
      case "waiting":
        return waitingList.filter(entry => entry.status === 'active')
      case "past":
        return appointments.filter(app => 
          ["completed", "cancelled"].includes(app.status)
        )
      default:
        return []
    }
  }

  // Count metrics
  const upcomingCount = appointments.filter(app => 
    ["scheduled", "confirmed"].includes(app.status)
  ).length

  const waitingCount = waitingList.filter(entry => 
    entry.status === 'active'
  ).length

  const completedCount = appointments.filter(app => 
    app.status === 'completed'
  ).length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Patient Dashboard</h1>
        <Button asChild>
          <Link href="/patient/book-appointment">
            <Calendar className="mr-2 h-4 w-4" />
            Book Appointment
          </Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Upcoming</CardTitle>
            <CardDescription>Your scheduled sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{upcomingCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Waiting Lists</CardTitle>
            <CardDescription>Pending slot requests</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{waitingCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Completed</CardTitle>
            <CardDescription>Past sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{completedCount}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="waiting">Waiting Lists</TabsTrigger>
          <TabsTrigger value="past">Past Appointments</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <TabsContent value="upcoming" className="space-y-4">
              {activeTab === "upcoming" && getFilteredContent().length > 0 ? (
                getFilteredContent().map((appointment: Appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    userType="patient"
                    actions={
                      appointment.status === "scheduled" || appointment.status === "confirmed" ? (
                        <div className="flex gap-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => router.push(`/patient/reschedule/${appointment.id}`)}
                          >
                            Reschedule
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => cancelAppointment(appointment.id)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : null
                    }
                  />
                ))
              ) : (
                <div className="text-center py-10">
                  <h3 className="text-lg font-medium">No upcoming appointments</h3>
                  <p className="text-muted-foreground mt-1">Book a new appointment to get started</p>
                  <Button className="mt-4" asChild>
                    <Link href="/patient/book-appointment">Book Now</Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="waiting" className="space-y-4">
              {activeTab === "waiting" && getFilteredContent().length > 0 ? (
                getFilteredContent().map((entry: WaitingListEntry) => (
                  <Card key={entry.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Waiting List Request</CardTitle>
                          <CardDescription>Added on {new Date(entry.created_at).toLocaleDateString()}</CardDescription>
                        </div>
                        <Badge>{entry.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p>
                          <strong>Preferred days:</strong> {entry.preferred_days.join(', ')}
                        </p>
                        <p>
                          <strong>Preferred times:</strong> {entry.preferred_times.join(', ')}
                        </p>
                        <p>
                          <strong>Notes:</strong> {entry.notes || 'No notes provided'}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4" 
                        onClick={() => cancelWaitingRequest(entry.id)}
                      >
                        Cancel Request
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No waiting list requests found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {activeTab === "past" && getFilteredContent().length > 0 ? (
                getFilteredContent().map((appointment: Appointment) => (
                  <AppointmentCard 
                    key={appointment.id} 
                    appointment={appointment} 
                    userType="patient" 
                  />
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No past appointments found</p>
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}
