# Stylist Data Migration Guide

This guide explains how to migrate the stylist data from mock data to the database.

## Prerequisites

- Python 3.10 or higher
- Django and other dependencies installed in a virtual environment

## Steps to Migrate Stylist Data

### 1. Create and activate a virtual environment (if not already done)

```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS/Linux
python -m venv venv
source venv/bin/activate
```

### 2. Install dependencies

```bash
cd services_app
pip install -r requirements.txt
```

### 3. Run migrations for the stylists app

```bash
cd services_app
python manage.py migrate stylists
```

### 4. Import stylists from mock data

```bash
cd services_app
python manage.py import_stylists
```

### 5. Alternative: Run the helper script

We've provided a helper script that combines steps 3 and 4:

```bash
cd services_app
python migrate_and_seed.py
```

## Verifying the Migration

After running the migrations and importing the data, you can verify that the stylists were properly imported by:

1. Starting the Django development server:
   ```bash
   python manage.py runserver
   ```

2. Accessing the API endpoint in a browser:
   ```
   http://localhost:8000/django/api/stylists/
   ```

3. Or using the Django admin interface:
   ```
   http://localhost:8000/django/admin/stylists/stylist/
   ```

## Troubleshooting

If you encounter any issues:

- Ensure your virtual environment is activated
- Check that all requirements are installed
- Make sure the Django server is properly configured
- Verify that the database settings are correct
