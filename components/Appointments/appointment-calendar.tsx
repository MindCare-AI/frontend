"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Button from "../Appointments/ui/button"
import { cn } from "../../lib/utils"
import { getTherapistAvailability } from "../../API/appointments/patient"
import { TimeSlot } from "../../API/appointments/types"

interface AppointmentCalendarProps {
  therapistId: number;
  onSelectDate: (date: Date) => void;
}

export function AppointmentCalendar({ therapistId, onSelectDate }: AppointmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availableDates, setAvailableDates] = useState<Date[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch available dates when month changes
  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // For the current month, check availability for several days
        const daysToCheck = [];
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Create dates for the current month
        for (let day = 1; day <= daysInMonth; day++) {
          daysToCheck.push(new Date(year, month, day));
        }
        
        // Get available dates based on API responses
        const availableDaysSet = new Set<string>();
        
        // Query API for available slots for several dates throughout the month
        // This is a simplification - in a real app you might want to batch these requests
        for (let i = 1; i <= daysInMonth; i += 7) { // Check every 7th day
          const dateToCheck = new Date(year, month, i);
          const formattedDate = dateToCheck.toISOString().split('T')[0];
          
          try {
            const response = await getTherapistAvailability(therapistId, formattedDate);
            if (response.available_slots.length > 0) {
              availableDaysSet.add(formattedDate);
            }
          } catch (err) {
            console.error(`Error checking availability for ${formattedDate}:`, err);
          }
        }
        
        // Convert the set of date strings to Date objects
        const availableDateObjects = Array.from(availableDaysSet).map(dateStr => {
          const [y, m, d] = dateStr.split('-').map(Number);
          return new Date(y, m - 1, d); // Month is 0-indexed in JS Date
        });
        
        setAvailableDates(availableDateObjects);
      } catch (err) {
        console.error("Error fetching availability:", err);
        setError("Failed to load available appointment dates");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [currentMonth, therapistId]);

  const isDateAvailable = (date: Date) => {
    return availableDates.some(
      (availableDate) =>
        availableDate.getDate() === date.getDate() &&
        availableDate.getMonth() === date.getMonth() &&
        availableDate.getFullYear() === date.getFullYear(),
    )
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const renderCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const available = isDateAvailable(date)
      const today = isToday(date)
      const pastDate = isPastDate(date)

      days.push(
        <Button
          key={day}
          variant="ghost"
          className={cn(
            "h-10 w-10 p-0 font-normal aria-selected:opacity-100",
            today ? "bg-primary/10 text-primary" : "",
            pastDate ? "text-muted-foreground opacity-50" : "",
            available && !pastDate ? "bg-primary/5 hover:bg-primary/10" : "opacity-50",
          )}
          disabled={!available || pastDate}
          onClick={() => onSelectDate(date)}
        >
          {day}
        </Button>,
      )
    }

    return days
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">
          {currentMonth.toLocaleString("default", { month: "long" })} {currentMonth.getFullYear()}
        </h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading && <div className="text-center py-4">Loading availability...</div>}

      {error && <div className="text-red-500 py-2">{error}</div>}

      <div className="grid grid-cols-7 gap-2 text-center">
        <div className="text-sm font-medium">Sun</div>
        <div className="text-sm font-medium">Mon</div>
        <div className="text-sm font-medium">Tue</div>
        <div className="text-sm font-medium">Wed</div>
        <div className="text-sm font-medium">Thu</div>
        <div className="text-sm font-medium">Fri</div>
        <div className="text-sm font-medium">Sat</div>
        {renderCalendar()}
      </div>

      <div className="flex items-center justify-center space-x-4 text-sm">
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-primary/10 mr-2"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-primary/5 mr-2"></div>
          <span>Available</span>
        </div>
      </div>
    </div>
  )
}
