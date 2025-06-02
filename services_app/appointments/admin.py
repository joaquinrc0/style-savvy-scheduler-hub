from django.contrib import admin
from .models import Appointment, Service
from clients.models import Client

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'client', 'service', 'start_time', 'end_time', 'created_at')
    list_filter = ('user', 'start_time', 'created_at', 'status')
    search_fields = ('title', 'description', 'user__username', 'client__first_name', 'client__last_name')

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'duration', 'price', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'description')

