from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Stylist
from .serializers import StylistSerializer

class StylistViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows stylists to be viewed or edited.
    """
    queryset = Stylist.objects.all()
    serializer_class = StylistSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Optionally filter by name with a 'q' query parameter.
        """
        queryset = Stylist.objects.all()
        query = self.request.query_params.get('q')
        if query:
            queryset = queryset.filter(name__icontains=query)
        return queryset
