import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital_ai.settings')

import django
django.setup()

from accounts.models import User

passwords_to_try = [
    'Admin@12345',
    'Doctor@12345',
    'Patient@12345',
    'Password@123',
    'admin',
    'password',
    '123456',
    '12345678',
    'ihms@123',
    'Nikita@0305',
    'Admin@123',
    'Doctor@123',
    'Patient@123',
    'Root@123',
    'root',
]

print("--- Testing Passwords for Existing Users ---")
users = list(User.objects.all().order_by('role', 'username'))
print(f"Total Users Found: {len(users)}\n")
for u in users:
    found = None
    for p in passwords_to_try:
        if u.check_password(p):
            found = p
            break
    print(f"User: {u.username:22} | Role: {str(u.role):12} | Staff: {str(u.is_staff):5} | Email: {u.email:30} | Matched Password: {found}")
