from rest_framework import serializers
from .models import Stylist

class StylistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stylist
        fields = ['id', 'name', 'specialties', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
