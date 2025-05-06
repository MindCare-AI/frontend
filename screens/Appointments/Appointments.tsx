"use client"

import { useRouter } from "next/navigation"
import Button from "../../components/Appointments/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/Appointments/ui/card"

export default function Home() {
  const router = useRouter()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Therapy Appointments App</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Patient Portal</CardTitle>
            <CardDescription>Book and manage your therapy appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Access your appointments, book new sessions, and join waiting lists for your preferred therapists.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/patient/dashboard")}>
              Enter as Patient
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Therapist Portal</CardTitle>
            <CardDescription>Manage your schedule and patient appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Set your availability, confirm appointments, and manage your patient waiting lists.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/therapist/dashboard")}>
              Enter as Therapist
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
