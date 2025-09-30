from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Assign PROJECT_MANAGER or PROJECT_USER roles to users'

    def add_arguments(self, parser):
        parser.add_argument(
            '--all-managers',
            action='store_true',
            help='Set all existing users as PROJECT_MANAGER'
        )
        parser.add_argument(
            '--all-users',
            action='store_true',
            help='Set all existing users as PROJECT_USER'
        )
        parser.add_argument(
            '--username',
            type=str,
            help='Username of the user to assign role'
        )
        parser.add_argument(
            '--role',
            type=str,
            choices=['PROJECT_MANAGER', 'PROJECT_USER'],
            help='Role to assign: PROJECT_MANAGER or PROJECT_USER'
        )

    def handle(self, *args, **options):
        if options['all_managers']:
            # Set all users as PROJECT_MANAGER
            users = User.objects.all()
            count = users.update(role='PROJECT_MANAGER')
            self.stdout.write(
                self.style.SUCCESS(f'✓ Assigned PROJECT_MANAGER role to {count} users')
            )
            
        elif options['all_users']:
            # Set all users as PROJECT_USER
            users = User.objects.all()
            count = users.update(role='PROJECT_USER')
            self.stdout.write(
                self.style.SUCCESS(f'✓ Assigned PROJECT_USER role to {count} users')
            )
            
        elif options['username'] and options['role']:
            # Assign specific role to specific user
            try:
                user = User.objects.get(username=options['username'])
                user.role = options['role']
                user.save()
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✓ Assigned {options["role"]} to user: {user.username} ({user.full_name})'
                    )
                )
            except User.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'✗ User not found: {options["username"]}')
                )
        else:
            # Interactive mode
            self.stdout.write(
                self.style.WARNING('No arguments provided. Showing current user roles:')
            )
            self.stdout.write('\n=== Current Users ===')
            
            for user in User.objects.all():
                role_display = user.role if user.role else 'No role'
                self.stdout.write(
                    f'{user.username:20} | {user.full_name:30} | Role: {role_display}'
                )
            
            self.stdout.write('\n=== Usage Examples ===')
            self.stdout.write('Set all users as managers:')
            self.stdout.write('  python manage.py assign_project_roles --all-managers')
            self.stdout.write('\nSet all users as users:')
            self.stdout.write('  python manage.py assign_project_roles --all-users')
            self.stdout.write('\nSet specific user:')
            self.stdout.write('  python manage.py assign_project_roles --username john --role PROJECT_MANAGER')
            
        # Display summary
        pm_count = User.objects.filter(role='PROJECT_MANAGER').count()
        pu_count = User.objects.filter(role='PROJECT_USER').count()
        no_role_count = User.objects.filter(role__isnull=True).count() + \
                       User.objects.filter(role='').count()
        
        self.stdout.write('\n=== Summary ===')
        self.stdout.write(f'PROJECT_MANAGER: {pm_count} users')
        self.stdout.write(f'PROJECT_USER: {pu_count} users')
        self.stdout.write(f'No project role: {no_role_count} users')
