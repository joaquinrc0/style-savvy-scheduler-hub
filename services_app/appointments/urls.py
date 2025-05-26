from django.urls import path
from rest_framework import routers
from .views import AppointmentViewSet

router = routers.DefaultRouter()
router.register('appointments', AppointmentViewSet)

urlpatterns = router.urls
