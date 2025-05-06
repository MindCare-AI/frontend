"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Clock, Users, Loader2 } from "lucide-react"
import Button from "../../../components/Appointments/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/Appointments/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/Appointments/ui/tabs"
import { AppointmentCard } from "../../../components/Appointments/appointment-card"
import { getTherapistAppointments } from "../../../API/appointments/therapist"
import { checkTherapistProfileExists } from "../../../API/settings/therapist_profile"
import { Appointment } from "../../../API/appointments/types"
import { useRouter } from "next/router"
import { Alert, AlertDescription, AlertTitle } from "../../../components/Appointments/ui/Alert"
import { getWaitingList } from "../../../API/appointments/waitingList"

export default function TherapistDashboard() {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTherapist, setIsTherapist] = useState(false)
  const [todayCount, setTodayCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [waitingListCount, setWaitingListCount] = useState(0)
  const router = useRouter()

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

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    if (!isTherapist) return

    try {
      setLoading(true)
      const response = await getTherapistAppointments()
      setAppointments(response.results)

      // Count today's appointments
      const today = new Date().toISOString().split('T')[0]
      const todaysAppts = response.results.filter(app => 
        app.appointment_date.startsWith(today) && 
        ["scheduled", "confirmed"].includes(app.status)
      )
      setTodayCount(todaysAppts.length)

      // Count pending appointments
      const pendingAppts = response.results.filter(app => app.status === "scheduled")
      setPendingCount(pendingAppts.length)

      // Get waiting list count
      const waitingListResponse = await getWaitingList()
      const activeWaitingList = waitingListResponse.results.filter(entry => entry.status === 'active')
      setWaitingListCount(activeWaitingList.length)

      setError(null)
    } catch (err) {
      console.error("Error fetching therapist appointments:", err)
      setError("Failed to load appointment data")
    } finally {
      setLoading(false)
    }
  }, [isTherapist])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  // Filter appointments based on active tab
  const getFilteredAppointments = () => {
    switch (activeTab) {
      case "upcoming":
        return appointments.filter(app => app.status === "confirmed")
      case "pending":
        return appointments.filter(app => app.status === "scheduled")
      case "past":
        return appointments.filter(app => 
          ["completed", "cancelled"].includes(app.status)
        )
      default:
        return appointments
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Therapist Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/therapist/availability">
              <Clock className="mr-2 h-4 w-4" />
              Set Availability
            </Link>
          </Button>
          <Button asChild>
            <Link href="/therapist/waiting-list">
              <Users className="mr-2 h-4 w-4" />
              Waiting List
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Today</CardTitle>
            <CardDescription>Appointments for today</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{todayCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Pending</CardTitle>
            <CardDescription>Awaiting confirmation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Waiting List</CardTitle>
            <CardDescription>Patients waiting for slots</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{waitingListCount}</p>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="upcoming" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="past">Past Appointments</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <TabsContent value="upcoming" className="space-y-4">
              {getFilteredAppointments().length > 0 ? (
                getFilteredAppointments().map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    userType="therapist"
                    actions={
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" asChild>
                          <Link href={`/therapist/start-session/${appointment.id}`}>Start Session</Link>
                        </Button>
                        <Button variant="destructive" size="sm" asChild>
                          <Link href={`/therapist/cancel/${appointment.id}`}>Cancel</Link>
                        </Button>
                      </div>
                    }
                  />
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No upcoming appointments found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {getFilteredAppointments().length > 0 ? (
                getFilteredAppointments().map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    userType="therapist"
                    actions={
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" onClick={() => {
                          router.push(`/therapist/confirm/${appointment.id}`)
                        }}>
                          Confirm
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          router.push(`/therapist/suggest-time/${appointment.id}`)
                        }}>
                          Suggest Time
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => {
                          router.push(`/therapist/decline/${appointment.id}`)
                        }}>
                          Decline
                        </Button>
                      </div>
                    }
                  />
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No pending appointments found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {getFilteredAppointments().length > 0 ? (
                getFilteredAppointments().map((appointment) => (
                  <AppointmentCard 
                    key={appointment.id} 
                    appointment={appointment} 
                    userType="therapist" 
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
