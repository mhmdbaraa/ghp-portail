from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from authentication.models import DepartmentPermission, DEPARTMENT_CHOICES

User = get_user_model()


class Command(BaseCommand):
    help = 'Setup default department permissions for existing users'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Reset all existing department permissions'
        )

    def handle(self, *args, **options):
        if options['reset']:
            self.stdout.write('Resetting all department permissions...')
            DepartmentPermission.objects.all().delete()

        self.stdout.write('Setting up department permissions...')
        
        # Get all users
        users = User.objects.all()
        
        for user in users:
            self.setup_user_permissions(user)
        
        self.stdout.write(
            self.style.SUCCESS(f'Department permissions setup completed for {users.count()} users')
        )

    def setup_user_permissions(self, user):
        """Setup default permissions for a user based on their department"""
        
        # Superusers and admins get access to all departments
        if user.is_superuser or user.role == 'admin':
            for department, _ in DEPARTMENT_CHOICES:
                DepartmentPermission.objects.get_or_create(
                    user=user,
                    department=department,
                    defaults={
                        'can_view': True,
                        'can_edit': True,
                        'can_create': True,
                        'can_delete': True,
                    }
                )
            self.stdout.write(f'  - {user.username}: Full access to all departments (admin)')
            return

        # Managers get view access to all departments, edit/create for their department
        if user.role == 'manager':
            for department, _ in DEPARTMENT_CHOICES:
                is_own_department = user.department == department
                DepartmentPermission.objects.get_or_create(
                    user=user,
                    department=department,
                    defaults={
                        'can_view': True,
                        'can_edit': is_own_department,
                        'can_create': is_own_department,
                        'can_delete': False,
                    }
                )
            self.stdout.write(f'  - {user.username}: View all, edit/create own department (manager)')
            return

        # Regular users get access only to their own department
        if user.department:
            DepartmentPermission.objects.get_or_create(
                user=user,
                department=user.department,
                defaults={
                    'can_view': True,
                    'can_edit': True,
                    'can_create': True,
                    'can_delete': False,
                }
            )
            self.stdout.write(f'  - {user.username}: Access to own department ({user.department})')
        else:
            self.stdout.write(f'  - {user.username}: No department assigned, no permissions created')
