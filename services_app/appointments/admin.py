from django.contrib import admin
from .models import Appointment

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'start_time', 'end_time', 'created_at')
    list_filter = ('user', 'start_time', 'created_at')
    search_fields = ('title', 'description', 'user__username')

