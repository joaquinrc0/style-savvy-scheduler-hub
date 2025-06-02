from django.db import models
from django.contrib.auth.models import User
from clients.models import Client

class Service(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    duration = models.IntegerField(help_text="Duration in minutes")
    price = models.DecimalField(max_digits=6, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['name']

class Appointment(models.Model):
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments')
    client = models.ForeignKey(Client, on_delete=models.SET_NULL, related_name='appointments', null=True, blank=True)
    title = models.CharField(max_length=200)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    description = models.TextField(blank=True, null=True)
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, related_name='appointments', null=True, blank=True)
    stylist_id = models.CharField(max_length=50, blank=True, null=True)  # Optional reference to a stylist
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} for {self.user.username} at {self.start_time.strftime('%Y-%m-%d %H:%M')}"

    class Meta:
        ordering = ['start_time']

