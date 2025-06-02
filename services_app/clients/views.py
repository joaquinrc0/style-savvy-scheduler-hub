from rest_framework import viewsets, permissions, filters
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Client
from .serializers import ClientSerializer

class ClientViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and editing client instances."""
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    
    # Require authentication
    permission_classes = [IsAuthenticated]
    
    # Add filtering and search capabilities
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['first_name', 'last_name', 'email', 'phone_number']
    ordering_fields = ['last_name', 'first_name', 'created_at']
    ordering = ['last_name', 'first_name']
    
    def get_queryset(self):
        """Allow filtering clients by query parameters"""
        queryset = Client.objects.all()
        search_query = self.request.query_params.get('q', None)
        
        if search_query:
            queryset = queryset.filter(
                Q(first_name__icontains=search_query) |
                Q(last_name__icontains=search_query) |
                Q(email__icontains=search_query) |
                Q(phone_number__icontains=search_query)
            )
            
        return queryset
