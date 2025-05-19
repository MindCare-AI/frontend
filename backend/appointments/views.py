from django.utils import timezone
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from django.core.exceptions import ValidationError
from datetime import datetime
from .models import Appointment, WaitingListEntry
from .serializers import (
    AppointmentSerializer,
    WaitingListEntrySerializer,
    AppointmentConfirmationSerializer,
)
from therapist.permissions.therapist_permissions import IsVerifiedTherapist
from core.permissions import IsPatientOrTherapist
from notifications.models import Notification
import logging

logger = logging.getLogger(__name__)


@extend_schema_view(
    list=extend_schema(
        description="List appointments. Therapists see their appointments, patients see their own.",
        summary="List Appointments",
        tags=["Appointments"],
        parameters=[
            OpenApiParameter(
                name="status",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Filter by appointment status (pending/confirmed/cancelled/completed)",
                required=False,
            ),
            OpenApiParameter(
                name="upcoming",
                type=OpenApiTypes.BOOL,
                location=OpenApiParameter.QUERY,
                description="Filter for upcoming appointments only",
                required=False,
            ),
        ],
    ),
    create=extend_schema(
        description="Create a new appointment",
        summary="Create Appointment",
        tags=["Appointments"],
    ),
    retrieve=extend_schema(
        description="Get appointment details",
        summary="Get Appointment",
        tags=["Appointments"],
    ),
    update=extend_schema(
        description="Update appointment details",
        summary="Update Appointment",
        tags=["Appointments"],
    ),
)
class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()  # <-- Added queryset attribute
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsPatientOrTherapist]
    http_method_names = ["get", "post", "patch", "put", "delete"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.user_type == "patient":
            qs = qs.filter(patient__user=user)
        elif user.user_type == "therapist":
            qs = qs.filter(therapist__user=user)

        # Filter by status if provided
        status = self.request.query_params.get("status")
        if status:
            qs = qs.filter(status=status)

        # Filter upcoming if requested
        upcoming = self.request.query_params.get("upcoming")
        if upcoming and upcoming.lower() == "true":
            qs = qs.filter(appointment_date__gt=timezone.now())

        # Filter by therapist's available day if patient has a therapist
        if hasattr(user, "patient_profile") and hasattr(
            user.patient_profile, "therapist"
        ):
            therapist = user.patient_profile.therapist
            qs = qs.filter(date=therapist.available_day)

        return qs.order_by("appointment_date")

    def perform_create(self, serializer):
        user = self.request.user
        # Automatically set patient profile if the user has one
        if hasattr(user, "patient_profile"):
            serializer.save(patient_profile=user.patient_profile, rescheduled_by=None)
        else:
            serializer.save(
                rescheduled_by=None
            )  # Fallback if no patient_profile attribute

    @extend_schema(
        description="Cancel an appointment",
        summary="Cancel Appointment",
        tags=["Appointments"],
        responses={
            200: OpenApiTypes.OBJECT,
            400: OpenApiTypes.OBJECT,
            403: OpenApiTypes.OBJECT,
        },
    )
    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        appointment = self.get_object()

        # Check if appointment can be cancelled
        if appointment.status in ["cancelled", "completed"]:
            return Response(
                {"error": "Cannot cancel a completed or already cancelled appointment"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if appointment.appointment_date <= timezone.now() + timezone.timedelta(
            hours=24
        ):
            return Response(
                {
                    "error": "Cannot cancel appointments less than 24 hours before scheduled time"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        appointment.status = "cancelled"
        appointment.save()

        return Response({"message": "Appointment cancelled successfully"})

    @extend_schema(
        description="Confirm an appointment (therapist only)",
        summary="Confirm Appointment",
        tags=["Appointments"],
        responses={
            200: OpenApiTypes.OBJECT,
            400: OpenApiTypes.OBJECT,
            403: OpenApiTypes.OBJECT,
        },
    )
    @action(
        detail=True, methods=["get", "post"], permission_classes=[IsVerifiedTherapist]
    )
    def confirm(self, request, pk=None):
        appointment = self.get_object()

        if request.method == "GET":
            # Return appointment details with confirmation status
            if appointment.status in ["pending", "scheduled"]:
                serializer = AppointmentConfirmationSerializer(
                    appointment, context={"request": request}
                )
                return Response(
                    {
                        "appointment": serializer.data,
                        "can_confirm": True,
                        "message": "Please confirm this appointment.",
                    }
                )
            elif appointment.status == "confirmed":
                serializer = AppointmentConfirmationSerializer(
                    appointment, context={"request": request}
                )
                return Response(
                    {
                        "appointment": serializer.data,
                        "can_confirm": False,
                        "message": "This appointment is already confirmed.",
                    }
                )
            else:
                return Response(
                    {
                        "error": f"Cannot confirm appointment with status: {appointment.status}"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Handle POST request for confirming the appointment
        if appointment.status not in ["pending", "scheduled"]:
            return Response(
                {"error": "Can only confirm pending or scheduled appointments"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        appointment.status = "confirmed"
        appointment.save()

        # Return detailed confirmation response with the custom serializer
        serializer = AppointmentConfirmationSerializer(
            appointment, context={"request": request}
        )
        return Response(
            {
                "message": "Appointment confirmed successfully",
                "appointment": serializer.data,
            }
        )

    @extend_schema(
        description="Mark an appointment as completed (therapist only)",
        summary="Complete Appointment",
        tags=["Appointments"],
        responses={
            200: OpenApiTypes.OBJECT,
            400: OpenApiTypes.OBJECT,
            403: OpenApiTypes.OBJECT,
        },
    )
    @action(detail=True, methods=["post"], permission_classes=[IsVerifiedTherapist])
    def complete(self, request, pk=None):
        appointment = self.get_object()

        if appointment.status != "confirmed":
            return Response(
                {"error": "Can only complete confirmed appointments"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if appointment.appointment_date > timezone.now():
            return Response(
                {"error": "Cannot complete future appointments"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        appointment.status = "completed"
        appointment.save()

        return Response({"message": "Appointment marked as completed"})


@extend_schema_view(
    list=extend_schema(
        description="List waiting list entries",
        summary="List Waiting List",
        tags=["Waiting List"],
    ),
)
class WaitingListEntryViewSet(viewsets.ModelViewSet):
    serializer_class = WaitingListEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return WaitingListEntry.objects.all()
        elif user.user_type == "therapist":
            return WaitingListEntry.objects.filter(therapist__user=user)
        else:
            return WaitingListEntry.objects.filter(patient__user=user)

    def perform_create(self, serializer):
        # Check if there's already a waiting list entry for this combination
        existing_entry = WaitingListEntry.objects.filter(
            patient__user=self.request.user,
            therapist=serializer.validated_data["therapist"],
            requested_date=serializer.validated_data["requested_date"],
            status="pending",
        ).exists()

        if existing_entry:
            raise ValidationError("You are already on the waiting list for this date")

        serializer.save()

    @extend_schema(
        description="Check availability updates for waiting list entries",
        summary="Check Availability",
        tags=["Waiting List"],
    )
    @action(detail=False, methods=["get"])
    def check_availability(self, request):
        """Check for available slots matching waiting list entries"""
        entries = self.get_queryset().filter(status="pending")
        available_slots = []

        for entry in entries:
            # Check each preferred time slot
            for time_slot in entry.preferred_time_slots:
                time_obj = datetime.strptime(time_slot, "%H:%M").time()
                check_date = datetime.combine(entry.requested_date, time_obj)

                if entry.therapist.check_availability(check_date):
                    available_slots.append(
                        {
                            "entry_id": entry.id,
                            "patient_name": entry.patient.user.get_full_name(),
                            "therapist_name": entry.therapist.user.get_full_name(),
                            "date": entry.requested_date,
                            "available_time": time_slot,
                        }
                    )

                    # Update entry status to notified
                    entry.status = "notified"
                    entry.notified_at = timezone.now()
                    entry.save()

                    # Create notification for the patient
                    Notification.objects.create(
                        recipient=entry.patient.user,
                        actor=entry.therapist.user,
                        verb="slot_available",
                        action_object=entry,
                        description=f"A slot is available on {entry.requested_date} at {time_slot}",
                    )

        return Response(available_slots)

    @extend_schema(
        description="Cancel a waiting list entry",
        summary="Cancel Entry",
        tags=["Waiting List"],
    )
    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        entry = self.get_object()
        entry.status = "cancelled"
        entry.save()

        return Response(
            {
                "message": "Waiting list entry cancelled successfully",
                "entry": WaitingListEntrySerializer(entry).data,
            }
        )
