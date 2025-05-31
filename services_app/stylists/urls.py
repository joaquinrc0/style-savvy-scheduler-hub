from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StylistViewSet

router = DefaultRouter()
router.register(r'stylists', StylistViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
