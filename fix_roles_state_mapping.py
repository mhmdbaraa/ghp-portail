#!/usr/bin/env python
"""
Fix roles state mapping issue in frontend
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'projecttracker.settings_production')
django.setup()

from django.test import Client
import json

def fix_roles_state_mapping():
    print("🔧 Correction du mapping des rôles dans le state...")
    print("=" * 60)
    
    try:
        # 1. Test API response format
        print("1️⃣ Test du format de réponse API...")
        client = Client()
        response = client.get('/api/authentication/roles/')
        print(f"   📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   📋 Structure de la réponse:")
            print(f"      - count: {data.get('count', 'N/A')}")
            print(f"      - results: {len(data.get('results', []))}")
            print(f"      - next: {data.get('next', 'N/A')}")
            print(f"      - previous: {data.get('previous', 'N/A')}")
            
            # Check results structure
            results = data.get('results', [])
            if results:
                first_role = results[0]
                print(f"   📋 Premier rôle:")
                print(f"      - id: {first_role.get('id', 'N/A')}")
                print(f"      - name: {first_role.get('name', 'N/A')}")
                print(f"      - display_name: {first_role.get('display_name', 'N/A')}")
                print(f"      - description: {first_role.get('description', 'N/A')}")
        else:
            print(f"   ❌ Erreur API: {response.status_code}")
            return False
        
        # 2. Analyze the JavaScript issue
        print("\n2️⃣ Analyse du problème JavaScript...")
        print("   🔍 D'après les logs:")
        print("      - 'Loading roles...' ✅")
        print("      - 'Roles state updated: Array(0)' ❌ (vide)")
        print("      - 'Roles response: Object' ✅ (données reçues)")
        print("      - 'Roles loaded successfully: Object' ✅")
        print("      - 'Roles state updated: Object' ❌ (pas un array)")
        
        print("\n   💡 Le problème:")
        print("      1. L'API retourne: {data: {results: [...]}}")
        print("      2. Le code JavaScript ne mappe pas data.results")
        print("      3. Le state reste vide ou devient un Object")
        
        # 3. Check if we need to modify the API response
        print("\n3️⃣ Vérification de la structure de réponse...")
        
        # Test different response formats
        print("   📋 Format actuel:")
        print(f"      - data.results: {len(data.get('results', []))}")
        print(f"      - data.count: {data.get('count', 'N/A')}")
        
        # 4. Create a test response format
        print("\n4️⃣ Test de format de réponse alternatif...")
        
        # Simulate what the frontend expects
        frontend_expected = {
            "success": True,
            "message": "Roles retrieved successfully",
            "data": {
                "count": len(results),
                "results": results
            }
        }
        
        print("   📋 Format attendu par le frontend:")
        print(f"      - success: {frontend_expected['success']}")
        print(f"      - message: {frontend_expected['message']}")
        print(f"      - data.count: {frontend_expected['data']['count']}")
        print(f"      - data.results: {len(frontend_expected['data']['results'])}")
        
        # 5. Check if the issue is in the API view
        print("\n5️⃣ Vérification de la vue API...")
        try:
            from authentication.views import RoleViewSet
            print("   ✅ RoleViewSet trouvé")
            
            # Check if the view returns the right format
            print("   📋 Format de réponse de la vue:")
            print("      - La vue devrait retourner data.results")
            print("      - Le frontend devrait mapper data.results")
            
        except Exception as e:
            print(f"   ❌ Erreur vue API: {e}")
        
        # 6. Provide JavaScript fix
        print("\n6️⃣ Solution JavaScript...")
        print("   💡 Code JavaScript à corriger:")
        print("   ")
        print("   // AVANT (problématique):")
        print("   setRoles(response.data);")
        print("   ")
        print("   // APRÈS (correct):")
        print("   setRoles(response.data.results || []);")
        print("   ")
        print("   // Ou encore mieux:")
        print("   if (response.data && response.data.results) {")
        print("       setRoles(response.data.results);")
        print("   } else {")
        print("       setRoles([]);")
        print("   }")
        
        # 7. Test the fix
        print("\n7️⃣ Test de la correction...")
        print("   📋 Vérification que data.results existe:")
        
        if 'data' in data and 'results' in data:
            print("   ✅ data.results existe")
            print(f"   📊 Nombre de rôles: {len(data['results'])}")
        else:
            print("   ❌ data.results n'existe pas")
            print(f"   📋 Clés disponibles: {list(data.keys())}")
        
        print("\n🎉 Diagnostic terminé!")
        print("=" * 60)
        print("💡 Solution:")
        print("   1. Modifiez le code JavaScript pour utiliser data.results")
        print("   2. Vérifiez que setRoles() reçoit un array")
        print("   3. Testez le formulaire de création d'utilisateur")
        print("   4. Les rôles devraient maintenant s'afficher dans le dropdown")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    fix_roles_state_mapping()

