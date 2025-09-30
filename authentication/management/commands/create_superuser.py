from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()


class Command(BaseCommand):
    help = 'Create a superuser with all permissions'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            default='admin',
            help='Username for the superuser (default: admin)'
        )
        parser.add_argument(
            '--email',
            type=str,
            default='admin@example.com',
            help='Email for the superuser (default: admin@example.com)'
        )
        parser.add_argument(
            '--password',
            type=str,
            default='admin123',
            help='Password for the superuser (default: admin123)'
        )
        parser.add_argument(
            '--first-name',
            type=str,
            default='Super',
            help='First name for the superuser (default: Super)'
        )
        parser.add_argument(
            '--last-name',
            type=str,
            default='Admin',
            help='Last name for the superuser (default: Admin)'
        )

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']

        try:
            with transaction.atomic():
                # Check if user already exists
                if User.objects.filter(username=username).exists():
                    self.stdout.write(
                        self.style.WARNING(f'User "{username}" already exists. Updating...')
                    )
                    user = User.objects.get(username=username)
                    user.email = email
                    user.first_name = first_name
                    user.last_name = last_name
                    user.role = 'admin'
                    user.status = 'active'
                    user.is_staff = True
                    user.is_superuser = True
                    user.is_active = True
                    user.set_password(password)
                    user.save()
                else:
                    # Create new superuser
                    user = User.objects.create_user(
                        username=username,
                        email=email,
                        password=password,
                        first_name=first_name,
                        last_name=last_name,
                        role='admin',
                        status='active',
                        is_staff=True,
                        is_superuser=True,
                        is_active=True
                    )

                self.stdout.write(
                    self.style.SUCCESS(f'✓ Superuser "{username}" created/updated successfully!')
                )
                self.stdout.write(
                    self.style.SUCCESS(f'  Username: {username}')
                )
                self.stdout.write(
                    self.style.SUCCESS(f'  Email: {email}')
                )
                self.stdout.write(
                    self.style.SUCCESS(f'  Password: {password}')
                )
                self.stdout.write(
                    self.style.SUCCESS(f'  Role: admin (full permissions)')
                )
                self.stdout.write(
                    self.style.SUCCESS(f'  Status: active')
                )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating superuser: {e}')
            )

