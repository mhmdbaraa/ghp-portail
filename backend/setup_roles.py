#!/usr/bin/env python
"""
Simple script to create project roles and permissions
"""
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'projecttracker.settings')

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    django.setup()
    
    from authentication.models import Role, Permission, User
    
    def create_roles():
        print("🚀 Creating project roles and permissions...")
        
        # Create permissions
        permissions_data = [
            {'name': 'View Projects', 'codename': 'view_project', 'description': 'Can view projects', 'category': 'projects'},
            {'name': 'Create Projects', 'codename': 'add_project', 'description': 'Can create projects', 'category': 'projects'},
            {'name': 'Edit Projects', 'codename': 'change_project', 'description': 'Can edit projects', 'category': 'projects'},
            {'name': 'Delete Projects', 'codename': 'delete_project', 'description': 'Can delete projects', 'category': 'projects'},
            {'name': 'View Tasks', 'codename': 'view_task', 'description': 'Can view tasks', 'category': 'tasks'},
            {'name': 'Create Tasks', 'codename': 'add_task', 'description': 'Can create tasks', 'category': 'tasks'},
            {'name': 'Edit Tasks', 'codename': 'change_task', 'description': 'Can edit tasks', 'category': 'tasks'},
            {'name': 'Delete Tasks', 'codename': 'delete_task', 'description': 'Can delete tasks', 'category': 'tasks'},
            {'name': 'View Calendar', 'codename': 'view_calendar', 'description': 'Can view calendar', 'category': 'projects'},
            {'name': 'Manage Calendar', 'codename': 'manage_calendar', 'description': 'Can manage calendar', 'category': 'projects'},
        ]
        
        created_permissions = []
        for perm_data in permissions_data:
            permission, created = Permission.objects.get_or_create(
                codename=perm_data['codename'],
                defaults=perm_data
            )
            if created:
                print(f"✓ Created permission: {permission.name}")
            created_permissions.append(permission)
        
        # Create PROJECT_MANAGER role
        manager_role, created = Role.objects.get_or_create(
            name='PROJECT_MANAGER',
            defaults={
                'description': 'Full access to projects, tasks, and calendar',
                'is_system': True
            }
        )
        if created:
            print(f"✓ Created role: {manager_role.name}")
        
        # Assign all permissions to PROJECT_MANAGER
        manager_role.permissions.set(created_permissions)
        print(f"✓ Assigned {len(created_permissions)} permissions to PROJECT_MANAGER")
        
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
        
        # Assign view-only permissions to PROJECT_USER
        view_permissions = [p for p in created_permissions if p.codename in ['view_project', 'view_task', 'view_calendar']]
        user_role.permissions.set(view_permissions)
        print(f"✓ Assigned {len(view_permissions)} permissions to PROJECT_USER")
        
        print("\n✅ Roles and permissions created successfully!")
        return manager_role, user_role
    
    if __name__ == '__main__':
        create_roles()
        
except Exception as e:
    print(f"❌ Error: {e}")
    print("Make sure you're in the backend directory and Django is properly configured.")
