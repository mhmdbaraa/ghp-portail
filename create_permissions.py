#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'projecttracker.settings')
django.setup()

from authentication.models import Permission

# Create permissions for different categories
permissions_data = [
    {'name': 'Voir les utilisateurs', 'codename': 'user:view', 'description': 'Permet de voir la liste des utilisateurs', 'category': 'users'},
    {'name': 'Créer des utilisateurs', 'codename': 'user:create', 'description': 'Permet de créer de nouveaux utilisateurs', 'category': 'users'},
    {'name': 'Modifier les utilisateurs', 'codename': 'user:edit', 'description': 'Permet de modifier les informations des utilisateurs', 'category': 'users'},
    {'name': 'Supprimer les utilisateurs', 'codename': 'user:delete', 'description': 'Permet de supprimer des utilisateurs', 'category': 'users'},
    {'name': 'Gérer les utilisateurs', 'codename': 'user:manage', 'description': 'Permet de gérer complètement les utilisateurs', 'category': 'users'},
    {'name': 'Voir le calendrier', 'codename': 'calendar:view', 'description': 'Permet de voir le calendrier', 'category': 'calendar'},
    {'name': 'Créer des événements', 'codename': 'calendar:create', 'description': 'Permet de créer des événements dans le calendrier', 'category': 'calendar'},
    {'name': 'Modifier les événements', 'codename': 'calendar:edit', 'description': 'Permet de modifier les événements du calendrier', 'category': 'calendar'},
    {'name': 'Supprimer les événements', 'codename': 'calendar:delete', 'description': 'Permet de supprimer des événements du calendrier', 'category': 'calendar'},
    {'name': 'Exporter le calendrier', 'codename': 'calendar:export', 'description': 'Permet d\'exporter le calendrier', 'category': 'calendar'},
    {'name': 'Voir les équipes', 'codename': 'team:view', 'description': 'Permet de voir la liste des équipes', 'category': 'teams'},
    {'name': 'Gérer les équipes', 'codename': 'team:manage', 'description': 'Permet de gérer les équipes', 'category': 'teams'},
    {'name': 'Voir les rapports', 'codename': 'report:view', 'description': 'Permet de voir les rapports', 'category': 'reports'},
    {'name': 'Gérer les paramètres', 'codename': 'settings:manage', 'description': 'Permet de gérer les paramètres du système', 'category': 'settings'},
    {'name': 'Administration système', 'codename': 'system:admin', 'description': 'Accès total au système', 'category': 'settings'},
]

print('Creating permissions...')
for perm_data in permissions_data:
    perm, created = Permission.objects.get_or_create(
        codename=perm_data['codename'],
        defaults=perm_data
    )
    if created:
        print(f'✓ Created permission: {perm.name}')
    else:
        print(f'→ Permission already exists: {perm.name}')

print(f'\nTotal permissions: {Permission.objects.count()}')
print('Categories:', list(Permission.objects.values_list('category', flat=True).distinct()))
