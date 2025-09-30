from django.core.management.base import BaseCommand
from authentication.models import Permission, Role


class Command(BaseCommand):
    help = 'Initialize default permissions and roles'

    def handle(self, *args, **options):
        self.stdout.write('Creating default permissions...')
        
        # Create default permissions
        permissions_data = [
            # User permissions
            {'name': 'Can view user', 'codename': 'view_user', 'description': 'Peut voir les informations des utilisateurs', 'category': 'users'},
            {'name': 'Can add user', 'codename': 'add_user', 'description': 'Peut ajouter de nouveaux utilisateurs', 'category': 'users'},
            {'name': 'Can change user', 'codename': 'change_user', 'description': 'Peut modifier les informations des utilisateurs', 'category': 'users'},
            {'name': 'Can delete user', 'codename': 'delete_user', 'description': 'Peut supprimer des utilisateurs', 'category': 'users'},
            
            # Project permissions
            {'name': 'Can view project', 'codename': 'view_project', 'description': 'Peut voir les projets', 'category': 'projects'},
            {'name': 'Can add project', 'codename': 'add_project', 'description': 'Peut créer de nouveaux projets', 'category': 'projects'},
            {'name': 'Can change project', 'codename': 'change_project', 'description': 'Peut modifier les projets', 'category': 'projects'},
            {'name': 'Can delete project', 'codename': 'delete_project', 'description': 'Peut supprimer des projets', 'category': 'projects'},
            
            # Task permissions
            {'name': 'Can view task', 'codename': 'view_task', 'description': 'Peut voir les tâches', 'category': 'tasks'},
            {'name': 'Can add task', 'codename': 'add_task', 'description': 'Peut créer de nouvelles tâches', 'category': 'tasks'},
            {'name': 'Can change task', 'codename': 'change_task', 'description': 'Peut modifier les tâches', 'category': 'tasks'},
            {'name': 'Can delete task', 'codename': 'delete_task', 'description': 'Peut supprimer des tâches', 'category': 'tasks'},
            
            # Team permissions
            {'name': 'Can view team', 'codename': 'view_team', 'description': 'Peut voir les équipes', 'category': 'teams'},
            {'name': 'Can manage team', 'codename': 'manage_team', 'description': 'Peut gérer les équipes', 'category': 'teams'},
            
            # Report permissions
            {'name': 'Can view report', 'codename': 'view_report', 'description': 'Peut voir les rapports', 'category': 'reports'},
            {'name': 'Can generate report', 'codename': 'generate_report', 'description': 'Peut générer des rapports', 'category': 'reports'},
            
            # Settings permissions
            {'name': 'Can view settings', 'codename': 'view_settings', 'description': 'Peut voir les paramètres', 'category': 'settings'},
            {'name': 'Can change settings', 'codename': 'change_settings', 'description': 'Peut modifier les paramètres', 'category': 'settings'},
        ]
        
        created_permissions = []
        for perm_data in permissions_data:
            permission, created = Permission.objects.get_or_create(
                codename=perm_data['codename'],
                defaults=perm_data
            )
            if created:
                created_permissions.append(permission)
                self.stdout.write(f'  Created permission: {permission.name}')
            else:
                self.stdout.write(f'  Permission already exists: {permission.name}')
        
        self.stdout.write(f'Created {len(created_permissions)} new permissions')
        
        # Create default roles
        self.stdout.write('Creating default roles...')
        
        roles_data = [
            {
                'name': 'Administrateur',
                'description': 'Accès complet au système',
                'is_system': True,
                'permissions': [p.codename for p in Permission.objects.all()]
            },
            {
                'name': 'Manager',
                'description': 'Gestion des projets et équipes',
                'is_system': True,
                'permissions': [
                    'view_user', 'view_project', 'add_project', 'change_project', 'delete_project',
                    'view_task', 'add_task', 'change_task', 'delete_task',
                    'view_team', 'manage_team', 'view_report', 'generate_report'
                ]
            },
            {
                'name': 'Développeur',
                'description': 'Développement et maintenance',
                'is_system': True,
                'permissions': [
                    'view_project', 'view_task', 'add_task', 'change_task', 'view_team'
                ]
            },
            {
                'name': 'Designer',
                'description': 'Design et interface utilisateur',
                'is_system': True,
                'permissions': [
                    'view_project', 'view_task', 'add_task', 'change_task', 'view_team'
                ]
            },
            {
                'name': 'Testeur',
                'description': 'Tests et qualité',
                'is_system': True,
                'permissions': [
                    'view_project', 'view_task', 'change_task', 'view_team'
                ]
            },
            {
                'name': 'Utilisateur',
                'description': 'Utilisateur standard',
                'is_system': True,
                'permissions': [
                    'view_project', 'view_task', 'view_team'
                ]
            }
        ]
        
        created_roles = []
        for role_data in roles_data:
            permissions = role_data.pop('permissions')
            role, created = Role.objects.get_or_create(
                name=role_data['name'],
                defaults=role_data
            )
            
            if created:
                # Assign permissions to role
                role_permissions = Permission.objects.filter(codename__in=permissions)
                role.permissions.set(role_permissions)
                created_roles.append(role)
                self.stdout.write(f'  Created role: {role.name} with {role_permissions.count()} permissions')
            else:
                self.stdout.write(f'  Role already exists: {role.name}')
        
        self.stdout.write(f'Created {len(created_roles)} new roles')
        self.stdout.write(self.style.SUCCESS('Successfully initialized permissions and roles!'))
