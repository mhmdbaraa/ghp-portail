# Système de Notification Email - GHP Portail

## 📧 Configuration

Le système de notification email est configuré pour utiliser le serveur SMTP interne de l'entreprise :

```python
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "172.16.0.25"
EMAIL_USE_TLS = False
EMAIL_PORT = 25
EMAIL_HOST_USER = ''
EMAIL_HOST_PASSWORD = ''
DEFAULT_FROM_EMAIL = 'GHPportail@groupehdyrapahrm.com'
SERVER_EMAIL = 'GHPportail@groupehdyrapahrm.com'
```

## 🏗️ Architecture

### Modèles

1. **EmailNotification** - Stocke les notifications email
2. **EmailTemplate** - Templates d'emails réutilisables
3. **EmailLog** - Logs des activités d'envoi

### Services

1. **EmailNotificationService** - Service principal pour les notifications
2. **ProjectNotificationService** - Service spécialisé pour les projets

## 🚀 Utilisation

### 1. Créer une notification simple

```python
from notifications.services import EmailNotificationService

service = EmailNotificationService()

notification = service.create_notification(
    recipient=user,
    subject="Nouvelle notification",
    message="Contenu de la notification",
    notification_type='system_alert',
    priority='medium'
)
```

### 2. Notifications de projet

```python
from notifications.services import ProjectNotificationService

project_service = ProjectNotificationService()

# Notifier la création d'un projet
project_service.notify_project_created(project, creator)

# Notifier la mise à jour d'un projet
project_service.notify_project_updated(project, updater)

# Notifier l'approche d'une échéance
project_service.notify_deadline_reminder(project, days_before=1)
```

### 3. Envoi en lot

```python
# Envoyer plusieurs notifications
notification_ids = [1, 2, 3, 4]
results = service.send_bulk_notifications(notification_ids)
```

### 4. Réessayer les notifications échouées

```python
# Réessayer les notifications échouées
results = service.retry_failed_notifications()
```

## 📋 Types de Notifications

- `project_created` - Projet créé
- `project_updated` - Projet mis à jour
- `project_deleted` - Projet supprimé
- `task_assigned` - Tâche assignée
- `task_completed` - Tâche terminée
- `deadline_reminder` - Rappel d'échéance
- `user_registered` - Utilisateur enregistré
- `system_alert` - Alerte système

## 🎯 Priorités

- `low` - Faible
- `medium` - Moyenne
- `high` - Élevée
- `urgent` - Urgente

## 📊 API Endpoints

### Notifications

- `GET /api/notifications/` - Lister les notifications
- `POST /api/notifications/` - Créer une notification
- `GET /api/notifications/{id}/` - Détails d'une notification
- `POST /api/notifications/send/` - Envoyer une notification
- `GET /api/notifications/stats/` - Statistiques
- `GET /api/notifications/user/` - Notifications de l'utilisateur

### Templates

- `GET /api/notifications/templates/` - Lister les templates
- `POST /api/notifications/templates/` - Créer un template
- `GET /api/notifications/templates/{id}/` - Détails d'un template

### Test

- `POST /api/notifications/test/` - Tester le système d'email

## 🧪 Tests

### Test simple (sans envoi d'email)

```bash
python test_notification_simple.py
```

### Test complet avec envoi

```bash
python test_email_send.py
```

### Test via Django management command

```bash
python manage.py test_email --email votre@email.com --type system_alert
```

## 📧 Templates Email

Les templates sont stockés dans `notifications/templates/notifications/emails/` :

- `base.html` - Template de base
- `project_created.html` - Projet créé
- `project_updated.html` - Projet mis à jour
- `deadline_reminder.html` - Rappel d'échéance
- `system_alert.html` - Alerte système

## 🔧 Configuration Avancée

### Variables d'environnement

```bash
# Configuration email
EMAIL_HOST=172.16.0.25
EMAIL_PORT=25
EMAIL_USE_TLS=False
DEFAULT_FROM_EMAIL=GHPportail@groupehdyrapahrm.com
```

### Logs

Les logs sont disponibles dans :
- `logs/django.log` - Logs généraux
- `logs/error.log` - Logs d'erreurs
- `logs/security.log` - Logs de sécurité

## 🚨 Dépannage

### Problèmes courants

1. **Connexion SMTP échouée**
   - Vérifiez que le serveur 172.16.0.25 est accessible
   - Vérifiez que le port 25 est ouvert
   - Testez la connectivité réseau

2. **Email non reçu**
   - Vérifiez les spams
   - Vérifiez l'adresse email
   - Consultez les logs d'erreur

3. **Erreur de template**
   - Vérifiez la syntaxe des templates
   - Vérifiez les variables disponibles

### Commandes de diagnostic

```bash
# Tester la connexion SMTP
python -c "
import smtplib
server = smtplib.SMTP('172.16.0.25', 25)
server.quit()
print('Connexion OK')
"

# Vérifier les notifications en base
python manage.py shell -c "
from notifications.models import EmailNotification
print(f'Total: {EmailNotification.objects.count()}')
print(f'En attente: {EmailNotification.objects.filter(status=\"pending\").count()}')
"
```

## 📈 Monitoring

### Statistiques

```python
from notifications.services import EmailNotificationService

service = EmailNotificationService()
stats = service.get_notification_stats()

print(f"Total: {stats['total']}")
print(f"En attente: {stats['pending']}")
print(f"Envoyées: {stats['sent']}")
print(f"Échouées: {stats['failed']}")
```

### Surveillance

- Surveillez les notifications échouées
- Vérifiez les logs d'erreur
- Contrôlez l'espace disque des logs
- Surveillez les performances SMTP

## 🔒 Sécurité

- Les emails sont envoyés via le serveur SMTP interne
- Pas d'authentification SMTP requise (réseau interne)
- Logs des activités d'envoi
- Gestion des erreurs et retry automatique

## 📞 Support

Pour toute question ou problème :
1. Consultez les logs d'erreur
2. Vérifiez la connectivité réseau
3. Contactez l'équipe technique
4. Consultez cette documentation
