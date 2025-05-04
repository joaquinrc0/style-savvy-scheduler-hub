from django.urls import path
from .views import git_push

urlpatterns = [
    path("hooks/git-push/", git_push, name="git-push-hook"),
]
