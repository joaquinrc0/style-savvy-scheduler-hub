# Dockerfile
FROM python:3.10-slim

# No generar archivos .pyc y forzar la salida por consola
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Instala git (para tu webhook) y docker CLI
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      git \
      docker.io && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia e instala dependencias
COPY services_app/requirements.txt /app/
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copia el código de la aplicación
COPY services_app/ /app/

# Variable de entorno opcional (si usas SQLite para desarrollo)
ENV USE_SQLITE=true

EXPOSE 8000

CMD ["gunicorn", "services_app.wsgi:application", "--bind", "0.0.0.0:8000"]
