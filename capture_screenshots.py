#!/usr/bin/env python3
"""
Script pour capturer automatiquement les écrans des composants générés
"""

import os
import sys
import time
import subprocess
from pathlib import Path

def capture_with_browser():
    """Capturer les écrans en utilisant le navigateur"""
    
    # URLs des composants à capturer
    screenshots = [
        {
            'name': '01-login',
            'url': 'http://localhost:3000/screenshots?view=login',
            'description': 'Page de connexion avec formulaire'
        },
        {
            'name': '02-dashboard', 
            'url': 'http://localhost:3000/screenshots?view=dashboard',
            'description': 'Dashboard avec métriques et graphiques'
        },
        {
            'name': '03-kanban',
            'url': 'http://localhost:3000/screenshots?view=kanban', 
            'description': 'Vue Kanban des projets'
        }
    ]
    
    # Créer le dossier screenshots s'il n'existe pas
    screenshots_dir = Path('docs/screenshots')
    screenshots_dir.mkdir(exist_ok=True)
    
    print("📸 Début des captures d'écran...")
    
    for screenshot in screenshots:
        print(f"\n🔄 Capture de {screenshot['name']}...")
        
        # Chemin du fichier de sortie
        output_file = screenshots_dir / f"{screenshot['name']}.png"
        
        # Commande Chrome pour capture
        cmd = [
            'chrome',
            '--headless',
            '--disable-gpu',
            '--window-size=1920,1080',
            '--screenshot=' + str(output_file),
            '--virtual-time-budget=5000',
            screenshot['url']
        ]
        
        try:
            # Exécuter la capture
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0 and output_file.exists():
                print(f"✅ {screenshot['name']} capturé avec succès")
                print(f"   📁 {output_file}")
                print(f"   📝 {screenshot['description']}")
            else:
                print(f"❌ Erreur lors de la capture de {screenshot['name']}")
                print(f"   Erreur: {result.stderr}")
                
        except subprocess.TimeoutExpired:
            print(f"❌ Timeout lors de la capture de {screenshot['name']}")
        except Exception as e:
            print(f"❌ Erreur: {e}")
    
    print(f"\n🎉 Captures terminées ! Vérifiez le dossier: {screenshots_dir}")

def create_manual_guide():
    """Créer un guide pour les captures manuelles"""
    
    guide_content = '''# 📸 Guide de Capture Manuelle

## 🎯 Objectif
Capturer les composants générés pour créer un guide visuel professionnel.

## 🚀 Étapes de Capture

### 1. Démarrer l'Application
```bash
npm start
# ou
yarn start
```

### 2. Accéder à la Page de Capture
Ouvrir dans le navigateur : `http://localhost:3000/screenshots`

### 3. Captures à Réaliser

#### 📱 Page de Connexion
- **URL :** `http://localhost:3000/screenshots?view=login`
- **Fichier :** `docs/screenshots/01-login.png`
- **Description :** Interface de connexion avec formulaire stylisé

#### 📊 Dashboard
- **URL :** `http://localhost:3000/screenshots?view=dashboard`  
- **Fichier :** `docs/screenshots/02-dashboard.png`
- **Description :** Dashboard avec métriques, graphiques et projets récents

#### 📁 Vue Kanban
- **URL :** `http://localhost:3000/screenshots?view=kanban`
- **Fichier :** `docs/screenshots/03-kanban.png`
- **Description :** Vue Kanban avec colonnes de statuts et cartes de projets

### 4. Paramètres de Capture

#### Résolution
- **Largeur :** 1920px minimum
- **Hauteur :** 1080px minimum
- **Format :** PNG pour la qualité

#### Outils Recommandés
- **Windows :** Snipping Tool, Snagit
- **macOS :** Screenshot (Cmd+Shift+4)
- **Linux :** Flameshot, Shutter

### 5. Post-Traitement

#### Redimensionnement
- **Largeur maximale :** 1200px pour le web
- **Conserver les proportions**
- **Qualité optimale**

#### Organisation
```
docs/screenshots/
├── 01-login.png
├── 02-dashboard.png
└── 03-kanban.png
```

### 6. Mise à Jour du Guide HTML

Une fois les captures réalisées :

1. **Remplacer les placeholders** dans `GUIDE_UTILISATEUR.html`
2. **Mettre à jour les chemins** des images
3. **Vérifier l'affichage** dans le navigateur
4. **Régénérer le PDF** si nécessaire

### 7. Exemple de Code HTML

```html
<div class="screenshot">
    <img src="screenshots/02-dashboard.png" alt="Dashboard principal" />
    <div class="screenshot-caption">Figure 2 : Dashboard avec métriques et graphiques</div>
</div>
```

## ✅ Checklist

- [ ] Application démarrée sur localhost:3000
- [ ] Page de capture accessible
- [ ] 3 captures réalisées (login, dashboard, kanban)
- [ ] Images redimensionnées et optimisées
- [ ] Fichiers sauvegardés dans docs/screenshots/
- [ ] Guide HTML mis à jour avec les vraies images
- [ ] PDF régénéré avec les captures

## 🎨 Conseils de Capture

### Qualité
- Utiliser une résolution élevée
- Éviter les éléments de l'interface du navigateur
- Capturer en plein écran quand possible

### Cadrage
- Centrer les éléments importants
- Inclure les marges et espacements
- Éviter de couper les éléments

### Cohérence
- Utiliser les mêmes paramètres pour toutes les captures
- Maintenir la même résolution
- Appliquer le même post-traitement

## 🚀 Prochaines Étapes

1. **Réaliser les captures** selon ce guide
2. **Optimiser les images** (redimensionnement, compression)
3. **Mettre à jour le HTML** avec les vraies images
4. **Tester l'affichage** dans différents navigateurs
5. **Générer le PDF final** avec les captures
6. **Distribuer la documentation** aux utilisateurs

---

**📸 Guide de Capture - Système de Gestion de Projets**  
*Version 2.0 | Octobre 2025 | Interface Française | Devise DZD*
'''

    with open('docs/GUIDE_CAPTURE_MANUELLE.md', 'w', encoding='utf-8') as f:
        f.write(guide_content)
    
    print("✅ Guide de capture manuelle créé")

def main():
    """Fonction principale"""
    print("🚀 Génération du système de capture d'écran")
    print("=" * 50)
    
    # Créer le guide de capture manuelle
    create_manual_guide()
    
    print("\n✅ Système de capture configuré !")
    print("\n📋 Composants créés :")
    print("• src/components/ScreenshotLogin.jsx")
    print("• src/components/ScreenshotDashboard.jsx") 
    print("• src/components/ScreenshotKanban.jsx")
    print("• src/pages/ScreenshotPage.jsx")
    print("• docs/GUIDE_CAPTURE_MANUELLE.md")
    
    print("\n🔧 Prochaines étapes :")
    print("1. Ajouter la route /screenshots dans votre application")
    print("2. Démarrer l'application (npm start)")
    print("3. Accéder à http://localhost:3000/screenshots")
    print("4. Suivre le guide docs/GUIDE_CAPTURE_MANUELLE.md")
    print("5. Capturer les écrans et mettre à jour le guide HTML")
    
    print("\n💡 Alternative automatique :")
    print("Si Chrome est installé, vous pouvez utiliser :")
    print("python capture_screenshots.py")

if __name__ == "__main__":
    main()
