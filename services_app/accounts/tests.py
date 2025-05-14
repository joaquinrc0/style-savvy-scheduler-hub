from django.test import TestCase, Client, override_settings
from django.contrib.auth.models import User
from .models import Invitation
import uuid

@override_settings(ROOT_URLCONF='accounts.test_urls')
class AuthApiE2ETest(TestCase):
    def setUp(self):
        self.client = Client()
        self.invite_email = 'testuser@example.com'
        self.invite_token = uuid.uuid4()
        self.invite = Invitation.objects.create(email=self.invite_email, token=self.invite_token)
        self.username = 'testuser'
        self.password = 'testpass123'

    def test_register_and_login(self):
        # 1. Register via invite
        prefix = ''
        response = self.client.post(f'{prefix}/api/register/{self.invite_token}/', data={
            'username': self.username,
            'email': self.invite_email,
            'password': self.password
        }, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json().get('success'))
        # Invitation should be marked as used
        self.invite.refresh_from_db()
        self.assertTrue(self.invite.used)
        # User should exist
        user = User.objects.get(username=self.username)
        self.assertEqual(user.email, self.invite_email)
        # 2. Logout (in case auto-login)
        self.client.post(f'{prefix}/api/logout/')
        # 3. Login via API
        response = self.client.post(f'{prefix}/api/login/', data={
            'username': self.username,
            'password': self.password
        }, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json().get('success'))
        # 4. Check authentication status
        response = self.client.get(f'{prefix}/api/user/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json().get('isAuthenticated'))
        self.assertEqual(response.json().get('username'), self.username)
