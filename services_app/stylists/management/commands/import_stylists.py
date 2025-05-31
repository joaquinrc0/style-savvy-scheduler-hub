from django.core.management.base import BaseCommand
from stylists.models import Stylist

class Command(BaseCommand):
    help = 'Import mock stylist data into the database'

    def handle(self, *args, **options):
        # Mock stylist data (same as in frontend mockData.ts)
        mock_stylists = [
            {"name": "Emma Johnson", "specialties": ["Haircut", "Color"]},
            {"name": "Michael Smith", "specialties": ["Styling", "Extensions"]},
            {"name": "Sophia Garcia", "specialties": ["Color", "Treatment"]},
            {"name": "David Wilson", "specialties": ["Haircut", "Beard"]},
        ]

        created_count = 0
        for stylist_data in mock_stylists:
            # Check if a stylist with this name already exists
            if not Stylist.objects.filter(name=stylist_data['name']).exists():
                Stylist.objects.create(
                    name=stylist_data['name'],
                    specialties=stylist_data['specialties']
                )
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"Created stylist: {stylist_data['name']}"))
            else:
                self.stdout.write(self.style.WARNING(f"Stylist already exists: {stylist_data['name']}"))

        self.stdout.write(self.style.SUCCESS(f"Successfully imported {created_count} stylists"))
