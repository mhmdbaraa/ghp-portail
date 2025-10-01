#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'projecttracker.settings')
django.setup()

from authentication.models import Permission, Role

# Get calendar permissions
calendar_permissions = Permission.objects.filter(category='calendar')
print(f'Found {calendar_permissions.count()} calendar permissions')

# Get all roles
roles = Role.objects.all()
print(f'Found {roles.count()} roles')

# Assign calendar permissions to all roles
for role in roles:
    print(f'\nProcessing role: {role.name}')
    
    # Add calendar permissions to this role
    for perm in calendar_permissions:
        if not role.permissions.filter(id=perm.id).exists():
            role.permissions.add(perm)
            print(f'  ✓ Added permission: {perm.name}')
        else:
            print(f'  → Permission already exists: {perm.name}')
    
    # Count total permissions for this role
    total_perms = role.permissions.count()
    calendar_perms = role.permissions.filter(category='calendar').count()
    print(f'  Role now has {total_perms} total permissions ({calendar_perms} calendar permissions)')

print('\nCalendar permissions assignment completed!')
