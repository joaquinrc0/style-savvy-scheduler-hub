from django.contrib import admin
from .models import Stylist

@admin.register(Stylist)
class StylistAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_at')
    search_fields = ('name',)
    list_filter = ('created_at',)
