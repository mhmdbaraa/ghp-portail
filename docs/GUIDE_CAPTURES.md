# 📸 Guide de Capture d'Écran pour la Documentation

## 🎯 Objectif
Ce guide vous explique comment capturer les écrans nécessaires pour compléter le guide utilisateur HTML.

## 📋 Liste des Captures Nécessaires

### 1. 🔐 Page de Connexion
**Fichier :** `screenshots/01-login.png`
**Description :** Interface de connexion avec champs nom d'utilisateur et mot de passe
**Instructions :**
- Ouvrir l'application dans le navigateur
- Capturer la page de connexion complète
- S'assurer que les champs sont visibles

### 2. 📊 Dashboard Principal
**Fichier :** `screenshots/02-dashboard.png`
**Description :** Tableau de bord avec métriques et graphiques
**Instructions :**
- Se connecter avec un compte administrateur
- Capturer l'ensemble du dashboard
- Inclure les cartes de métriques et graphiques

### 3. 📁 Vue Kanban des Projets
**Fichier :** `screenshots/03-kanban.png`
**Description :** Vue Kanban avec colonnes de statuts
**Instructions :**
- Aller dans la section Projets
- Sélectionner la vue Kanban
- Capturer les colonnes (En attente, En cours, En retard, Terminé)

### 4. 📝 Formulaire de Création de Projet
**Fichier :** `screenshots/04-create-project.png`
**Description :** Formulaire de création d'un nouveau projet
**Instructions :**
- Cliquer sur "Nouveau Projet"
- Capturer le formulaire complet
- S'assurer que tous les champs sont visibles

### 5. ✅ Liste des Tâches
**Fichier :** `screenshots/05-tasks.png`
**Description :** Interface de gestion des tâches
**Instructions :**
- Aller dans la section Tâches
- Capturer la liste avec les statuts colorés
- Inclure les actions disponibles

### 6. 📅 Calendrier des Échéances
**Fichier :** `screenshots/06-calendar.png`
**Description :** Calendrier avec les échéances
**Instructions :**
- Aller dans la section Calendrier
- Capturer la vue mensuelle
- Inclure les événements colorés

### 7. 👥 Gestion des Utilisateurs
**Fichier :** `screenshots/07-users.png`
**Description :** Interface de gestion des utilisateurs
**Instructions :**
- Aller dans la section Utilisateurs
- Capturer le tableau des utilisateurs
- Inclure les actions (Modifier, Supprimer)

### 8. 📈 Rapports et Statistiques
**Fichier :** `screenshots/08-reports.png`
**Description :** Interface des rapports
**Instructions :**
- Aller dans la section Rapports
- Capturer les graphiques et tableaux
- Inclure les options d'export

### 9. ⚙️ Configuration du Profil
**Fichier :** `screenshots/09-settings.png`
**Description :** Page de configuration utilisateur
**Instructions :**
- Cliquer sur l'avatar utilisateur
- Sélectionner "Profil" ou "Paramètres"
- Capturer les options de configuration

### 10. 🔧 Page d'Erreur (Exemple)
**Fichier :** `screenshots/10-error.png`
**Description :** Exemple de page d'erreur pour le dépannage
**Instructions :**
- Simuler une erreur (ex: déconnexion)
- Capturer le message d'erreur
- Inclure les options de résolution

## 🛠️ Outils de Capture Recommandés

### Windows
- **Snipping Tool** (intégré à Windows)
- **Snagit** (professionnel)
- **Greenshot** (gratuit)

### macOS
- **Screenshot** (Cmd+Shift+4)
- **Skitch** (gratuit)

### Linux
- **Flameshot** (gratuit)
- **Shutter** (gratuit)

## 📐 Paramètres de Capture

### Résolution
- **Minimum :** 1920x1080
- **Recommandé :** 2560x1440 ou supérieur

### Format
- **Format :** PNG (pour la qualité)
- **Compression :** Aucune ou minimale

### Cadrage
- **Plein écran** pour les vues générales
- **Fenêtre spécifique** pour les détails
- **Zone sélectionnée** pour les éléments précis

## 🎨 Post-Traitement

### Redimensionnement
- **Largeur maximale :** 1200px pour le web
- **Conserver les proportions**
- **Qualité optimale**

### Annotations (Optionnel)
- **Flèches** pour pointer les éléments importants
- **Encadrés** pour mettre en évidence
- **Texte** pour expliquer les actions

## 📁 Organisation des Fichiers

```
docs/
├── GUIDE_UTILISATEUR.html
├── GUIDE_UTILISATEUR.pdf
├── GUIDE_CAPTURES.md
└── screenshots/
    ├── 01-login.png
    ├── 02-dashboard.png
    ├── 03-kanban.png
    ├── 04-create-project.png
    ├── 05-tasks.png
    ├── 06-calendar.png
    ├── 07-users.png
    ├── 08-reports.png
    ├── 09-settings.png
    └── 10-error.png
```

## 🔄 Mise à Jour du Guide HTML

Une fois les captures réalisées, mettre à jour le fichier HTML :

1. **Remplacer les placeholders** `[Capture d'écran - ...]` par les vraies images
2. **Ajuster les chemins** des images dans le HTML
3. **Vérifier l'affichage** dans le navigateur
4. **Reconvertir en PDF** si nécessaire

## 📝 Exemple de Code HTML

```html
<div class="screenshot">
    <img src="screenshots/02-dashboard.png" alt="Dashboard principal" />
    <div class="screenshot-caption">Figure 2 : Dashboard avec métriques et graphiques</div>
</div>
```

## ✅ Checklist de Validation

- [ ] Toutes les captures sont réalisées
- [ ] Qualité d'image suffisante
- [ ] Images redimensionnées correctement
- [ ] Chemins des images mis à jour dans le HTML
- [ ] Guide HTML testé dans le navigateur
- [ ] PDF généré et vérifié
- [ ] Documentation complète et cohérente

## 🚀 Prochaines Étapes

1. **Réaliser les captures** selon ce guide
2. **Mettre à jour le HTML** avec les vraies images
3. **Tester l'affichage** dans différents navigateurs
4. **Générer le PDF final** avec les captures
5. **Distribuer la documentation** aux utilisateurs
