#!/usr/bin/env python
"""
Script to create PROJECT_MANAGER and PROJECT_USER roles with their permissions
"""
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'projecttracker.settings')
django.setup()

from authentication.models import Role, Permission
from django.contrib.auth import get_user_model

User = get_user_model()

def create_project_permissions():
    """Create permissions for project management"""
    permissions_data = [
        # Project permissions
        {
            'name': 'View Projects',
            'codename': 'view_project',
            'description': 'Can view projects and project details',
            'category': 'projects'
        },
        {
            'name': 'Create Projects',
            'codename': 'add_project',
            'description': 'Can create new projects',
            'category': 'projects'
        },
        {
            'name': 'Edit Projects',
            'codename': 'change_project',
            'description': 'Can edit existing projects',
            'category': 'projects'
        },
        {
            'name': 'Delete Projects',
            'codename': 'delete_project',
            'description': 'Can delete projects',
            'category': 'projects'
        },
        # Task permissions
        {
            'name': 'View Tasks',
            'codename': 'view_task',
            'description': 'Can view tasks and task details',
            'category': 'tasks'
        },
        {
            'name': 'Create Tasks',
            'codename': 'add_task',
            'description': 'Can create new tasks',
            'category': 'tasks'
        },
        {
            'name': 'Edit Tasks',
            'codename': 'change_task',
            'description': 'Can edit existing tasks',
            'category': 'tasks'
        },
        {
            'name': 'Delete Tasks',
            'codename': 'delete_task',
            'description': 'Can delete tasks',
            'category': 'tasks'
        },
        # Calendar permissions
        {
            'name': 'View Calendar',
            'codename': 'view_calendar',
            'description': 'Can view project calendar',
            'category': 'projects'
        },
        {
            'name': 'Manage Calendar',
            'codename': 'manage_calendar',
            'description': 'Can manage calendar events and scheduling',
            'category': 'projects'
        }
    ]
    
    created_permissions = []
    for perm_data in permissions_data:
        permission, created = Permission.objects.get_or_create(
            codename=perm_data['codename'],
            defaults=perm_data
        )
        if created:
            print(f"✓ Created permission: {permission.name}")
        else:
            print(f"→ Permission already exists: {permission.name}")
        created_permissions.append(permission)
    
    return created_permissions

def create_project_roles():
    """Create PROJECT_MANAGER and PROJECT_USER roles"""
    
    # Create permissions first
    permissions = create_project_permissions()
    
    # Create PROJECT_MANAGER role
    manager_role, created = Role.objects.get_or_create(
        name='PROJECT_MANAGER',
        defaults={
            'description': 'Full access to projects, tasks, and calendar management',
            'is_system': True
        }
    )
    
    if created:
        print(f"✓ Created role: {manager_role.name}")
    else:
        print(f"→ Role already exists: {manager_role.name}")
    
    # Assign all permissions to PROJECT_MANAGER
    manager_role.permissions.set(permissions)
    print(f"✓ Assigned {permissions.count()} permissions to {manager_role.name}")
    
    # Create PROJECT_USER role
    user_role, created = Role.objects.get_or_create(
        name='PROJECT_USER',
        defaults={
            'description': 'View-only access to projects and tasks',
            'is_system': True
        }
    )
    
    if created:
        print(f"✓ Created role: {user_role.name}")
    else:
        print(f"→ Role already exists: {user_role.name}")
    
    # Assign view-only permissions to PROJECT_USER
    view_permissions = permissions.filter(
        codename__in=['view_project', 'view_task', 'view_calendar']
    )
    user_role.permissions.set(view_permissions)
    print(f"✓ Assigned {view_permissions.count()} permissions to {user_role.name}")
    
    return manager_role, user_role

def assign_role_to_user(username, role_name):
    """Assign a role to a specific user"""
    try:
        user = User.objects.get(username=username)
        role = Role.objects.get(name=role_name)
        
        # Add role to user (assuming you have a many-to-many relationship)
        # This depends on your User model structure
        if hasattr(user, 'roles'):
            user.roles.add(role)
            print(f"✓ Assigned role {role_name} to user {username}")
        else:
            print(f"⚠ User model doesn't have roles field. Please check your User model.")
            
    except User.DoesNotExist:
        print(f"✗ User {username} not found")
    except Role.DoesNotExist:
        print(f"✗ Role {role_name} not found")

def main():
    print("🚀 Creating project roles and permissions...")
    print("=" * 50)
    
    # Create roles and permissions
    manager_role, user_role = create_project_roles()
    
    print("\n" + "=" * 50)
    print("📋 Summary:")
    print(f"• PROJECT_MANAGER: {manager_role.permissions.count()} permissions")
    print(f"• PROJECT_USER: {user_role.permissions.count()} permissions")
    
    print("\n✅ Roles and permissions created successfully!")
    print("\nTo assign roles to users, you can use:")
    print("python manage.py shell")
    print(">>> from authentication.models import User, Role")
    print(">>> user = User.objects.get(username='your_username')")
    print(">>> role = Role.objects.get(name='PROJECT_MANAGER')")
    print(">>> user.roles.add(role)")

if __name__ == '__main__':
    main()
