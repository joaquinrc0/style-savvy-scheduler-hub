from django.core.management.base import BaseCommand
from appointments.models import Service

class Command(BaseCommand):
    help = 'Seeds the database with initial service data'

    def handle(self, *args, **options):
        # Check if services already exist
        if Service.objects.exists():
            self.stdout.write(self.style.WARNING('Services already exist in the database. Skipping...'))
            return
            
        # Create initial services
        services = [
            {
                'name': 'Women\'s Haircut',
                'description': 'Professional haircut service for women including wash, cut, and style.',
                'duration': 60,
                'price': 45.00,
            },
            {
                'name': 'Men\'s Haircut',
                'description': 'Professional haircut service for men including wash, cut, and style.',
                'duration': 30,
                'price': 30.00,
            },
            {
                'name': 'Child\'s Haircut',
                'description': 'Haircut service for children under 12.',
                'duration': 30,
                'price': 25.00,
            },
            {
                'name': 'Hair Color',
                'description': 'Full hair coloring service with professional grade products.',
                'duration': 120,
                'price': 85.00,
            },
            {
                'name': 'Highlights',
                'description': 'Partial or full highlights to add dimension to your hair.',
                'duration': 90,
                'price': 75.00,
            },
        ]
        
        # Create services
        for service_data in services:
            Service.objects.create(**service_data)
            self.stdout.write(self.style.SUCCESS(f'Created service: {service_data["name"]}'))
            
        self.stdout.write(self.style.SUCCESS(f'Successfully created {len(services)} services'))
