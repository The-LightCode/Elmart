#!/usr/bin/env bash
# exit on error
set -o errexit

# 1. Install all dependencies from your text file
pip install -r requirements.txt

# 2. Upgrade the installer and collect the layout files
python -m pip install --upgrade pip
python Elmarrt/backend/manage.py collectstatic --no-input
