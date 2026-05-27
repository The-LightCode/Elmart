#!/usr/bin/env bash
# exit on error
set -o errexit

# Your existing build commands (like collecting static files)
python -m pip install --upgrade pip
python manage.py collectstatic --no-input

# 📍 ADD THESE THREE LINES AT THE BOTTOM TO BYPASS THE SHELL:
echo "Running Database Migrations..."
python manage.py migrate

echo "Creating Admin Superuser..."
python manage.py createsuperuser --noinput || true
