# services_app/settings.py

from pathlib import Path
import os

# 1. Base dir
BASE_DIR = Path(__file__).resolve().parent.parent

# 2. Security
SECRET_KEY = os.getenv("SECRET_KEY")
DEBUG = True   # or False in prod

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "eminent-coyote-winning.ngrok-free.app",  # your ngrok domain
]

# 3. Proxy & SCRIPT_NAME
# ------------------------------------------------

# Trust the X-Forwarded-* headers from our nginx → ngrok chain
USE_X_FORWARDED_HOST = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
# ------------------------------------------------

# 4. Installed apps & middleware (unchanged)
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "services_app.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "services_app.wsgi.application"

# 5. Database (unchanged)
if os.getenv("USE_SQLITE", "true").lower() in ("1", "true", "yes"):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("POSTGRES_DB"),
            "USER": os.getenv("POSTGRES_USER"),
            "PASSWORD": os.getenv("POSTGRES_PASSWORD"),
            "HOST": os.getenv("POSTGRES_HOST", "postgres"),
            "PORT": os.getenv("POSTGRES_PORT", "5432"),
        }
    }

# 6. Password validators (unchanged)
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# 7. Internationalization (unchanged)
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# 8. Static files under /django/static/
# ------------------------------------------------
# We want static assets at https://…/django/static/…
STATIC_URL = "/django/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
ROOT_PATH = "django/"
# ------------------------------------------------

# 9. Default primary key
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
