from django.core.management.base import BaseCommand
from django.core.management import call_command
from authentication.models import Permission, Role
import json
import os


class Command(BaseCommand):
    help = 'Load initial permissions and roles data'

    def handle(self, *args, **options):
        self.stdout.write('Loading initial permissions and roles...')
        
        # Load permissions
        try:
            call_command('loaddata', 'authentication/fixtures/initial_permissions.json')
            self.stdout.write(
                self.style.SUCCESS('Successfully loaded initial permissions')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error loading permissions: {e}')
            )
        
        # Load roles
        try:
            call_command('loaddata', 'authentication/fixtures/initial_roles.json')
            self.stdout.write(
                self.style.SUCCESS('Successfully loaded initial roles')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error loading roles: {e}')
            )
        
        # Load role permissions
        try:
            call_command('loaddata', 'authentication/fixtures/role_permissions.json')
            self.stdout.write(
                self.style.SUCCESS('Successfully loaded role permissions')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error loading role permissions: {e}')
            )
        
        # Display summary
        permission_count = Permission.objects.count()
        role_count = Role.objects.count()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Data loaded successfully: {permission_count} permissions, {role_count} roles'
            )
        )
