from django.core.management.base import BaseCommand
from accounts.models import Invitation

class Command(BaseCommand):
    help = 'Crear una invitación dado un email'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email del usuario invitado')

    def handle(self, *args, **options):
        email = options['email']
        invite, created = Invitation.objects.get_or_create(email=email)
        if not created and invite.used:
            invite.used = False
            invite.save()
        self.stdout.write(f"Token para {email}: {invite.token}")
