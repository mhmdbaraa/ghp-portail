from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from authentication.models import Role, Permission

User = get_user_model()


class Command(BaseCommand):
    help = 'Create PROJECT_MANAGER and PROJECT_USER roles with permissions'

    def handle(self, *args, **kwargs):
        # Create permissions for projects
        permissions_data = [
            {
                'name': 'view_projects',
                'code': 'view_projects',
                'description': 'Can view projects and tasks'
            },
            {
                'name': 'create_project',
                'code': 'create_project',
                'description': 'Can create new projects'
            },
            {
                'name': 'edit_project',
                'code': 'edit_project',
                'description': 'Can edit existing projects'
            },
            {
                'name': 'delete_project',
                'code': 'delete_project',
                'description': 'Can delete projects'
            },
            {
                'name': 'manage_tasks',
                'code': 'manage_tasks',
                'description': 'Can create, edit, and delete tasks'
            },
            {
                'name': 'view_calendar',
                'code': 'view_calendar',
                'description': 'Can view project calendar'
            },
            {
                'name': 'manage_team',
                'code': 'manage_team',
                'description': 'Can add/remove team members'
            },
        ]

        created_permissions = []
        for perm_data in permissions_data:
            permission, created = Permission.objects.get_or_create(
                code=perm_data['code'],
                defaults={
                    'name': perm_data['name'],
                    'description': perm_data['description']
                }
            )
            created_permissions.append(permission)
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created permission: {permission.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Permission already exists: {permission.name}')
                )

        # Create PROJECT_MANAGER role
        project_manager_role, created = Role.objects.get_or_create(
            name='PROJECT_MANAGER',
            defaults={
                'description': 'Project Manager - Full access to projects, tasks, and calendar'
            }
        )
        
        if created:
            # Assign all permissions to PROJECT_MANAGER
            project_manager_role.permissions.set(created_permissions)
            self.stdout.write(
                self.style.SUCCESS(f'✓ Created role: PROJECT_MANAGER with all permissions')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'Role already exists: PROJECT_MANAGER')
            )

        # Create PROJECT_USER role
        project_user_role, created = Role.objects.get_or_create(
            name='PROJECT_USER',
            defaults={
                'description': 'Project User - Read-only access to projects, tasks, and calendar'
            }
        )
        
        if created:
            # Assign only view permissions to PROJECT_USER
            view_permissions = [p for p in created_permissions if 'view' in p.code]
            project_user_role.permissions.set(view_permissions)
            self.stdout.write(
                self.style.SUCCESS(f'✓ Created role: PROJECT_USER with view-only permissions')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'Role already exists: PROJECT_USER')
            )

        # Display summary
        self.stdout.write(
            self.style.SUCCESS('\n=== Roles and Permissions Summary ===')
        )
        self.stdout.write(
            self.style.SUCCESS(f'\nPROJECT_MANAGER permissions:')
        )
        for perm in project_manager_role.permissions.all():
            self.stdout.write(f'  ✓ {perm.name} ({perm.code})')
        
        self.stdout.write(
            self.style.SUCCESS(f'\nPROJECT_USER permissions:')
        )
        for perm in project_user_role.permissions.all():
            self.stdout.write(f'  ✓ {perm.name} ({perm.code})')

        # Count users with these roles
        pm_count = User.objects.filter(role='PROJECT_MANAGER').count()
        pu_count = User.objects.filter(role='PROJECT_USER').count()
        
        self.stdout.write(
            self.style.SUCCESS(f'\n=== Current Users ===')
        )
        self.stdout.write(f'PROJECT_MANAGER users: {pm_count}')
        self.stdout.write(f'PROJECT_USER users: {pu_count}')
        
        if pm_count == 0 and pu_count == 0:
            self.stdout.write(
                self.style.WARNING('\n⚠️ No users have project roles assigned yet!')
            )
            self.stdout.write(
                self.style.WARNING('Run: python manage.py assign_project_roles')
            )
