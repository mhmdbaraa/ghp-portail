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

# Assign roles based on user's built-in role
for user in users:
    print(f'\nProcessing user: {user.username} (role: {user.role})')
    
    # Clear existing roles
    user.roles.clear()
    
    # Assign role based on built-in role
    if user.role == 'admin' or user.is_superuser:
        # Admin users get all permissions through their built-in role
        print(f'  → Admin user, using built-in permissions')
    elif user.role == 'manager':
        # Find manager role
        manager_role = roles.filter(name__icontains='manager').first()
        if manager_role:
            user.roles.add(manager_role)
            print(f'  ✓ Assigned role: {manager_role.name}')
        else:
            print(f'  → No manager role found')
    elif user.role == 'developer':
        # Find developer role
        dev_role = roles.filter(name__icontains='developer').first()
        if dev_role:
            user.roles.add(dev_role)
            print(f'  ✓ Assigned role: {dev_role.name}')
        else:
            print(f'  → No developer role found')
    elif user.role == 'PROJECT_USER':
        # Find project user role
        project_user_role = roles.filter(name__icontains='PROJECT_USER').first()
        if project_user_role:
            user.roles.add(project_user_role)
            print(f'  ✓ Assigned role: {project_user_role.name}')
        else:
            print(f'  → No PROJECT_USER role found')
    else:
        # Default to PROJECT_USER role for other users
        project_user_role = roles.filter(name__icontains='PROJECT_USER').first()
        if project_user_role:
            user.roles.add(project_user_role)
            print(f'  ✓ Assigned default role: {project_user_role.name}')
    
    # Show final roles
    user_roles = [r.name for r in user.roles.all()]
    print(f'  Final roles: {user_roles}')

print('\nUser role assignment completed!')
