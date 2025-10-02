#!/usr/bin/env python
"""
Fix frontend roles loading issue
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'projecttracker.settings_production')
django.setup()

from django.test import Client
import json

def fix_frontend_roles_loading():
    print("🔧 Correction du chargement des rôles côté frontend...")
    print("=" * 60)
    
    try:
        # 1. Test API endpoint directly
        print("1️⃣ Test de l'API des rôles...")
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
            return False
        
        # 2. Test with CORS headers
        print("\n2️⃣ Test avec en-têtes CORS...")
        response = client.get('/api/authentication/roles/', HTTP_ORIGIN='http://localhost:3000')
        print(f"   📊 Status avec CORS: {response.status_code}")
        
        # 3. Check if roles are properly formatted for frontend
        print("\n3️⃣ Vérification du format pour le frontend...")
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', [])
            
            # Check if results is a list
            if isinstance(results, list):
                print("   ✅ results est une liste")
            else:
                print("   ❌ results n'est pas une liste")
            
            # Check if each role has required fields
            for i, role in enumerate(results):
                required_fields = ['id', 'name', 'display_name']
                missing_fields = [field for field in required_fields if field not in role]
                
                if missing_fields:
                    print(f"   ❌ Rôle {i+1} manque: {missing_fields}")
                else:
                    print(f"   ✅ Rôle {i+1} complet")
        
        # 4. Test authentication endpoint
        print("\n4️⃣ Test de l'endpoint d'authentification...")
        try:
            # Test login
            login_data = {
                'username': 'admin',
                'password': 'admin123'
            }
            
            login_response = client.post('/api/authentication/login/', login_data)
            print(f"   📊 Login Status: {login_response.status_code}")
            
            if login_response.status_code == 200:
                login_data = login_response.json()
                print("   ✅ Connexion réussie")
                
                # Test roles with authentication
                access_token = login_data.get('tokens', {}).get('access')
                if access_token:
                    headers = {'Authorization': f'Bearer {access_token}'}
                    roles_response = client.get('/api/authentication/roles/', headers=headers)
                    print(f"   📊 Roles avec auth Status: {roles_response.status_code}")
                    
                    if roles_response.status_code == 200:
                        roles_data = roles_response.json()
                        print(f"   📋 Rôles avec auth: {len(roles_data.get('results', []))}")
                    else:
                        print(f"   ❌ Erreur rôles avec auth: {roles_response.status_code}")
                else:
                    print("   ❌ Token d'accès non trouvé")
            else:
                print(f"   ❌ Erreur de connexion: {login_response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Erreur test auth: {e}")
        
        # 5. Check frontend JavaScript issues
        print("\n5️⃣ Diagnostic des problèmes JavaScript...")
        print("   💡 Problèmes possibles côté frontend:")
        print("   1. L'API n'est pas appelée au chargement du formulaire")
        print("   2. La réponse API n'est pas correctement parsée")
        print("   3. Les rôles ne sont pas mappés dans le dropdown")
        print("   4. Erreur JavaScript empêche le chargement")
        
        # 6. Create a test endpoint for frontend
        print("\n6️⃣ Création d'un endpoint de test...")
        try:
            # Test a simple endpoint
            response = client.get('/api/authentication/roles/?format=json')
            print(f"   📊 Format JSON Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   📋 Format JSON Results: {len(data.get('results', []))}")
                
                # Check if the response is properly formatted
                if 'results' in data and isinstance(data['results'], list):
                    print("   ✅ Format JSON correct")
                else:
                    print("   ❌ Format JSON incorrect")
            else:
                print(f"   ❌ Erreur format JSON: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Erreur test format: {e}")
        
        # 7. Check database directly
        print("\n7️⃣ Vérification directe de la base de données...")
        from django.db import connection
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, name, display_name, is_active FROM custom_roles")
            roles = cursor.fetchall()
            print(f"   📊 Rôles en base: {len(roles)}")
            
            for role in roles:
                print(f"   📋 ID: {role[0]} - Nom: {role[1]} - Display: {role[2]} - Actif: {role[3]}")
        
        print("\n🎉 Diagnostic terminé!")
        print("=" * 60)
        print("💡 Solutions pour le frontend:")
        print("   1. Vérifiez que l'API /api/authentication/roles/ est appelée")
        print("   2. Vérifiez que la réponse contient 'results' comme array")
        print("   3. Vérifiez que les rôles sont mappés dans le dropdown")
        print("   4. Vérifiez les logs du navigateur (F12)")
        print("   5. Redémarrez le serveur Django")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    fix_frontend_roles_loading()

