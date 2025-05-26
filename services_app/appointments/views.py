from rest_framework import viewsets, permissions
from django.contrib.auth.models import User
from .models import Appointment
from .serializers import AppointmentSerializer

class AppointmentViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and editing appointment instances."""
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    
    # For development, disable authentication and permissions
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    
    def perform_create(self, serializer):
        # Always use the first user (ID 1) for development
        user = User.objects.get(id=1)
        serializer.save(user=user)
    
    def perform_update(self, serializer):
        # Keep the existing user when updating
        serializer.save()
