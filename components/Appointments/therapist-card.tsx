"use client"

import Image from "next/image"
import Button from "../Appointments/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../Appointments/ui/card"
import { Badge } from "../Appointments/ui/badge"

// Import UserInfo type
import { UserInfo } from "../../API/appointments/types"

// Define the therapist type
interface Therapist extends UserInfo {
  specialty: string;
  bio: string;
  tags: string[];
  availability: 'high' | 'medium' | 'low';
  image?: string;
}

interface TherapistCardProps {
  therapist: Therapist;
  onSelect: (therapist: Therapist) => void;
}

export function TherapistCard({ therapist, onSelect }: TherapistCardProps) {
  const fullName = therapist.full_name || `${therapist.first_name} ${therapist.last_name}`;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{fullName}</CardTitle>
            <p className="text-sm text-muted-foreground">{therapist.specialty}</p>
          </div>
          {therapist.availability === "high" ? (
            <Badge className="bg-green-50 text-green-700 border-green-200">
              High Availability
            </Badge>
          ) : therapist.availability === "medium" ? (
            <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
              Medium Availability
            </Badge>
          ) : (
            <Badge className="bg-red-50 text-red-700 border-red-200">
              Low Availability
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex gap-4">
          <div className="relative h-20 w-20 rounded-full overflow-hidden">
            <Image
              src={therapist.image || "/placeholder.svg?height=80&width=80"}
              alt={fullName}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm mb-2">{therapist.bio}</p>
            <div className="flex flex-wrap gap-1 mb-4">
              {therapist.tags.map((tag, index) => (
                <Badge key={index} className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <Button onClick={() => onSelect(therapist)} className="w-full">
              Select
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
