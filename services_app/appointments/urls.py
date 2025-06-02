from django.urls import path
from rest_framework import routers
from .views import AppointmentViewSet, ServiceViewSet
from clients.views import ClientViewSet

router = routers.DefaultRouter()
router.register('appointments', AppointmentViewSet)
router.register('clients', ClientViewSet)
router.register('services', ServiceViewSet)

urlpatterns = router.urls
