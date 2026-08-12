#!/usr/bin/env bash
# exit on error
set -o errexit

# Step into the folder where manage.py and requirements.txt live
cd Elmarrt/backend

# 1. Install dependencies
pip install -r requirements.txt

# 2. Upgrade pip
python -m pip install --upgrade pip

# 3. Collect layout files smoothly
python manage.py collectstatic --no-input

