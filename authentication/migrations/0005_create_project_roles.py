# Generated manually for creating project roles and permissions

from django.db import migrations
from django.db.models import Q


def create_project_roles_and_permissions(apps, schema_editor):
    """Create PROJECT_MANAGER and PROJECT_USER roles with their permissions"""
    Permission = apps.get_model('authentication', 'Permission')
    Role = apps.get_model('authentication', 'Role')
    
    # Create permissions
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
    
    # Create permissions
    created_permissions = []
    for perm_data in permissions_data:
        permission, created = Permission.objects.get_or_create(
            codename=perm_data['codename'],
            defaults=perm_data
        )
        created_permissions.append(permission)
    
    # Create PROJECT_MANAGER role
    manager_role, created = Role.objects.get_or_create(
        name='PROJECT_MANAGER',
        defaults={
            'description': 'Full access to projects, tasks, and calendar management',
            'is_system': True
        }
    )
    
    # Assign all permissions to PROJECT_MANAGER
    manager_role.permissions.set(created_permissions)
    
    # Create PROJECT_USER role
    user_role, created = Role.objects.get_or_create(
        name='PROJECT_USER',
        defaults={
            'description': 'View-only access to projects and tasks',
            'is_system': True
        }
    )
    
    # Assign view-only permissions to PROJECT_USER
    view_permissions = created_permissions[:3] + [created_permissions[4]] + [created_permissions[8]]  # view_project, add_project, change_project, view_task, view_calendar
    user_role.permissions.set(view_permissions)


def reverse_create_project_roles_and_permissions(apps, schema_editor):
    """Remove the created roles and permissions"""
    Permission = apps.get_model('authentication', 'Permission')
    Role = apps.get_model('authentication', 'Role')
    
    # Remove roles
    Role.objects.filter(name__in=['PROJECT_MANAGER', 'PROJECT_USER']).delete()
    
    # Remove permissions
    Permission.objects.filter(
        codename__in=[
            'view_project', 'add_project', 'change_project', 'delete_project',
            'view_task', 'add_task', 'change_task', 'delete_task',
            'view_calendar', 'manage_calendar'
        ]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0004_alter_user_join_date'),
    ]

    operations = [
        migrations.RunPython(
            create_project_roles_and_permissions,
            reverse_create_project_roles_and_permissions
        ),
    ]
