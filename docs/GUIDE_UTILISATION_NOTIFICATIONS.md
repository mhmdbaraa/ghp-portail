# Guide d'Utilisation - Système de Notifications GHP Portail

## 🎯 Vue d'Ensemble

Le système de notifications GHP Portail est maintenant configuré pour utiliser **uniquement les domaines locaux**, éliminant les erreurs "Unable to relay" pour les domaines externes.

## 🏠 Configuration des Domaines Locaux

### Domaines Autorisés
- `groupehydrapharm.com`
- `ghp.com`
- `groupehdyrapahrm.com`
- `localhost`
- `local`
- `internal`

### Comportement
- ✅ **Emails locaux** : Envoyés normalement
- ❌ **Emails externes** : Automatiquement filtrés et ignorés (pas d'erreur)

## 📧 Services de Notification Disponibles

### 1. Service de Notification de Base
```python
from notifications.services import EmailNotificationService

service = EmailNotificationService()

# Créer une notification
notification = service.create_notification(
    recipient=user,
    subject="Sujet de la notification",
    message="Contenu du message",
    notification_type="system_alert",
    priority="medium",
    send_immediately=True
)
```

### 2. Service de Notification de Projet
```python
from notifications.services import ProjectNotificationService

service = ProjectNotificationService()

# Notifier la création d'un projet
service.notify_project_created(project, creator)

# Notifier l'approche d'une échéance
service.notify_project_deadline_approaching(project, days_before=3)

# Notifier qu'une échéance est atteinte
service.notify_project_deadline_reached(project)

# Notifier qu'un projet est en retard
service.notify_project_overdue(project, days_overdue=5)
```

### 3. Service de Notification de Tâche
```python
from notifications.services import TaskNotificationService

service = TaskNotificationService()

# Notifier la création d'une tâche
service.notify_task_created(task, creator)

# Notifier l'approche d'une échéance
service.notify_task_deadline_approaching(task, days_before=1)

# Notifier qu'une tâche est terminée
service.notify_task_completed(task, completer)
```

### 4. Services Spécialisés par Module
```python
# Finance
from notifications.services import FinanceNotificationService
finance_service = FinanceNotificationService()

# RH
from notifications.services import RHNotificationService
rh_service = RHNotificationService()

# Achat
from notifications.services import AchatNotificationService
achat_service = AchatNotificationService()

# Vente
from notifications.services import VenteNotificationService
vente_service = VenteNotificationService()

# Logistique
from notifications.services import LogistiqueNotificationService
logistique_service = LogistiqueNotificationService()

# Juridique
from notifications.services import JuridiqueNotificationService
juridique_service = JuridiqueNotificationService()

# Système
from notifications.services import SystemNotificationService
system_service = SystemNotificationService()
```

## ⏰ Système de Rappels Automatiques

### Configuration des Rappels

Le système de rappels est configuré avec les intervalles suivants :

**Projets :**
- Approche d'échéance : 30, 14, 7, 3, 1 jours avant
- En retard : 1, 3, 7, 14, 30 jours après

**Tâches :**
- Approche d'échéance : 14, 7, 3, 1 jours avant
- En retard : 1, 3, 7, 14 jours après

### Commandes de Rappels

#### 1. Envoyer les Rappels Automatiques
```bash
# Envoyer tous les rappels
python manage.py send_reminders

# Mode simulation (pas d'envoi réel)
python manage.py send_reminders --dry-run

# Forcer l'envoi même si déjà envoyé aujourd'hui
python manage.py send_reminders --force
```

#### 2. Utilisation Programmatique
```python
from notifications.reminder_service import ReminderService

service = ReminderService()

# Traiter tous les rappels
service.process_all_reminders()

# Traiter uniquement les rappels de projets
service.process_project_reminders()

# Traiter uniquement les rappels de tâches
service.process_task_reminders()

# Obtenir les statistiques
stats = service.get_reminder_stats()
print(f"Projets approchants: {stats['projects']['approaching']}")
print(f"Tâches en retard: {stats['tasks']['overdue']}")

# Envoyer un rappel immédiat
service.send_immediate_reminders(project_id=1)
service.send_immediate_reminders(task_id=1)
```

### Configuration Automatique

Pour automatiser les rappels, ajoutez une tâche cron ou un scheduler :

**Windows (Task Scheduler) :**
```batch
# Créer un fichier batch
@echo off
cd /d "C:\Users\mohamed.bara\Desktop\ghpp\project-tracker"
python manage.py send_reminders
```

**Linux/Mac (Cron) :**
```bash
# Exécuter tous les jours à 9h00
0 9 * * * cd /path/to/project && python manage.py send_reminders
```

## 🛠️ Scripts Utilitaires

### 1. Envoyer les Notifications en Attente
```bash
python send_pending_notifications.py
```

### 2. Tester la Configuration SMTP
```bash
python test_smtp_diagnosis.py
```

### 3. Tester les Domaines Locaux
```bash
python test_local_domain_config.py
```

### 4. Tester le Système Complet
```bash
python test_complete_notification_system.py
```

## 📊 Surveillance et Statistiques

### Obtenir les Statistiques
```python
from notifications.services import EmailNotificationService

service = EmailNotificationService()
stats = service.get_notification_stats()

print(f"Total: {stats['total']}")
print(f"En attente: {stats['pending']}")
print(f"Envoyées: {stats['sent']}")
print(f"Échouées: {stats['failed']}")
```

### Surveiller les Logs
```python
import logging

# Configurer le logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('notifications')

# Les logs incluent :
# - Création de notifications
# - Envoi d'emails
# - Filtrage des domaines externes
# - Erreurs et succès
```

## 🔧 Configuration Avancée

### Ajouter un Domaine Local
```python
from notifications.local_domain_service import LocalDomainEmailService

service = LocalDomainEmailService()
service.add_local_domain('nouveau-domaine.com')
```

### Personnaliser les Templates
```python
from notifications.models import EmailTemplate

# Créer un nouveau template
template = EmailTemplate.objects.create(
    name="Template Personnalisé",
    notification_type="custom_type",
    subject_template="[GHP] {{ subject }}",
    body_template="Bonjour {{ recipient.first_name }},\n\n{{ message }}",
    is_active=True
)
```

### Configuration des Priorités
```python
# Priorités disponibles
PRIORITIES = ['low', 'medium', 'high', 'urgent']

# Utilisation
service.create_notification(
    recipient=user,
    subject="Notification urgente",
    message="Contenu",
    notification_type="urgent_alert",
    priority="urgent"
)
```

## 🚨 Dépannage

### Problèmes Courants

1. **Notifications non envoyées**
   - Vérifiez que le destinataire a un domaine local
   - Consultez les logs pour les erreurs
   - Testez la configuration SMTP

2. **Rappels non fonctionnels**
   - Vérifiez que les projets/tâches ont des dates d'échéance
   - Exécutez `python manage.py send_reminders --dry-run`
   - Consultez les logs du service de rappels

3. **Templates non trouvés**
   - Vérifiez que les templates sont actifs
   - Créez des templates par défaut si nécessaire

### Commandes de Diagnostic
```bash
# Vérifier la configuration
python -c "from django.conf import settings; print('SMTP:', settings.EMAIL_HOST)"

# Tester l'envoi d'email
python -c "from django.core.mail import send_mail; send_mail('Test', 'Message', 'from@example.com', ['to@example.com'])"

# Vérifier les domaines locaux
python -c "from notifications.local_domain_service import LocalDomainEmailService; print(LocalDomainEmailService().local_domains)"
```

## 📈 Bonnes Pratiques

1. **Utilisation des Services**
   - Utilisez toujours les services spécialisés (ProjectNotificationService, etc.)
   - Évitez d'appeler directement EmailNotificationService

2. **Gestion des Erreurs**
   - Toujours gérer les exceptions lors de l'envoi
   - Logger les erreurs pour le débogage

3. **Performance**
   - Utilisez `send_immediately=False` pour les envois en lot
   - Traitez les notifications en arrière-plan

4. **Sécurité**
   - Ne jamais exposer les credentials SMTP
   - Utiliser des domaines locaux uniquement

## 🎯 Exemples d'Utilisation

### Intégration dans les Vues Django
```python
from django.shortcuts import render
from notifications.services import ProjectNotificationService

def create_project(request):
    if request.method == 'POST':
        project = Project.objects.create(...)
        
        # Notifier la création
        service = ProjectNotificationService()
        service.notify_project_created(project, request.user)
        
        return redirect('project_detail', project.id)
```

### Intégration dans les Signaux
```python
from django.db.models.signals import post_save
from django.dispatch import receiver
from notifications.services import TaskNotificationService

@receiver(post_save, sender=Task)
def notify_task_created(sender, instance, created, **kwargs):
    if created:
        service = TaskNotificationService()
        service.notify_task_created(instance, instance.created_by)
```

### Intégration dans les Commandes de Management
```python
from django.core.management.base import BaseCommand
from notifications.services import ProjectNotificationService

class Command(BaseCommand):
    def handle(self, *args, **options):
        service = ProjectNotificationService()
        # Votre logique de notification
```

## 📞 Support

Pour toute question ou problème :
1. Consultez les logs du système
2. Utilisez les scripts de diagnostic
3. Vérifiez la configuration des domaines locaux
4. Contactez l'équipe de développement

---

**Le système de notifications GHP Portail est maintenant opérationnel avec la configuration des domaines locaux !** 🎉









