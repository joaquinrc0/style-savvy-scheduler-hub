# Dockerfile
# 1. Usamos python:3.10-slim
FROM python:3.10-slim

# 2. No compilamos pyc y logs sin buffer
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# 3. Directorio de trabajo
WORKDIR /app

# 4. Instalamos requisitos
COPY services_app/requirements.txt /app/
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# 5. Copiamos el código (incluye tu db.sqlite3 dentro de services_app/)
COPY services_app/ /app/

# 6. Forzamos en settings.py el uso de SQLite
ENV USE_SQLITE=true

# 7. Exponemos el puerto (opcional)
EXPOSE 8000

# 8. Arrancamos con Gunicorn apuntando al módulo WSGI
CMD ["gunicorn", "services_app.wsgi:application", "--bind", "0.0.0.0:8000"]
