# 📚 Git Scripts - Guide d'Utilisation

## 🎯 Problème Résolu

Le terminal ne peut pas exécuter Git directement à cause d'un problème d'environnement Windows. Ces scripts contournent le problème.

## 🛠️ Scripts Disponibles

### 1. `commit_and_push.bat` ⭐ (Plus Simple)
**Comment utiliser :**
- **Double-cliquer** sur le fichier
- Le script s'exécute dans une fenêtre CMD
- Il trouve Git automatiquement
- Commit et push les changements

**Avantages :**
- ✅ Aucune configuration nécessaire
- ✅ Fonctionne par double-clic
- ✅ Détecte Git automatiquement
- ✅ Messages détaillés

### 2. `setup_git_and_commit.ps1` (PowerShell)
**Comment utiliser :**
- **Clic droit** > "Exécuter avec PowerShell"
- Ou depuis PowerShell : `.\setup_git_and_commit.ps1`

**Si erreur de politique d'exécution :**
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\setup_git_and_commit.ps1
```

**Avantages :**
- ✅ Plus de contrôle
- ✅ Messages colorés
- ✅ Meilleure gestion d'erreurs

### 3. `git_commit_push.bat` (Basique)
**Comment utiliser :**
- Double-cliquer sur le fichier

**Note :** Utilise Git du PATH système. Si Git n'est pas dans le PATH, utilisez `commit_and_push.bat` à la place.

## 🚀 Méthodes Alternatives

### Git Bash (Sans Scripts)
1. **Clic droit** dans le dossier > "Git Bash Here"
2. Exécuter :
   ```bash
   git add .
   git commit -m "feat: Add project details dialog"
   git config --global http.sslBackend schannel
   git push origin master
   ```

### Visual Studio Code
1. Ouvrir le projet dans VS Code
2. Source Control (Ctrl+Shift+G)
3. Stage all > Commit > Push

### GitHub Desktop
1. Ouvrir le projet dans GitHub Desktop
2. Review changes
3. Commit to master
4. Push origin

## 📋 Ce que Font les Scripts

### Étape 1: Détection de Git
```
Cherche Git dans :
- C:\Program Files\Git\bin\git.exe
- C:\Program Files (x86)\Git\bin\git.exe
- PATH système
```

### Étape 2: Git Add
```bash
git add .
```
Ajoute tous les fichiers modifiés au staging

### Étape 3: Git Commit
```bash
git commit -m "feat: Add professional project details dialog with tasks and team info"
```
Crée un commit avec un message descriptif

### Étape 4: Configuration SSL (Windows)
```bash
git config --global http.sslBackend schannel
```
Configure Git pour utiliser le backend SSL natif de Windows

### Étape 5: Git Push
```bash
git push origin master
```
Envoie les changements vers le dépôt distant

## ❗ Résolution de Problèmes

### "Git not found"
**Solution :** Git n'est pas installé ou pas dans le PATH
1. Installer Git : https://git-scm.com/download/win
2. Ou ajouter Git au PATH (voir `GIT_WINDOWS_FIX.md`)

### "SSL_ERROR_SYSCALL"
**Solution :** Problème SSL sur Windows
```bash
git config --global http.sslBackend schannel
```

### "Permission denied"
**Solution :** Problème d'authentification
1. Vérifier les identifiants Git
2. Régénérer le token GitHub si nécessaire

### Script PowerShell bloqué
**Solution :**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📦 Fichiers qui Seront Commités

### Nouveaux Fichiers
- ✅ `src/modules/projects/ProjectDetails.jsx`
- ✅ `PROJECT_DETAILS_FEATURE.md`

### Fichiers Modifiés
- ✅ `src/modules/projects/Projects.jsx`
- ✅ `src/shared/services/projectDataTransformer.js`

### Scripts et Documentation
- 📝 `commit_and_push.bat`
- 📝 `setup_git_and_commit.ps1`
- 📝 `git_commit_push.bat`
- 📝 `GIT_WINDOWS_FIX.md`
- 📝 `QUICK_COMMIT.md`
- 📝 `README_GIT_SCRIPTS.md`

## 🎯 Recommandation

**Pour une utilisation simple et rapide :**
👉 **Double-cliquer sur `commit_and_push.bat`**

**Pour plus de contrôle :**
👉 **Utiliser Git Bash directement**

**Pour automatisation future :**
👉 **Configurer Git dans le PATH Windows**

## 📚 Documentation Complète

Pour plus de détails, consultez :
- `GIT_WINDOWS_FIX.md` - Guide complet de résolution
- `QUICK_COMMIT.md` - Guide ultra-rapide
- `PROJECT_DETAILS_FEATURE.md` - Documentation de la fonctionnalité

---

**Choisissez la méthode qui vous convient et committez en toute simplicité ! 🎉**
