from django.apps import AppConfig


class AuthenticationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'authentication'
    
    def ready(self):
        """Initialize roles and permissions when the app is ready"""
        try:
            from .models import Role, Permission
            from django.db import transaction
            
            # Only create if they don't exist
            if not Role.objects.filter(name='PROJECT_MANAGER').exists():
                self.create_initial_roles()
        except Exception as e:
            # Ignore errors during initial setup
            pass
    
    def create_initial_roles(self):
        """Create initial roles and permissions"""
        from .models import Role, Permission
        
        with transaction.atomic():
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
                created_permissions.append(permission)
            
            # Create PROJECT_MANAGER role
            manager_role, created = Role.objects.get_or_create(
                name='PROJECT_MANAGER',
                defaults={
                    'description': 'Full access to projects, tasks, and calendar',
                    'is_system': True
                }
            )
            manager_role.permissions.set(created_permissions)
            
            # Create PROJECT_USER role
            user_role, created = Role.objects.get_or_create(
                name='PROJECT_USER',
                defaults={
                    'description': 'View-only access to projects and tasks',
                    'is_system': True
                }
            )
            view_permissions = [p for p in created_permissions if p.codename in ['view_project', 'view_task', 'view_calendar']]
            user_role.permissions.set(view_permissions)