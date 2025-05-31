from django.db import models

class Stylist(models.Model):
    name = models.CharField(max_length=100)
    specialties = models.JSONField(default=list)  # Store specialties as a JSON array
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']
