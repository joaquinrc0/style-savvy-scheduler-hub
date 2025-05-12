# Dockerfile
FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      git \
      docker.io \
      docker-compose && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY services_app/requirements.txt /app/
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY services_app/ /app/

ENV USE_SQLITE=true

EXPOSE 8000

CMD ["gunicorn", "services_app.wsgi:application", "--bind", "0.0.0.0:8000"]
