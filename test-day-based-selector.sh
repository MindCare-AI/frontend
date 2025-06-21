#!/bin/bash

# Test day-based selector implementation in booking modal

echo "🧪 Testing Day-Based Selector in Booking Modal"
echo "=============================================="

echo ""
echo "📋 Checking for DayBasedSelector implementation..."

if [ -f "/home/siaziz/Desktop/frontend/components/Appointments/patient_dashboard/ui/DayBasedSelector.tsx" ]; then
    echo "✅ DayBasedSelector component exists"
    
    # Check for key features
    grep -q "AvailabilityDay" "/home/siaziz/Desktop/frontend/components/Appointments/patient_dashboard/ui/DayBasedSelector.tsx" && echo "✅ AvailabilityDay interface found"
    grep -q "dayName" "/home/siaziz/Desktop/frontend/components/Appointments/patient_dashboard/ui/DayBasedSelector.tsx" && echo "✅ Day name display found"
    grep -q "slots.length" "/home/siaziz/Desktop/frontend/components/Appointments/patient_dashboard/ui/DayBasedSelector.tsx" && echo "✅ Slot count display found"
    grep -q "selectedDay" "/home/siaziz/Desktop/frontend/components/Appointments/patient_dashboard/ui/DayBasedSelector.tsx" && echo "✅ Day selection logic found"
else
    echo "❌ DayBasedSelector component missing"
fi

echo ""
echo "📋 Checking BookAppointmentModal integration..."

if [ -f "/home/siaziz/Desktop/frontend/components/Appointments/patient_dashboard/BookAppointmentModal.tsx" ]; then
    echo "✅ BookAppointmentModal exists"
    
    # Check for DayBasedSelector usage
    grep -q "import.*DayBasedSelector" "/home/siaziz/Desktop/frontend/components/Appointments/patient_dashboard/BookAppointmentModal.tsx" && echo "✅ DayBasedSelector imported"
    grep -q "selectedDay.*AvailabilityDay" "/home/siaziz/Desktop/frontend/components/Appointments/patient_dashboard/BookAppointmentModal.tsx" && echo "✅ selectedDay state found"
    grep -q "availableDays.*AvailabilityDay" "/home/siaziz/Desktop/frontend/components/Appointments/patient_dashboard/BookAppointmentModal.tsx" && echo "✅ availableDays state found"
    grep -q "processTherapistAvailability" "/home/siaziz/Desktop/frontend/components/Appointments/patient_dashboard/BookAppointmentModal.tsx" && echo "✅ Availability processing found"
    grep -q "handleDaySelect" "/home/siaziz/Desktop/frontend/components/Appointments/patient_dashboard/BookAppointmentModal.tsx" && echo "✅ Day selection handler found"
    
    # Check if DatePicker is removed/replaced
    if grep -q "DatePicker" "/home/siaziz/Desktop/frontend/components/Appointments/patient_dashboard/BookAppointmentModal.tsx"; then
        echo "⚠️  DatePicker still present - check if properly replaced"
    else
        echo "✅ DatePicker replaced with DayBasedSelector"
    fi
else
    echo "❌ BookAppointmentModal missing"
fi

echo ""
echo "📋 Checking for availability processing logic..."

grep -A 10 -B 5 "processTherapistAvailability" "/home/siaziz/Desktop/frontend/components/Appointments/patient_dashboard/BookAppointmentModal.tsx" | head -20

echo ""
echo "📋 Checking day selection handler..."

grep -A 10 -B 5 "handleDaySelect" "/home/siaziz/Desktop/frontend/components/Appointments/patient_dashboard/BookAppointmentModal.tsx" | head -20

echo ""
echo "📋 Checking therapist availability structure..."

grep -A 5 -B 5 "availability\[dayName\]" "/home/siaziz/Desktop/frontend/components/Appointments/patient_dashboard/BookAppointmentModal.tsx"

echo ""
echo "🧪 Test complete!"
