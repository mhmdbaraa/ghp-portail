#!/usr/bin/env python
"""
Test roles API with display_name
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'projecttracker.settings_production')
django.setup()

from django.test import Client

def test_roles_api():
    print("🧪 Test de l'API des rôles avec display_name...")
    print("=" * 50)
    
    try:
        # 1. Test API endpoint
        print("1️⃣ Test de l'endpoint API...")
        client = Client()
        response = client.get('/api/authentication/roles/')
        print(f"   📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   📋 Résultats: {len(data.get('results', []))}")
            
            for role in data.get('results', []):
                print(f"      📋 ID: {role.get('id', 'N/A')}")
                print(f"         Nom: {role.get('name', 'N/A')}")
                print(f"         Display: {role.get('display_name', 'N/A')}")
                print(f"         Description: {role.get('description', 'N/A')}")
                print(f"         Actif: {role.get('is_active', 'N/A')}")
                print("         ---")
        else:
            print(f"   ❌ Erreur API: {response.status_code}")
            print(f"   📋 Content: {response.content.decode()[:200]}")
        
        # 2. Test with authentication
        print("\n2️⃣ Test avec authentification...")
        try:
            # Try to login first
            login_data = {
                'username': 'admin',
                'password': 'admin123'
            }
            
            login_response = client.post('/api/authentication/login/', login_data)
            print(f"   📊 Login Status: {login_response.status_code}")
            
            if login_response.status_code == 200:
                login_data = login_response.json()
                access_token = login_data.get('tokens', {}).get('access')
                
                if access_token:
                    # Test API with token
                    headers = {'Authorization': f'Bearer {access_token}'}
                    response = client.get('/api/authentication/roles/', headers=headers)
                    print(f"   📊 API avec token Status: {response.status_code}")
                    
                    if response.status_code == 200:
                        data = response.json()
                        print(f"   📋 Résultats avec token: {len(data.get('results', []))}")
                        
                        for role in data.get('results', []):
                            print(f"      📋 {role.get('name', 'N/A')} - {role.get('display_name', 'N/A')}")
                    else:
                        print(f"   ❌ Erreur API avec token: {response.status_code}")
                else:
                    print("   ❌ Token d'accès non trouvé")
            else:
                print(f"   ❌ Erreur de connexion: {login_response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Erreur test avec auth: {e}")
        
        print("\n🎉 Test terminé!")
        print("=" * 50)
        print("💡 Si display_name est maintenant inclus:")
        print("   1. Le dropdown des rôles devrait se remplir")
        print("   2. Redémarrez le serveur Django")
        print("   3. Testez la création d'utilisateur")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_roles_api()

