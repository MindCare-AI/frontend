"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { AppointmentStackParamList } from "../../../navigation/types"
import { ChevronLeft, Check, X, Loader2 } from "lucide-react"
import Button from "../../../components/Appointments/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/Appointments/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/Appointments/ui/tabs"
import { Badge } from "../../../components/Appointments/ui/badge"
import { 
  getWaitingList, 
  updateWaitingListEntry, 
  removeFromWaitingList, 
  checkWaitingListAvailability 
} from "../../../API/appointments/waitingList"
import { WaitingListEntry } from "../../../API/appointments/types"
import { checkTherapistProfileExists } from "../../../API/settings/therapist_profile"
import { Alert, AlertDescription, AlertTitle } from "../../../components/Appointments/ui/Alert"

export default function TherapistWaitingList() {
  const [activeTab, setActiveTab] = useState("all")
  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTherapist, setIsTherapist] = useState(false)
  const navigation = useNavigation<StackNavigationProp<AppointmentStackParamList>>()

  // Check if user is a therapist
  useEffect(() => {
    const verifyTherapistAccess = async () => {
      try {
        const hasTherapistProfile = await checkTherapistProfileExists()
        setIsTherapist(hasTherapistProfile)
        
        if (!hasTherapistProfile) {
          navigation.navigate("PatientDashboard") // Redirect non-therapists
        }
      } catch (err) {
        console.error("Error verifying therapist access:", err)
        setError("Failed to verify your account type")
      }
    }
    
    verifyTherapistAccess()
  }, [navigation])

  // Fetch waiting list entries
  const fetchWaitingList = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getWaitingList()
      setWaitingList(response.results)
      setError(null)
    } catch (err) {
      console.error("Error fetching waiting list:", err)
      setError("Failed to load waiting list data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isTherapist) {
      fetchWaitingList()
    }
  }, [isTherapist, fetchWaitingList])

  // Check for matching availability
  const checkAvailability = async () => {
    try {
      setLoading(true)
      await checkWaitingListAvailability()
      // Refresh the list after checking availability
      await fetchWaitingList()
    } catch (err) {
      console.error("Error checking availability:", err)
      setError("Failed to check for matching availability")
    } finally {
      setLoading(false)
    }
  }

  // Offer a slot to a patient
  const offerSlot = (entryId: number) => {
    navigation.navigate("OfferSlot", { entryId })
  }

  // Decline a waiting list request
  const declineRequest = async (entryId: number) => {
    try {
      setLoading(true)
      await removeFromWaitingList(entryId)
      // Remove the entry from local state
      setWaitingList(prevList => prevList.filter(entry => entry.id !== entryId))
    } catch (err) {
      console.error(`Error declining request ${entryId}:`, err)
      setError("Failed to decline the request")
    } finally {
      setLoading(false)
    }
  }

  // Confirm a matching slot
  const confirmSlot = async (entryId: number) => {
    try {
      setLoading(true)
      await updateWaitingListEntry(entryId, { status: 'matched' })
      // Update status in local state
      setWaitingList(prevList => 
        prevList.map(entry => 
          entry.id === entryId ? {...entry, status: 'matched'} : entry
        )
      )
    } catch (err) {
      console.error(`Error confirming slot for ${entryId}:`, err)
      setError("Failed to confirm the slot")
    } finally {
      setLoading(false)
    }
  }

  // Filter entries based on active tab
  const getFilteredEntries = () => {
    switch (activeTab) {
      case "match":
        // In a real implementation, we would use a proper field from the API
        // This is a placeholder that should match your API response structure
        return waitingList.filter(entry => 
          entry.status === 'active' && 
          // This assumes your API returns some indication of matching availability
          // Adjust according to your actual API response structure
          (entry as any).matches_availability
        )
      case "processed":
        return waitingList.filter(entry => 
          entry.status === 'matched' || entry.status === 'cancelled'
        )
      case "all":
      default:
        return waitingList.filter(entry => entry.status === 'active')
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
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigation.navigate("TherapistDashboard") }>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold ml-2">Patient Waiting List</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end mb-4">
        <Button onClick={checkAvailability} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Check For Matches
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="match">Matching Availability</TabsTrigger>
          <TabsTrigger value="processed">Processed</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <TabsContent value="all" className="space-y-4">
              {getFilteredEntries().length > 0 ? (
                getFilteredEntries().map((entry) => (
                  <Card key={entry.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{`${entry.patient.first_name} ${entry.patient.last_name}`}</CardTitle>
                        <Badge>{entry.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p>
                          <strong>Requested:</strong> {new Date(entry.created_at).toLocaleDateString()}
                        </p>
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

                      <div className="flex gap-2 mt-4">
                        <Button size="sm" onClick={() => offerSlot(entry.id)}>
                          Offer Slot
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigation.navigate("Messaging", { patientId: entry.patient.id })}>
                          Contact Patient
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="ml-auto"
                          onClick={() => declineRequest(entry.id)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No waiting list requests found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="match" className="space-y-4">
              {getFilteredEntries().length > 0 ? (
                getFilteredEntries().map((entry) => (
                  <Card key={entry.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{`${entry.patient.first_name} ${entry.patient.last_name}`}</CardTitle>
                        <Badge variant="success">Match Found</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p>
                          <strong>Requested:</strong> {new Date(entry.created_at).toLocaleDateString()}
                        </p>
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

                      <div className="flex gap-2 mt-4">
                        <Button size="sm" onClick={() => confirmSlot(entry.id)}>
                          <Check className="h-4 w-4 mr-2" />
                          Confirm Slot
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => offerSlot(entry.id)}>
                          Suggest Alternative
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No matching slots found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="processed" className="space-y-4">
              {getFilteredEntries().length > 0 ? (
                getFilteredEntries().map((entry) => (
                  <Card key={entry.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{`${entry.patient.first_name} ${entry.patient.last_name}`}</CardTitle>
                        <Badge variant="outline">{entry.status === 'matched' ? 'Processed' : 'Cancelled'}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p>
                          <strong>Requested:</strong> {new Date(entry.created_at).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Preferred days:</strong> {entry.preferred_days.join(', ')}
                        </p>
                        <p>
                          <strong>Preferred times:</strong> {entry.preferred_times.join(', ')}
                        </p>
                        <p>
                          <strong>Processed on:</strong> {new Date(entry.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No processed requests found</p>
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}
