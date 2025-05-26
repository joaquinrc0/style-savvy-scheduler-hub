# services_app/urls.py

from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.conf import settings

# Quitamos posibles barras extra:
PREFIX = settings.URL_PREFIX.strip("/")

from . import jwt_urls

urlpatterns = [
    # Montamos TODO bajo /<PREFIX>/...
    path(f"{PREFIX}/", include([
        # Cuando vayan a /<PREFIX>/ → redirigir a /<PREFIX>/login/
        path("", RedirectView.as_view(url=f"/{PREFIX}/login/", permanent=False)),
        path("admin/", admin.site.urls),
        path("", include("accounts.urls")),  # asume que en accounts.urls están login/, logout/, etc.
        path("", include("deploy.urls")),    # despliegue, hooks, etc.
        path("api/token/", include(jwt_urls)),  # JWT endpoints
        path("api/", include("appointments.urls")),  # Appointments API endpoints
    ])),
]
