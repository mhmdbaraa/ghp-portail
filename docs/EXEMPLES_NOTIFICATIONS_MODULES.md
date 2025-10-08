# Exemples d'Utilisation du Système de Notification - Tous les Modules GHP Portail

## 🏗️ Architecture Modulaire

Le système de notification est conçu pour être utilisé dans **tous les modules** du GHP Portail :

- **PROJETS** - Gestion de projets et tâches
- **FINANCE** - Gestion financière et budgets
- **RH** - Ressources humaines et congés
- **ACHAT** - Gestion des achats et fournisseurs
- **VENTE** - Gestion commerciale et prospects
- **LOGISTIQUE** - Gestion des stocks et livraisons
- **JURIDIQUE** - Gestion des contrats et documents
- **SYSTÈME** - Notifications système et sécurité

## 🚀 Utilisation dans Chaque Module

### 1. Module PROJETS

```python
from notifications.services import ProjectNotificationService

# Initialiser le service
project_service = ProjectNotificationService()

# Notifier la création d'un projet
project_service.notify_project_created(project, creator)

# Notifier la mise à jour d'un projet
project_service.notify_project_updated(project, updater)

# Notifier l'approche d'une échéance
project_service.notify_deadline_reminder(project, days_before=3)
```

### 2. Module FINANCE

```python
from notifications.services import FinanceNotificationService

# Initialiser le service
finance_service = FinanceNotificationService()

# Notifier un dépassement de budget
finance_service.notify_budget_alert(budget, current_amount, threshold)

# Notifier l'approbation d'un paiement
finance_service.notify_payment_approved(payment, approver)
```

### 3. Module RH

```python
from notifications.services import RHNotificationService

# Initialiser le service
rh_service = RHNotificationService()

# Notifier une demande de congé
rh_service.notify_leave_request(leave_request, manager)

# Notifier l'approbation d'un congé
rh_service.notify_leave_approved(leave_request, approver)
```

### 4. Module ACHAT

```python
from notifications.services import AchatNotificationService

# Initialiser le service
achat_service = AchatNotificationService()

# Notifier une demande d'achat
achat_service.notify_purchase_request(purchase_request, approver)

# Notifier l'approbation d'un achat
achat_service.notify_purchase_approved(purchase_request, approver)
```

### 5. Module VENTE

```python
from notifications.services import VenteNotificationService

# Initialiser le service
vente_service = VenteNotificationService()

# Notifier un nouveau prospect
vente_service.notify_new_lead(lead, sales_team)

# Notifier un deal gagné
vente_service.notify_deal_won(deal, team)
```

### 6. Module LOGISTIQUE

```python
from notifications.services import LogistiqueNotificationService

# Initialiser le service
logistique_service = LogistiqueNotificationService()

# Notifier une livraison programmée
logistique_service.notify_delivery_scheduled(delivery, recipient)

# Notifier un stock faible
logistique_service.notify_stock_alert(product, current_stock, min_stock)
```

### 7. Module JURIDIQUE

```python
from notifications.services import JuridiqueNotificationService

# Initialiser le service
juridique_service = JuridiqueNotificationService()

# Notifier l'expiration d'un contrat
juridique_service.notify_contract_expiry(contract, days_before=30)

# Notifier qu'un document est prêt
juridique_service.notify_legal_document_ready(document, requester)
```

### 8. Module SYSTÈME

```python
from notifications.services import SystemNotificationService

# Initialiser le service
system_service = SystemNotificationService()

# Notifier une maintenance système
system_service.notify_system_maintenance(maintenance, users)

# Notifier une alerte de sécurité
system_service.notify_security_alert(alert, security_team)
```

## 🔧 Utilisation Générique

Pour les modules non spécifiés ou les notifications personnalisées :

```python
from notifications.services import get_notification_service

# Obtenir le service pour un module spécifique
service = get_notification_service('mon_module')

# Ou utiliser directement le service générique
from notifications.services import ModuleNotificationService
service = ModuleNotificationService("MON_MODULE")

# Créer une notification personnalisée
service.notify_generic(
    recipients=[user1, user2],
    subject="Ma notification personnalisée",
    message="Contenu de la notification",
    notification_type='custom_notification',
    priority='medium',
    related_object_id=123,
    related_object_type='my_object'
)
```

## 📋 Types de Notifications par Module

### PROJETS
- `project_created` - Projet créé
- `project_updated` - Projet mis à jour
- `project_deleted` - Projet supprimé
- `task_assigned` - Tâche assignée
- `task_completed` - Tâche terminée
- `deadline_reminder` - Rappel d'échéance

### FINANCE
- `budget_alert` - Alerte budget
- `payment_approved` - Paiement approuvé
- `invoice_ready` - Facture prête
- `expense_approved` - Dépense approuvée

### RH
- `leave_request` - Demande de congé
- `leave_approved` - Congé approuvé
- `performance_review` - Évaluation
- `training_reminder` - Rappel formation

### ACHAT
- `purchase_request` - Demande d'achat
- `purchase_approved` - Achat approuvé
- `supplier_alert` - Alerte fournisseur
- `contract_renewal` - Renouvellement contrat

### VENTE
- `new_lead` - Nouveau prospect
- `deal_won` - Deal gagné
- `deal_lost` - Deal perdu
- `quotation_ready` - Devis prêt

### LOGISTIQUE
- `delivery_scheduled` - Livraison programmée
- `stock_alert` - Alerte stock
- `inventory_update` - Mise à jour inventaire
- `shipping_ready` - Expédition prête

### JURIDIQUE
- `contract_expiry` - Contrat expirant
- `legal_document_ready` - Document prêt
- `compliance_alert` - Alerte conformité
- `legal_review` - Révision juridique

### SYSTÈME
- `system_maintenance` - Maintenance système
- `security_alert` - Alerte sécurité
- `backup_completed` - Sauvegarde terminée
- `system_error` - Erreur système

## 🎯 Intégration dans les Vues Django

### Exemple d'intégration dans une vue de création de projet

```python
from django.shortcuts import render
from notifications.services import ProjectNotificationService

def create_project(request):
    if request.method == 'POST':
        # Créer le projet
        project = Project.objects.create(
            name=request.POST['name'],
            description=request.POST['description'],
            # ... autres champs
        )
        
        # Notifier la création
        project_service = ProjectNotificationService()
        project_service.notify_project_created(project, request.user)
        
        return redirect('project_detail', project.id)
    
    return render(request, 'create_project.html')
```

### Exemple d'intégration dans une vue d'approbation

```python
from notifications.services import FinanceNotificationService

def approve_payment(request, payment_id):
    payment = Payment.objects.get(id=payment_id)
    payment.status = 'approved'
    payment.approved_by = request.user
    payment.save()
    
    # Notifier l'approbation
    finance_service = FinanceNotificationService()
    finance_service.notify_payment_approved(payment, request.user)
    
    return redirect('payments_list')
```

## 🔄 Intégration avec les Signaux Django

### Exemple de signal pour notifications automatiques

```python
from django.db.models.signals import post_save
from django.dispatch import receiver
from notifications.services import get_notification_service

@receiver(post_save, sender=Project)
def notify_project_created(sender, instance, created, **kwargs):
    if created:
        service = get_notification_service('projects')
        service.notify_project_created(instance, instance.created_by)

@receiver(post_save, sender=LeaveRequest)
def notify_leave_request(sender, instance, created, **kwargs):
    if created:
        service = get_notification_service('rh')
        service.notify_leave_request(instance, instance.employee.manager)
```

## 📊 Monitoring et Statistiques

### Obtenir les statistiques par module

```python
from notifications.services import EmailNotificationService

service = EmailNotificationService()
stats = service.get_notification_stats()

# Statistiques par type (module)
print("Notifications par module:")
for notification_type, count in stats['by_type'].items():
    print(f"  {notification_type}: {count}")
```

### Filtrer les notifications par module

```python
from notifications.models import EmailNotification

# Notifications du module finance
finance_notifications = EmailNotification.objects.filter(
    notification_type__in=['budget_alert', 'payment_approved', 'invoice_ready']
)

# Notifications du module RH
rh_notifications = EmailNotification.objects.filter(
    notification_type__in=['leave_request', 'leave_approved', 'performance_review']
)
```

## 🧪 Tests par Module

### Test des notifications finance

```python
def test_finance_notifications():
    from notifications.services import FinanceNotificationService
    
    service = FinanceNotificationService()
    
    # Test alerte budget
    service.notify_budget_alert(
        budget=budget_obj,
        amount=50000,
        threshold=40000
    )
    
    # Test approbation paiement
    service.notify_payment_approved(
        payment=payment_obj,
        approver=approver_user
    )
```

### Test des notifications RH

```python
def test_rh_notifications():
    from notifications.services import RHNotificationService
    
    service = RHNotificationService()
    
    # Test demande congé
    service.notify_leave_request(
        leave_request=leave_obj,
        manager=manager_user
    )
```

## 🎨 Personnalisation des Templates

### Template pour module finance

```html
<!-- notifications/templates/notifications/emails/finance_budget_alert.html -->
{% extends "notifications/emails/base.html" %}

{% block title %}Alerte Budget - GHP Portail{% endblock %}

{% block content %}
<div class="highlight priority-high">
    <h2>💰 Alerte Budget</h2>
    <p><strong>Budget:</strong> {{ budget_name }}</p>
    <p><strong>Montant actuel:</strong> {{ current_amount }}</p>
    <p><strong>Seuil:</strong> {{ threshold }}</p>
</div>
{% endblock %}
```

## 🔧 Configuration Avancée

### Variables d'environnement par module

```bash
# Configuration des notifications par module
NOTIFICATIONS_FINANCE_ENABLED=true
NOTIFICATIONS_RH_ENABLED=true
NOTIFICATIONS_ACHAT_ENABLED=true
NOTIFICATIONS_VENTE_ENABLED=true
NOTIFICATIONS_LOGISTIQUE_ENABLED=true
NOTIFICATIONS_JURIDIQUE_ENABLED=true
NOTIFICATIONS_SYSTEM_ENABLED=true
```

### Permissions par module

```python
# Dans les modèles de permissions
class NotificationPermission:
    FINANCE_NOTIFICATIONS = 'notifications.finance'
    RH_NOTIFICATIONS = 'notifications.rh'
    ACHAT_NOTIFICATIONS = 'notifications.achat'
    # ... autres modules
```

## 📈 Métriques et Reporting

### Dashboard des notifications par module

```python
def get_module_notifications_stats():
    modules = ['finance', 'rh', 'achat', 'vente', 'logistique', 'juridique', 'system']
    stats = {}
    
    for module in modules:
        service = get_notification_service(module)
        module_stats = service.get_notification_stats()
        stats[module] = module_stats
    
    return stats
```

## 🚀 Déploiement

### Migration des données existantes

```python
# Script de migration pour ajouter les notifications aux modules existants
def migrate_existing_data():
    # Migrer les projets existants
    for project in Project.objects.all():
        service = ProjectNotificationService()
        service.notify_project_created(project, project.created_by)
    
    # Migrer les demandes de congé existantes
    for leave in LeaveRequest.objects.all():
        service = RHNotificationService()
        service.notify_leave_request(leave, leave.employee.manager)
```

Ce système de notification modulaire permet d'utiliser les notifications dans **tous les modules** du GHP Portail de manière cohérente et standardisée ! 🎉

