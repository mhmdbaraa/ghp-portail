from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from authentication.models import DepartmentPermission, DEPARTMENT_CHOICES

User = get_user_model()


class Command(BaseCommand):
    help = 'Assign department permissions to users'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            help='Username to assign permissions to'
        )
        parser.add_argument(
            '--department',
            type=str,
            choices=[choice[0] for choice in DEPARTMENT_CHOICES],
            help='Department to assign permissions for'
        )
        parser.add_argument(
            '--permissions',
            type=str,
            nargs='+',
            choices=['view', 'edit', 'create', 'delete'],
            default=['view'],
            help='Permissions to assign (default: view)'
        )
        parser.add_argument(
            '--all-departments',
            action='store_true',
            help='Assign permissions for all departments'
        )
        parser.add_argument(
            '--list-users',
            action='store_true',
            help='List all users with their current department permissions'
        )

    def handle(self, *args, **options):
        if options['list_users']:
            self.list_users()
            return

        if not options['username']:
            self.stdout.write(
                self.style.ERROR('Username is required. Use --username <username>')
            )
            return

        try:
            user = User.objects.get(username=options['username'])
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'User "{options["username"]}" not found')
            )
            return

        departments = [options['department']] if options['department'] else [choice[0] for choice in DEPARTMENT_CHOICES]
        
        if options['all_departments']:
            departments = [choice[0] for choice in DEPARTMENT_CHOICES]

        for department in departments:
            self.assign_permissions(user, department, options['permissions'])

    def assign_permissions(self, user, department, permissions):
        """Assign permissions for a specific department"""
        perm, created = DepartmentPermission.objects.get_or_create(
            user=user,
            department=department,
            defaults={
                'can_view': 'view' in permissions,
                'can_edit': 'edit' in permissions,
                'can_create': 'create' in permissions,
                'can_delete': 'delete' in permissions,
            }
        )

        if not created:
            # Update existing permissions
            perm.can_view = 'view' in permissions
            perm.can_edit = 'edit' in permissions
            perm.can_create = 'create' in permissions
            perm.can_delete = 'delete' in permissions
            perm.save()

        action = 'Created' if created else 'Updated'
        self.stdout.write(
            self.style.SUCCESS(
                f'{action} permissions for {user.username} - {department}: {", ".join(permissions)}'
            )
        )

    def list_users(self):
        """List all users with their department permissions"""
        self.stdout.write(self.style.SUCCESS('Users and their department permissions:'))
        self.stdout.write('=' * 80)
        
        for user in User.objects.all().order_by('username'):
            self.stdout.write(f'\n{user.username} ({user.get_full_name()}) - Department: {user.department or "None"}')
            
            permissions = user.department_permissions.all()
            if permissions:
                for perm in permissions:
                    perms = []
                    if perm.can_view:
                        perms.append('view')
                    if perm.can_edit:
                        perms.append('edit')
                    if perm.can_create:
                        perms.append('create')
                    if perm.can_delete:
                        perms.append('delete')
                    
                    self.stdout.write(f'  - {perm.get_department_display()}: {", ".join(perms) if perms else "none"}')
            else:
                self.stdout.write('  - No additional department permissions')
