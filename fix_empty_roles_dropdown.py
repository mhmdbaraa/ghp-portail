#!/usr/bin/env python
"""
Fix empty roles dropdown in user creation form
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'projecttracker.settings_production')
django.setup()

from django.contrib.auth import get_user_model
from django.db import connection
from django.test import Client

def fix_empty_roles_dropdown():
    print("🔧 Correction du dropdown des rôles vide...")
    print("=" * 50)
    
    try:
        # 1. Check roles in database
        print("1️⃣ Vérification des rôles dans la base de données...")
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, name, display_name, is_active FROM custom_roles")
            roles = cursor.fetchall()
            print(f"   📊 Rôles trouvés: {len(roles)}")
            
            for role in roles:
                print(f"   📋 ID: {role[0]} - Nom: {role[1]} - Display: {role[2]} - Actif: {role[3]}")
        
        # 2. Check Django Role model
        print("\n2️⃣ Vérification du modèle Django Role...")
        try:
            from authentication.models import Role
            
            roles = Role.objects.all()
            print(f"   📊 Rôles Django: {roles.count()}")
            
            for role in roles:
                display_name = getattr(role, 'display_name', 'N/A')
                print(f"   📋 {role.name} - Display: {display_name} - Actif: {role.is_active}")
                
        except Exception as e:
            print(f"   ❌ Erreur modèle Django: {e}")
        
        # 3. Test API endpoint directly
        print("\n3️⃣ Test de l'endpoint API des rôles...")
        try:
            client = Client()
            response = client.get('/api/authentication/roles/')
            print(f"   📊 Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   📋 Résultats: {len(data.get('results', []))}")
                
                for role in data.get('results', []):
                    print(f"      📋 {role.get('name', 'N/A')} - {role.get('display_name', 'N/A')}")
            else:
                print(f"   ❌ Erreur API: {response.status_code}")
                print(f"   📋 Content: {response.content.decode()[:200]}")
                
        except Exception as e:
            print(f"   ❌ Erreur test API: {e}")
        
        # 4. Check if roles are active
        print("\n4️⃣ Vérification du statut des rôles...")
        with connection.cursor() as cursor:
            cursor.execute("UPDATE custom_roles SET is_active = 1 WHERE is_active = 0")
            updated = cursor.rowcount
            if updated > 0:
                print(f"   🔧 {updated} rôles activés")
            else:
                print("   ✅ Tous les rôles sont déjà actifs")
        
        # 5. Test API after activation
        print("\n5️⃣ Test de l'API après activation...")
        try:
            client = Client()
            response = client.get('/api/authentication/roles/')
            print(f"   📊 Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   📋 Résultats: {len(data.get('results', []))}")
                
                for role in data.get('results', []):
                    print(f"      📋 {role.get('name', 'N/A')} - {role.get('display_name', 'N/A')}")
            else:
                print(f"   ❌ Erreur API: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Erreur test API: {e}")
        
        # 6. Check frontend API call
        print("\n6️⃣ Vérification de l'appel API frontend...")
        print("   💡 Le problème peut être dans le code JavaScript frontend")
        print("   💡 Vérifiez que l'API /api/authentication/roles/ est appelée")
        print("   💡 Vérifiez que la réponse contient des données")
        
        # 7. Create test data if needed
        print("\n7️⃣ Création de données de test si nécessaire...")
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM custom_roles")
            count = cursor.fetchone()[0]
            
            if count == 0:
                print("   🔧 Création de rôles de test...")
                cursor.execute("""
                    INSERT INTO custom_roles (name, display_name, description, is_active, created_at, updated_at)
                    VALUES 
                    ('PROJECT_MANAGER', 'Gestionnaire de Projet', 'Accès complet aux projets', 1, NOW(), NOW()),
                    ('PROJECT_USER', 'Utilisateur de Projet', 'Accès en lecture seule', 1, NOW(), NOW())
                """)
                print("   ✅ Rôles de test créés")
            else:
                print(f"   ✅ {count} rôles existants")
        
        print("\n🎉 Diagnostic terminé!")
        print("=" * 50)
        print("💡 Solutions possibles:")
        print("   1. Vérifiez que l'API /api/authentication/roles/ fonctionne")
        print("   2. Vérifiez que les rôles sont actifs (is_active = 1)")
        print("   3. Vérifiez le code JavaScript frontend")
        print("   4. Redémarrez le serveur Django")
        print("   5. Vérifiez les logs du navigateur (F12)")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    fix_empty_roles_dropdown()

