# Guide de Configuration SMTP - GHP Portail

## 🚨 Problème Identifié

L'erreur `5.7.1 Unable to relay` indique que votre serveur SMTP interne (`172.16.0.25`) refuse d'envoyer des emails vers des domaines externes. Ceci est une configuration de sécurité courante.

## 🔧 Solutions Disponibles

### Solution 1: Configuration de l'Authentification SMTP (Recommandée)

**Problème**: Le serveur SMTP nécessite une authentification pour relayer les emails.

**Solution**:
1. Obtenez les credentials SMTP de votre administrateur IT
2. Mettez à jour `settings.py`:

```python
# Email Configuration
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "172.16.0.25"
EMAIL_USE_TLS = False
EMAIL_PORT = 25
EMAIL_HOST_USER = 'GHPportail@groupehdyrapahrm.com'  # Votre email
EMAIL_HOST_PASSWORD = 'votre_mot_de_passe_smtp'      # Votre mot de passe
DEFAULT_FROM_EMAIL = 'GHPportail@groupehdyrapahrm.com'
SERVER_EMAIL = 'GHPportail@groupehdyrapahrm.com'
```

### Solution 2: Configuration du Relais SMTP

**Problème**: Le serveur SMTP n'est pas configuré pour relayer vers des domaines externes.

**Solution**:
Contactez votre administrateur IT pour:
- Autoriser le relais vers des domaines externes
- Configurer les règles de relais appropriées
- Ajouter votre application à la liste des applications autorisées

### Solution 3: SMTP Hybride (Recommandée pour la Production)

**Problème**: Besoin d'envoyer vers des domaines internes et externes.

**Solution**:
Utilisez le service email amélioré qui peut gérer plusieurs SMTP:

```python
# Configuration pour emails internes
INTERNAL_SMTP = {
    'host': '172.16.0.25',
    'port': 25,
    'username': 'GHPportail@groupehdyrapahrm.com',
    'password': 'mot_de_passe_interne',
}

# Configuration pour emails externes
EXTERNAL_SMTP = {
    'host': 'smtp.gmail.com',
    'port': 587,
    'use_tls': True,
    'username': 'votre_email@gmail.com',
    'password': 'mot_de_passe_gmail',
}
```

### Solution 4: SMTP Externe Complet

**Problème**: Le SMTP interne ne peut pas être configuré pour les domaines externes.

**Solution**:
Utilisez un service SMTP externe (Gmail, Outlook, SendGrid, etc.):

```python
# Configuration Gmail
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_USE_TLS = True
EMAIL_PORT = 587
EMAIL_HOST_USER = 'votre_email@gmail.com'
EMAIL_HOST_PASSWORD = 'votre_mot_de_passe_app_gmail'
DEFAULT_FROM_EMAIL = 'votre_email@gmail.com'
```

## 🛠️ Étapes de Configuration

### Étape 1: Diagnostic

Exécutez le script de diagnostic:

```bash
python test_smtp_diagnosis.py
```

### Étape 2: Configuration des Credentials

1. **Pour SMTP Interne**:
   - Contactez votre IT pour obtenir les credentials
   - Ajoutez-les dans `settings.py`

2. **Pour SMTP Externe**:
   - Créez un compte Gmail/Outlook dédié
   - Activez l'authentification à 2 facteurs
   - Générez un mot de passe d'application

### Étape 3: Test de Configuration

```bash
# Test simple
python -c "
import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'projecttracker.settings')
django.setup()
from django.core.mail import send_mail
send_mail('Test', 'Message de test', 'GHPportail@groupehdyrapahrm.com', ['mohamed.bara@groupehdyrapahrm.com'])
print('Email envoyé!')
"
```

### Étape 4: Utilisation du Service Amélioré

Le service amélioré est déjà intégré et sera utilisé automatiquement. Il peut:
- Détecter automatiquement les domaines internes vs externes
- Utiliser le bon SMTP selon le destinataire
- Fournir un fallback en cas d'échec

## 📧 Configuration Recommandée pour la Production

### Option A: SMTP Interne avec Authentification

```python
# settings.py
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "172.16.0.25"
EMAIL_USE_TLS = False
EMAIL_PORT = 25
EMAIL_HOST_USER = 'GHPportail@groupehdyrapahrm.com'
EMAIL_HOST_PASSWORD = 'votre_mot_de_passe_smtp'
DEFAULT_FROM_EMAIL = 'GHPportail@groupehdyrapahrm.com'
SERVER_EMAIL = 'GHPportail@groupehdyrapahrm.com'
EMAIL_TIMEOUT = 30
```

### Option B: SMTP Externe (Gmail)

```python
# settings.py
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_USE_TLS = True
EMAIL_PORT = 587
EMAIL_HOST_USER = 'ghp.portail@gmail.com'
EMAIL_HOST_PASSWORD = 'votre_mot_de_passe_app'
DEFAULT_FROM_EMAIL = 'ghp.portail@gmail.com'
SERVER_EMAIL = 'ghp.portail@gmail.com'
EMAIL_TIMEOUT = 30
```

### Option C: Service Email Amélioré (Recommandé)

Le service amélioré est déjà configuré et peut gérer plusieurs SMTP automatiquement.

## 🔍 Dépannage

### Erreur: "5.7.1 Unable to relay"

**Causes possibles**:
1. Pas d'authentification SMTP
2. Serveur ne permet pas le relais vers des domaines externes
3. Adresse IP non autorisée

**Solutions**:
1. Ajoutez l'authentification SMTP
2. Contactez votre IT pour autoriser le relais
3. Utilisez un SMTP externe pour les domaines externes

### Erreur: "Authentication failed"

**Causes possibles**:
1. Mauvais nom d'utilisateur/mot de passe
2. Compte désactivé
3. Authentification à 2 facteurs non configurée

**Solutions**:
1. Vérifiez les credentials
2. Contactez votre IT
3. Configurez l'authentification à 2 facteurs

### Erreur: "Connection refused"

**Causes possibles**:
1. Serveur SMTP indisponible
2. Port bloqué par le firewall
3. Mauvaise adresse IP/port

**Solutions**:
1. Vérifiez la connectivité réseau
2. Contactez votre IT pour le firewall
3. Vérifiez l'adresse IP et le port

## 📞 Support

Si les problèmes persistent:

1. **Contactez votre administrateur IT** pour:
   - Configuration du serveur SMTP
   - Autorisation de relais
   - Credentials d'authentification

2. **Utilisez le service email amélioré** qui peut gérer plusieurs SMTP

3. **Considérez un SMTP externe** pour les emails externes

## 🚀 Prochaines Étapes

1. Exécutez `python test_smtp_diagnosis.py`
2. Configurez l'authentification SMTP
3. Testez l'envoi d'emails
4. Utilisez le service amélioré si nécessaire
5. Contactez votre IT si les problèmes persistent







