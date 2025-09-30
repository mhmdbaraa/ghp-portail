from django.core.management.base import BaseCommand
from authentication.models import User

class Command(BaseCommand):
    help = 'Fix superuser roles to admin'

    def handle(self, *args, **options):
        self.stdout.write('Fixing superuser roles...')
        
        # Fix all superusers
        fixed_count = User.fix_superuser_roles()
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully fixed {fixed_count} superuser(s)')
        )
        
        # Show current superusers
        superusers = User.objects.filter(is_superuser=True)
        for user in superusers:
            self.stdout.write(f'  - {user.username}: role={user.role}, is_superuser={user.is_superuser}')

