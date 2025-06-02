from rest_framework import viewsets, permissions, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.db.models import Q
from .models import Appointment, Service
from clients.models import Client
from .serializers import AppointmentSerializer, ServiceSerializer
from clients.serializers import ClientSerializer

class ServiceViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and editing service instances."""
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    
    # Require authentication
    permission_classes = [IsAuthenticated]
    
    # Add filtering and search capabilities
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price', 'duration', 'created_at']
    ordering = ['name']
    
    def get_queryset(self):
        """Allow filtering services by query parameters"""
        queryset = Service.objects.all()
        search_query = self.request.query_params.get('q', None)
        
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query)
            )
            
        return queryset

class AppointmentViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and editing appointment instances."""
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    
    # Require authentication
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        # Always use the first user (ID 1) for development
        user = User.objects.get(id=1)
        serializer.save(user=user)
    
    def perform_update(self, serializer):
        # Keep the existing user when updating
        serializer.save()
