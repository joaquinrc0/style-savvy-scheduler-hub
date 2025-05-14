from django.urls import path
from .views import CustomLoginView, CustomLogoutView, invite_register
from .api_views import api_login, api_user, api_logout, api_invite_register

app_name = 'accounts'

urlpatterns = [
    path('login/', CustomLoginView.as_view(), name='login'),
    path('logout/', CustomLogoutView.as_view(), name='logout'),
    path('register/<str:token>/', invite_register, name='invite_register'),
    # API endpoints
    path('api/login/', api_login, name='api_login'),
    path('api/logout/', api_logout, name='api_logout'),
    path('api/user/', api_user, name='api_user'),
    path('api/register/<str:token>/', api_invite_register, name='api_invite_register'),
]

