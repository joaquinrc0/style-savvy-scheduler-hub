from rest_framework import serializers
from rest_framework import serializers
from .models import Appointment
from clients.models import Client
from clients.serializers import ClientSerializer
from django.contrib.auth.models import User
import datetime

class AppointmentSerializer(serializers.ModelSerializer):
    # Make user optional - view will set it automatically
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, write_only=True)
    
    # Make title optional for partial updates
    title = serializers.CharField(max_length=200, required=False)
    
    # Add client serialization
    client = serializers.PrimaryKeyRelatedField(queryset=Client.objects.all(), required=False, allow_null=True)
    client_details = ClientSerializer(source='client', read_only=True)
    
    class Meta:
        model = Appointment
        fields = ['id', 'user', 'client', 'client_details', 'title', 'start_time', 'end_time', 
                 'description', 'service_id', 'stylist_id', 'status', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        # For creation, title is required
        if self.instance is None and 'title' not in data:
            raise serializers.ValidationError({'title': 'Title is required when creating a new appointment'})
            
        # Make sure we have both start_time and end_time
        if 'start_time' in data and 'end_time' not in data:
            # Default duration of 1 hour
            data['end_time'] = data['start_time'] + datetime.timedelta(hours=1)
        return data
