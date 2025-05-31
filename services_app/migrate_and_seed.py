#!/usr/bin/env python
"""
This script runs migrations for the stylists app and imports initial stylist data.
To use this script:
1. Make sure Django is installed (pip install -r requirements.txt)
2. Run this script from the services_app directory
"""
import os
import sys
import subprocess

def run_command(command):
    """Run a shell command and print its output."""
    print(f"Running: {command}")
    process = subprocess.Popen(
        command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT
    )
    for line in iter(process.stdout.readline, b''):
        print(line.decode().strip())
    process.stdout.close()
    return process.wait()

def main():
    """Run migrations and seed database with initial stylist data."""
    print("Running migrations for stylists app...")
    exit_code = run_command('python manage.py migrate stylists')
    if exit_code != 0:
        print("Failed to run migrations. Make sure Django is installed correctly.")
        sys.exit(1)
    
    print("\nImporting initial stylist data...")
    exit_code = run_command('python manage.py import_stylists')
    if exit_code != 0:
        print("Failed to import stylists. Check the import_stylists command.")
        sys.exit(1)
    
    print("\nMigrations and data import completed successfully!")

if __name__ == "__main__":
    main()
