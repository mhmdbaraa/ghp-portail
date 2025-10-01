#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'projecttracker.settings')
django.setup()

from authentication.models import User, Role

# Get all users and roles
users = User.objects.all()
roles = Role.objects.all()

print(f'Found {users.count()} users and {roles.count()} roles')

# Assign PROJECT_USER role to all users who don't have admin role
for user in users:
    print(f'\nProcessing user: {user.username} (role: {user.role})')
    
    # Clear existing roles
    user.roles.clear()
    
    # Assign role based on built-in role
    if user.is_superuser or user.role == 'admin':
        print(f'  → Admin/superuser, using built-in permissions')
    else:
        # Find PROJECT_USER role
        project_user_role = roles.filter(name='PROJECT_USER').first()
        if project_user_role:
            user.roles.add(project_user_role)
            print(f'  ✓ Assigned role: {project_user_role.name}')
        else:
            print(f'  → No PROJECT_USER role found')
    
    # Show final roles
    user_roles = [r.name for r in user.roles.all()]
    print(f'  Final roles: {user_roles}')

print('\nUser role assignment completed!')
