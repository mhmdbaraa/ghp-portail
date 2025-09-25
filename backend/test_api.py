#!/usr/bin/env python
import requests
import json

def test_api():
    base_url = "http://localhost:8000/api/auth"
    
    print("=== Test de l'API Permissions et Rôles ===")
    
    # Test des permissions
    try:
        print("\n1. Test des permissions...")
        response = requests.get(f"{base_url}/permissions/")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ API Permissions fonctionne!")
            print(f"Nombre de permissions: {len(data.get('results', data))}")
            
            # Afficher les premières permissions
            permissions = data.get('results', data)
            if isinstance(permissions, list) and len(permissions) > 0:
                print("Premières permissions:")
                for perm in permissions[:3]:
                    print(f"  - {perm.get('name', 'N/A')} ({perm.get('codename', 'N/A')})")
        else:
            print(f"✗ Erreur API Permissions: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("✗ Impossible de se connecter au serveur Django")
        print("Vérifiez que le serveur est démarré avec: python manage.py runserver")
    except Exception as e:
        print(f"✗ Erreur: {e}")
    
    # Test des rôles
    try:
        print("\n2. Test des rôles...")
        response = requests.get(f"{base_url}/roles/")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ API Rôles fonctionne!")
            print(f"Nombre de rôles: {len(data.get('results', data))}")
            
            # Afficher les premiers rôles
            roles = data.get('results', data)
            if isinstance(roles, list) and len(roles) > 0:
                print("Premiers rôles:")
                for role in roles[:3]:
                    print(f"  - {role.get('name', 'N/A')} ({role.get('user_count', 0)} utilisateurs)")
        else:
            print(f"✗ Erreur API Rôles: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("✗ Impossible de se connecter au serveur Django")
    except Exception as e:
        print(f"✗ Erreur: {e}")
    
    # Test des statistiques
    try:
        print("\n3. Test des statistiques...")
        response = requests.get(f"{base_url}/permissions/statistics/")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ API Statistiques fonctionne!")
            stats = data.get('data', {})
            print(f"Total permissions: {stats.get('total', 0)}")
            print(f"Permissions actives: {stats.get('active', 0)}")
        else:
            print(f"✗ Erreur API Statistiques: {response.status_code}")
            
    except Exception as e:
        print(f"✗ Erreur statistiques: {e}")

if __name__ == "__main__":
    test_api()
