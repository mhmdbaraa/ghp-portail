#!/usr/bin/env python3
"""
Script pour mettre à jour le guide HTML avec les vraies captures d'écran
"""

import os
import re
from pathlib import Path

def update_html_guide():
    """Mettre à jour le guide HTML avec les vraies captures"""
    
    html_file = 'docs/GUIDE_UTILISATEUR.html'
    screenshots_dir = Path('docs/screenshots')
    
    if not os.path.exists(html_file):
        print(f"❌ Fichier HTML non trouvé : {html_file}")
        return False
    
    print(f"🔄 Mise à jour du guide HTML : {html_file}")
    
    # Lire le contenu HTML
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Mappings des captures
    screenshot_mappings = [
        {
            'placeholder': r'<div style="background: #f0f0f0; padding: 40px; border-radius: 8px; text-align: center; color: #666;">\s*\[Capture d\'écran - Page de connexion\]',
            'replacement': '''<img src="screenshots/01-login.png" alt="Page de connexion" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />''',
            'description': 'Figure 1 : Page de connexion'
        },
        {
            'placeholder': r'<div style="background: #f0f0f0; padding: 40px; border-radius: 8px; text-align: center; color: #666;">\s*\[Capture d\'écran - Dashboard avec métriques\]',
            'replacement': '''<img src="screenshots/02-dashboard.png" alt="Dashboard avec métriques" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />''',
            'description': 'Figure 2 : Dashboard avec métriques et graphiques'
        },
        {
            'placeholder': r'<div style="background: #f0f0f0; padding: 40px; border-radius: 8px; text-align: center; color: #666;">\s*\[Capture d\'écran - Graphiques\]',
            'replacement': '''<img src="screenshots/02-dashboard.png" alt="Graphiques du dashboard" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />''',
            'description': 'Figure 3 : Graphiques de répartition'
        },
        {
            'placeholder': r'<div style="background: #f0f0f0; padding: 40px; border-radius: 8px; text-align: center; color: #666;">\s*\[Capture d\'écran - Liste des projets récents\]',
            'replacement': '''<img src="screenshots/02-dashboard.png" alt="Projets récents" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />''',
            'description': 'Figure 4 : Projets récents'
        },
        {
            'placeholder': r'<div style="background: #f0f0f0; padding: 40px; border-radius: 8px; text-align: center; color: #666;">\s*\[Capture d\'écran - Vue Kanban\]',
            'replacement': '''<img src="screenshots/03-kanban.png" alt="Vue Kanban" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />''',
            'description': 'Figure 5 : Vue Kanban des projets'
        },
        {
            'placeholder': r'<div style="background: #f0f0f0; padding: 40px; border-radius: 8px; text-align: center; color: #666;">\s*\[Capture d\'écran - Formulaire de création\]',
            'replacement': '''<img src="screenshots/03-kanban.png" alt="Formulaire de création" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />''',
            'description': 'Figure 6 : Formulaire de création de projet'
        },
        {
            'placeholder': r'<div style="background: #f0f0f0; padding: 40px; border-radius: 8px; text-align: center; color: #666;">\s*\[Capture d\'écran - Liste des tâches\]',
            'replacement': '''<img src="screenshots/02-dashboard.png" alt="Liste des tâches" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />''',
            'description': 'Figure 7 : Liste des tâches'
        },
        {
            'placeholder': r'<div style="background: #f0f0f0; padding: 40px; border-radius: 8px; text-align: center; color: #666;">\s*\[Capture d\'écran - Calendrier\]',
            'replacement': '''<img src="screenshots/02-dashboard.png" alt="Calendrier" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />''',
            'description': 'Figure 8 : Calendrier des échéances'
        },
        {
            'placeholder': r'<div style="background: #f0f0f0; padding: 40px; border-radius: 8px; text-align: center; color: #666;">\s*\[Capture d\'écran - Gestion des utilisateurs\]',
            'replacement': '''<img src="screenshots/02-dashboard.png" alt="Gestion des utilisateurs" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />''',
            'description': 'Figure 9 : Interface de gestion des utilisateurs'
        },
        {
            'placeholder': r'<div style="background: #f0f0f0; padding: 40px; border-radius: 8px; text-align: center; color: #666;">\s*\[Capture d\'écran - Rapports\]',
            'replacement': '''<img src="screenshots/02-dashboard.png" alt="Rapports" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />''',
            'description': 'Figure 10 : Interface des rapports'
        },
        {
            'placeholder': r'<div style="background: #f0f0f0; padding: 40px; border-radius: 8px; text-align: center; color: #666;">\s*\[Capture d\'écran - Paramètres\]',
            'replacement': '''<img src="screenshots/02-dashboard.png" alt="Paramètres" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />''',
            'description': 'Figure 11 : Interface de configuration'
        }
    ]
    
    # Remplacer les placeholders par les vraies images
    updated_content = content
    replacements_made = 0
    
    for mapping in screenshot_mappings:
        # Vérifier si le fichier de capture existe
        screenshot_file = screenshots_dir / f"{mapping['description'].split(':')[0].split()[-1].lower()}.png"
        
        if screenshot_file.exists():
            # Remplacer le placeholder
            pattern = mapping['placeholder']
            replacement = mapping['replacement']
            
            if re.search(pattern, updated_content, re.MULTILINE | re.DOTALL):
                updated_content = re.sub(pattern, replacement, updated_content, flags=re.MULTILINE | re.DOTALL)
                replacements_made += 1
                print(f"✅ Remplacé : {mapping['description']}")
            else:
                print(f"⚠️  Placeholder non trouvé pour : {mapping['description']}")
        else:
            print(f"⚠️  Capture manquante : {screenshot_file}")
    
    # Sauvegarder le fichier mis à jour
    if replacements_made > 0:
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        
        print(f"\n✅ Guide HTML mis à jour avec {replacements_made} captures")
        print(f"📁 Fichier : {html_file}")
        return True
    else:
        print("\n⚠️  Aucune mise à jour effectuée")
        return False

def create_placeholder_images():
    """Créer des images placeholder si les captures n'existent pas"""
    
    screenshots_dir = Path('docs/screenshots')
    screenshots_dir.mkdir(exist_ok=True)
    
    # Images placeholder à créer
    placeholders = [
        '01-login.png',
        '02-dashboard.png', 
        '03-kanban.png'
    ]
    
    print("🖼️  Création d'images placeholder...")
    
    for placeholder in placeholders:
        placeholder_path = screenshots_dir / placeholder
        if not placeholder_path.exists():
            # Créer une image placeholder simple
            create_simple_placeholder(placeholder_path, placeholder)
            print(f"✅ Placeholder créé : {placeholder_path}")

def create_simple_placeholder(file_path, name):
    """Créer une image placeholder simple"""
    
    # Contenu SVG simple
    svg_content = f'''<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="600" fill="#f0f0f0" stroke="#ccc" stroke-width="2"/>
        <text x="400" y="250" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#666">
            [Capture d'écran - {name.replace('.png', '').replace('-', ' ').title()}]
        </text>
        <text x="400" y="300" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#999">
            Image à remplacer par la vraie capture
        </text>
        <text x="400" y="350" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#999">
            Utilisez le guide docs/GUIDE_CAPTURE_MANUELLE.md
        </text>
    </svg>'''
    
    # Sauvegarder comme fichier SVG (sera converti en PNG par le navigateur)
    svg_path = file_path.with_suffix('.svg')
    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    
    print(f"📝 Placeholder SVG créé : {svg_path}")

def main():
    """Fonction principale"""
    print("🚀 Mise à jour du guide avec les captures d'écran")
    print("=" * 50)
    
    # Créer les placeholders si nécessaire
    create_placeholder_images()
    
    # Mettre à jour le guide HTML
    if update_html_guide():
        print("\n🎉 Guide mis à jour avec succès !")
        print("\n📋 Prochaines étapes :")
        print("1. Vérifier le guide HTML dans le navigateur")
        print("2. Remplacer les placeholders par les vraies captures")
        print("3. Régénérer le PDF si nécessaire")
    else:
        print("\n⚠️  Aucune mise à jour effectuée")
        print("💡 Assurez-vous d'avoir les captures dans docs/screenshots/")

if __name__ == "__main__":
    main()
