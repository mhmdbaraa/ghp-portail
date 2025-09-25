#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'projecttracker.settings')
django.setup()

from authentication.models import Permission, Role

def check_and_create_data():
    print("=== Vérification des données ===")
    
    # Vérifier les permissions
    permissions_count = Permission.objects.count()
    print(f"Nombre de permissions: {permissions_count}")
    
    if permissions_count == 0:
        print("Création des permissions...")
        create_permissions()
    else:
        print("Permissions déjà existantes")
        for perm in Permission.objects.all()[:5]:
            print(f"  - {perm.name} ({perm.codename})")
    
    # Vérifier les rôles
    roles_count = Role.objects.count()
    print(f"\nNombre de rôles: {roles_count}")
    
    if roles_count == 0:
        print("Création des rôles...")
        create_roles()
    else:
        print("Rôles déjà existants")
        for role in Role.objects.all():
            print(f"  - {role.name} ({role.permissions.count()} permissions)")

def create_permissions():
    """Créer les permissions par défaut"""
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
    
    created_count = 0
    for perm_data in permissions_data:
        permission, created = Permission.objects.get_or_create(
            codename=perm_data['codename'],
            defaults=perm_data
        )
        if created:
            created_count += 1
            print(f"  ✓ Créé: {permission.name}")
    
    print(f"Créé {created_count} nouvelles permissions")

def create_roles():
    """Créer les rôles par défaut"""
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
    
    created_count = 0
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
            created_count += 1
            print(f"  ✓ Créé: {role.name} avec {role_permissions.count()} permissions")
    
    print(f"Créé {created_count} nouveaux rôles")

if __name__ == "__main__":
    check_and_create_data()
    print("\n=== Terminé ===")
