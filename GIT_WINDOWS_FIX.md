# 🔧 Fix Git Environment Problem on Windows

## 📋 Problème

Le terminal ne peut pas exécuter les commandes Git à cause d'un problème d'environnement shell (`spawn /bin/sh ENOENT`).

## ✅ Solutions Disponibles

### Option 1: Script PowerShell (Recommandé)

**Exécuter le script PowerShell :**

```powershell
# Clic droit sur le fichier > Exécuter avec PowerShell
setup_git_and_commit.ps1
```

Ou depuis PowerShell :
```powershell
.\setup_git_and_commit.ps1
```

Si vous avez une erreur de politique d'exécution :
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\setup_git_and_commit.ps1
```

### Option 2: Script Batch

**Double-cliquer sur :**
```
commit_and_push.bat
```

Ou depuis CMD :
```cmd
commit_and_push.bat
```

### Option 3: Git Bash (Plus Simple)

1. **Ouvrir Git Bash** (clic droit dans le dossier > "Git Bash Here")
2. **Exécuter les commandes :**
   ```bash
   git add .
   git commit -m "feat: Add professional project details dialog"
   git config --global http.sslBackend schannel
   git push origin master
   ```

### Option 4: Commandes Manuelles (PowerShell)

Ouvrir PowerShell dans le dossier du projet :

```powershell
# Trouver Git
$git = "C:\Program Files\Git\bin\git.exe"

# Ajouter les changements
& $git add .

# Commit
& $git commit -m "feat: Add professional project details dialog with tasks and team info"

# Configurer SSL
& $git config --global http.sslBackend schannel

# Push
& $git push origin master
```

### Option 5: Visual Studio Code

1. Ouvrir le projet dans VS Code
2. Aller dans l'onglet **Source Control** (Ctrl+Shift+G)
3. Cliquer sur **"+"** pour stage tous les fichiers
4. Écrire le message de commit
5. Cliquer sur **✓** pour commit
6. Cliquer sur **"..."** > **Push**

## 🔍 Diagnostic du Problème

### Vérifier l'installation de Git

**PowerShell :**
```powershell
# Chercher Git
Get-Command git -ErrorAction SilentlyContinue

# Ou chercher dans les emplacements standards
Test-Path "C:\Program Files\Git\bin\git.exe"
Test-Path "C:\Program Files (x86)\Git\bin\git.exe"
```

**CMD :**
```cmd
where git
```

### Ajouter Git au PATH (Solution Permanente)

1. **Ouvrir les Variables d'Environnement :**
   - Clic droit sur "Ce PC" > Propriétés
   - Paramètres système avancés
   - Variables d'environnement

2. **Modifier la variable PATH :**
   - Dans "Variables système", sélectionner `Path`
   - Cliquer sur "Modifier"
   - Ajouter : `C:\Program Files\Git\bin`
   - Ajouter : `C:\Program Files\Git\cmd`

3. **Redémarrer le terminal**

## 📝 Fichiers Créés pour Vous

### `setup_git_and_commit.ps1`
- Script PowerShell complet
- Détecte automatiquement Git
- Commit et push avec configuration SSL
- Messages détaillés

### `commit_and_push.bat`
- Script Batch simple
- Cherche Git dans les emplacements standards
- Peut être double-cliqué

### `git_commit_push.bat`
- Version simplifiée
- Utilise Git du PATH système

## 🎯 Changements à Commiter

Les fichiers suivants ont été modifiés/ajoutés :

**Nouveaux fichiers :**
- ✅ `src/modules/projects/ProjectDetails.jsx` - Composant de détails
- ✅ `PROJECT_DETAILS_FEATURE.md` - Documentation
- ✅ `src/shared/services/projectDataTransformer.js` - Fix mapping projectNumber

**Fichiers modifiés :**
- ✅ `src/modules/projects/Projects.jsx` - Intégration du dialog

## 💡 Message de Commit Recommandé

```
feat: Add professional project details dialog with tasks and team info

- Created ProjectDetails.jsx component with modern UI/UX
- Added tabbed interface (Overview, Tasks, Team)
- Implemented dynamic header with gradient colors
- Added task loading from API
- Integrated with Projects.jsx (DataGrid and Kanban views)
- Added project number display in camelCase format
- Fixed projectDataTransformer to map projectNumber correctly
- Added comprehensive documentation
```

## ⚠️ Problème SSL (Si Erreur Push)

Si vous obtenez `SSL_ERROR_SYSCALL` lors du push :

```powershell
# Configurer SSL backend pour Windows
git config --global http.sslBackend schannel

# Ou désactiver SSL (moins sécurisé)
git config --global http.sslVerify false
```

## 🚀 Procédure Rapide

**La plus simple (Git Bash) :**
1. Clic droit dans le dossier > "Git Bash Here"
2. Copier-coller :
   ```bash
   git add . && git commit -m "feat: Add project details dialog" && git push
   ```

**Avec les scripts créés :**
1. Double-cliquer sur `commit_and_push.bat`
2. Suivre les instructions à l'écran

---

**Choisissez la méthode qui vous convient le mieux !** 🎉
