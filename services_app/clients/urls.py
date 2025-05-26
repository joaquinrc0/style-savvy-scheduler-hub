from django.urls import path
from rest_framework import routers
from .views import ClientViewSet

router = routers.DefaultRouter()
router.register('clients', ClientViewSet)

urlpatterns = router.urls
