# PowerShell script to run migrations and import stylists using Docker
Write-Host "Running stylist migrations and importing initial data..."

# Run migrations for the stylists app
Write-Host "Running migrations for stylists app..."
docker-compose exec -T django python manage.py migrate stylists
if ($LASTEXITCODE -ne 0) {
    Write-Host "Migration failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

# Import the stylists from the mock data
Write-Host "Importing stylists from mock data..."
docker-compose exec -T django python manage.py import_stylists
if ($LASTEXITCODE -ne 0) {
    Write-Host "Stylist import failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "Successfully migrated and imported stylists data!" -ForegroundColor Green
