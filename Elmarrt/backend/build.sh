#!/usr/bin/env bash
# exit on error
set -o errexit

# DYNAMIC PATH: Check if we are in root or already inside the subfolder
if [ -d "Elmarrt/backend" ]; then
    cd Elmarrt/backend
elif [ -d "backend" ]; then
    cd backend
fi

# 1. Install dependencies
pip install -r requirements.txt

# 2. Upgrade pip
python -m pip install --upgrade pip

# 3. Collect layout files smoothly
python manage.py collectstatic --no-input

