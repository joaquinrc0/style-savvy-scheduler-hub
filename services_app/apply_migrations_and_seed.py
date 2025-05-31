#!/usr/bin/env python
import os
import sys
import subprocess
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'services_app.settings')
django.setup()

def run_command(command):
    """Run a command and print its output."""
    print(f"Running: {command}")
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Command failed with exit code {result.returncode}")
        print(f"Error: {result.stderr}")
        sys.exit(1)
    print(result.stdout)
    return result.stdout

def main():
    """Run migrations and seed the database."""
    print("Starting database migrations and seeding...")
    
    # Migrate the stylists app
    run_command('python manage.py migrate stylists')
    
    # Import stylists from mock data
    run_command('python manage.py import_stylists')
    
    print("Database migrations and seeding completed successfully!")

if __name__ == "__main__":
    main()
