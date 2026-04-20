import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Elmarrt.settings') # Match your settings folder name
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()
username = 'admin'
email = 'admin@elmart.com'
password = 'YourSecretPassword123' # Change this!

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, email, password)
    print(f"Superuser '{username}' created successfully!")
else:
    print(f"Superuser '{username}' already exists.")
