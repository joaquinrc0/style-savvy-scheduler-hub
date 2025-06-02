from rest_framework import viewsets, permissions, filters
from .models import Stylist
from .serializers import StylistSerializer

class StylistViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows stylists to be viewed or edited.
    """
    queryset = Stylist.objects.all()
    serializer_class = StylistSerializer
    
    # For development, disable authentication and permissions
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        """
        Optionally filter by name with a 'q' query parameter.
        """
        queryset = Stylist.objects.all()
        query = self.request.query_params.get('q')
        if query:
            queryset = queryset.filter(name__icontains=query)
        return queryset
