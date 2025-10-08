import logging
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from django.db import transaction
from .models import EmailNotification, EmailTemplate, EmailLog
from typing import List, Dict, Any, Optional
import json

logger = logging.getLogger(__name__)


class EmailNotificationService:
    """
    Service pour gérer l'envoi de notifications email
    """
    
    def __init__(self):
        self.logger = logger

    def create_notification(
        self,
        recipient,
        subject: str,
        message: str,
        notification_type: str,
        priority: str = 'medium',
        send_immediately: bool = True,
        scheduled_send_time: Optional[timezone.datetime] = None,
        related_object_id: Optional[int] = None,
        related_object_type: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Optional[EmailNotification]:
        """
        Créer une nouvelle notification email (domaines locaux uniquement)
        """
        try:
            # Vérifier si le destinataire est d'un domaine local
            from .local_domain_service import LocalDomainEmailService
            local_service = LocalDomainEmailService()
            
            if not local_service.is_local_domain(recipient.email):
                self.logger.warning(f"Destinataire externe ignoré: {recipient.email}")
                return None
            
            notification = EmailNotification.objects.create(
                recipient=recipient,
                subject=subject,
                message=message,
                notification_type=notification_type,
                priority=priority,
                send_immediately=send_immediately,
                scheduled_send_time=scheduled_send_time,
                related_object_id=related_object_id,
                related_object_type=related_object_type
            )
            
            # Log de création
            EmailLog.objects.create(
                notification=notification,
                action='created',
                details=f"Notification créée pour {recipient.email} (domaine local)"
            )
            
            self.logger.info(f"Notification créée: {notification.id} pour {recipient.email} (domaine local)")
            
            # Envoyer immédiatement si demandé
            if send_immediately:
                self.send_notification(notification.id)
                
            return notification
            
        except Exception as e:
            self.logger.error(f"Erreur lors de la création de la notification: {str(e)}")
            return None

    def send_notification(self, notification_id: int) -> bool:
        """
        Envoyer une notification email
        """
        try:
            notification = EmailNotification.objects.get(id=notification_id)
            
            # Forcer l'envoi pour toutes les notifications
            # if not notification.is_ready_to_send():
            #     self.logger.warning(f"Notification {notification_id} pas prête à être envoyée")
            #     return False
            
            # Préparer le contexte pour le template
            context = {
                'recipient': notification.recipient,
                'subject': notification.subject,
                'message': notification.message,
                'notification_type': notification.notification_type,
                'site_url': getattr(settings, 'SITE_URL', 'http://localhost:8000'),
                'company_name': 'Groupe Hydrapharm',
            }
            
            # Rendre le template si disponible
            try:
                template = EmailTemplate.objects.get(
                    notification_type=notification.notification_type,
                    is_active=True
                )
                subject = self._render_template(template.subject_template, context)
                body = self._render_template(template.body_template, context)
            except EmailTemplate.DoesNotExist:
                subject = notification.subject
                body = notification.message
            
            # Envoyer l'email
            success = self._send_email(
                recipient_list=[notification.recipient.email],
                subject=subject,
                body=body,
                notification=notification
            )
            
            if success:
                notification.mark_as_sent()
                EmailLog.objects.create(
                    notification=notification,
                    action='sent',
                    details="Email envoyé avec succès"
                )
                self.logger.info(f"Notification {notification_id} envoyée avec succès")
            else:
                notification.mark_as_failed("Échec de l'envoi de l'email")
                EmailLog.objects.create(
                    notification=notification,
                    action='failed',
                    details="Échec de l'envoi de l'email"
                )
                self.logger.error(f"Échec de l'envoi de la notification {notification_id}")
            
            return success
            
        except EmailNotification.DoesNotExist:
            self.logger.error(f"Notification {notification_id} introuvable")
            return False
        except Exception as e:
            self.logger.error(f"Erreur lors de l'envoi de la notification {notification_id}: {str(e)}")
            return False

    def _send_email(
        self,
        recipient_list: List[str],
        subject: str,
        body: str,
        notification: EmailNotification
    ) -> bool:
        """
        Envoyer l'email uniquement aux domaines locaux
        """
        try:
            # Utiliser le service de domaines locaux uniquement
            from .local_domain_service import LocalDomainNotificationService
            local_service = LocalDomainNotificationService()
            
            html_body = self._convert_to_html(body)
            
            result = local_service.send_notification_local_only(
                recipient_list=recipient_list,
                subject=subject,
                body=body,
                html_body=html_body,
                from_email=settings.DEFAULT_FROM_EMAIL
            )
            
            if result['success']:
                self.logger.info(f"Email envoyé aux domaines locaux: {result['local_sent']}")
                if result['external_skipped']:
                    self.logger.info(f"Domaines externes ignorés: {result['external_skipped']}")
                return True
            else:
                self.logger.error(f"Échec envoi domaines locaux: {result['error']}")
                return False
            
        except Exception as e:
            self.logger.error(f"Erreur lors de l'envoi de l'email: {str(e)}")
            return False
    
    def _send_email_django_fallback(
        self,
        recipient_list: List[str],
        subject: str,
        body: str,
        html_body: str
    ) -> bool:
        """
        Méthode de fallback utilisant Django standard
        """
        try:
            # Utiliser EmailMultiAlternatives pour supporter HTML
            email = EmailMultiAlternatives(
                subject=subject,
                body=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=recipient_list
            )
            
            # Ajouter une version HTML si nécessaire
            email.attach_alternative(html_body, "text/html")
            
            # Envoyer l'email
            email.send()
            
            return True
            
        except Exception as e:
            self.logger.error(f"Erreur lors de l'envoi de l'email (fallback Django): {str(e)}")
            return False

    def _render_template(self, template_string: str, context: Dict[str, Any]) -> str:
        """
        Rendre un template avec le contexte
        """
        try:
            from django.template import Template, Context
            template = Template(template_string)
            return template.render(Context(context))
        except Exception as e:
            self.logger.error(f"Erreur lors du rendu du template: {str(e)}")
            return template_string

    def _convert_to_html(self, text: str) -> str:
        """
        Convertir le texte en HTML basique
        """
        html = text.replace('\n', '<br>')
        html = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .header {{ background-color: #f8f9fa; padding: 20px; border-bottom: 1px solid #dee2e6; }}
                .content {{ padding: 20px; }}
                .footer {{ background-color: #f8f9fa; padding: 20px; border-top: 1px solid #dee2e6; font-size: 12px; color: #6c757d; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h2>GHP Portail - Notification</h2>
            </div>
            <div class="content">
                {html}
            </div>
            <div class="footer">
                <p>Ce message a été envoyé automatiquement par le système GHP Portail.</p>
                <p>Groupe Hydrapharm - Système de gestion de projets</p>
            </div>
        </body>
        </html>
        """
        return html

    def send_bulk_notifications(self, notification_ids: List[int]) -> Dict[str, int]:
        """
        Envoyer plusieurs notifications en lot
        """
        results = {'success': 0, 'failed': 0}
        
        for notification_id in notification_ids:
            try:
                success = self.send_notification(notification_id)
                if success:
                    results['success'] += 1
                else:
                    results['failed'] += 1
            except Exception as e:
                self.logger.error(f"Erreur lors de l'envoi de la notification {notification_id}: {str(e)}")
                results['failed'] += 1
        
        return results

    def retry_failed_notifications(self) -> Dict[str, int]:
        """
        Réessayer les notifications échouées
        """
        from django.db import models
        failed_notifications = EmailNotification.objects.filter(
            status='failed'
        ).exclude(
            retry_count__gte=models.F('max_retries')
        )
        
        results = {'success': 0, 'failed': 0}
        
        for notification in failed_notifications:
            try:
                success = self.send_notification(notification.id)
                if success:
                    results['success'] += 1
                else:
                    results['failed'] += 1
            except Exception as e:
                self.logger.error(f"Erreur lors de la retry de la notification {notification.id}: {str(e)}")
                results['failed'] += 1
        
        return results

    def get_notification_stats(self) -> Dict[str, Any]:
        """
        Obtenir les statistiques des notifications
        """
        from django.db.models import Count
        
        stats = {
            'total': EmailNotification.objects.count(),
            'pending': EmailNotification.objects.filter(status='pending').count(),
            'sent': EmailNotification.objects.filter(status='sent').count(),
            'failed': EmailNotification.objects.filter(status='failed').count(),
            'delivered': EmailNotification.objects.filter(status='delivered').count(),
        }
        
        # Statistiques par type
        stats['by_type'] = dict(
            EmailNotification.objects.values('notification_type')
            .annotate(count=Count('id'))
            .values_list('notification_type', 'count')
        )
        
        # Statistiques par priorité
        stats['by_priority'] = dict(
            EmailNotification.objects.values('priority')
            .annotate(count=Count('id'))
            .values_list('priority', 'count')
        )
        
        return stats


# =============================================================================
# SERVICES SPÉCIALISÉS POUR CHAQUE MODULE GHP PORTAIL
# =============================================================================

class ModuleNotificationService:
    """
    Service de base pour les notifications de modules
    """
    
    def __init__(self, module_name: str):
        self.module_name = module_name
        self.email_service = EmailNotificationService()
    
    def notify_generic(
        self,
        recipients,
        subject: str,
        message: str,
        notification_type: str,
        priority: str = 'medium',
        related_object_id: Optional[int] = None,
        related_object_type: Optional[str] = None,
        send_immediately: bool = False
    ):
        """
        Notification générique pour n'importe quel module (domaines locaux uniquement)
        """
        if not isinstance(recipients, list):
            recipients = [recipients]
        
        # Filtrer les destinataires locaux
        from .local_domain_service import LocalDomainEmailService
        local_service = LocalDomainEmailService()
        
        local_recipients = []
        external_recipients = []
        
        for recipient in recipients:
            if local_service.is_local_domain(recipient.email):
                local_recipients.append(recipient)
            else:
                external_recipients.append(recipient)
        
        # Avertir pour les destinataires externes ignorés
        if external_recipients:
            external_emails = [r.email for r in external_recipients]
            self.logger.info(f"Destinataires externes ignorés pour {self.module_name}: {external_emails}")
        
        notifications = []
        for recipient in local_recipients:
            notification = self.email_service.create_notification(
                recipient=recipient,
                subject=f"[{self.module_name.upper()}] {subject}",
                message=message,
                notification_type=notification_type,
                priority=priority,
                related_object_id=related_object_id,
                related_object_type=related_object_type,
                send_immediately=send_immediately
            )
            if notification:  # Peut être None si le destinataire est externe
                notifications.append(notification)
        
        return notifications


class ProjectNotificationService(ModuleNotificationService):
    """
    Service spécialisé pour les notifications liées aux projets
    """
    
    def __init__(self):
        super().__init__("PROJETS")
    
    def notify_project_created(self, project, creator):
        """
        Notifier la création d'un projet
        """
        subject = f"🎉 Nouveau projet créé: {project.name}"
        message = f"""
        Un nouveau projet a été créé dans le portail GHP:
        
        📋 **Détails du projet:**
        • Nom: {project.name}
        • Description: {project.description or 'Aucune description'}
        • Créé par: {creator.get_full_name() or creator.username}
        • Date de création: {project.created_at.strftime('%d/%m/%Y à %H:%M')}
        • Échéance: {project.deadline.strftime('%d/%m/%Y') if hasattr(project, 'deadline') and project.deadline else 'Non définie'}
        
        👥 **Équipe du projet:**
        {self._format_project_team(project)}
        
        🔗 **Accès direct:** Vous pouvez accéder au projet directement depuis cette notification.
        """
        
        # Notifier tous les membres du projet
        recipients = []
        
        # Vérifier si le projet a un champ members
        if hasattr(project, 'members'):
            if hasattr(project.members, 'all'):
                recipients = list(project.members.all())
            else:
                recipients = list(project.members)
        
        # Ajouter le manager si pas déjà dans la liste
        if hasattr(project, 'manager') and project.manager and project.manager not in recipients:
            recipients.append(project.manager)
        
        # Ajouter le créateur si pas déjà dans la liste
        if creator not in recipients:
            recipients.append(creator)
            
        for member in recipients:
            self.notify_generic(
                recipients=[member],
                subject=subject,
                message=message,
                notification_type='project_created',
                priority='medium',
                related_object_id=project.id,
                related_object_type='project',
                send_immediately=False
            )
    
    def notify_project_updated(self, project, updater, changes=None):
        """
        Notifier la mise à jour d'un projet
        """
        subject = f"📝 Projet mis à jour: {project.name}"
        message = f"""
        Le projet "{project.name}" a été modifié:
        
        👤 **Modifié par:** {updater.get_full_name() or updater.username}
        📅 **Date de modification:** {timezone.now().strftime('%d/%m/%Y à %H:%M')}
        
        {f'📋 **Changements apportés:**' + chr(10) + self._format_changes(changes) if changes else ''}
        
        🔗 **Accès direct:** Consultez les modifications dans le portail GHP.
        """
        
        # Notifier tous les membres du projet
        recipients = []
        
        # Vérifier si le projet a un champ members
        if hasattr(project, 'members'):
            if hasattr(project.members, 'all'):
                recipients = list(project.members.all())
            else:
                recipients = list(project.members)
        
        # Ajouter le manager si pas déjà dans la liste
        if hasattr(project, 'manager') and project.manager and project.manager not in recipients:
            recipients.append(project.manager)
        
        for member in recipients:
            self.notify_generic(
                recipients=[member],
                subject=subject,
                message=message,
                notification_type='project_updated',
                priority='low',
                related_object_id=project.id,
                related_object_type='project',
                send_immediately=False
            )
    
    def notify_project_comment(self, project, comment, commenter):
        """
        Notifier un nouveau commentaire sur un projet
        """
        subject = f"💬 Nouveau commentaire sur: {project.name}"
        message = f"""
        Un nouveau commentaire a été ajouté au projet "{project.name}":
        
        👤 **Auteur:** {commenter.get_full_name() or commenter.username}
        📅 **Date:** {timezone.now().strftime('%d/%m/%Y à %H:%M')}
        💬 **Commentaire:** {comment}
        
        🔗 **Accès direct:** Consultez le commentaire dans le portail GHP.
        """
        
        # Notifier tous les membres du projet
        recipients = []
        
        # Vérifier si le projet a un champ members
        if hasattr(project, 'members'):
            if hasattr(project.members, 'all'):
                recipients = list(project.members.all())
            else:
                recipients = list(project.members)
        
        # Ajouter le manager si pas déjà dans la liste
        if hasattr(project, 'manager') and project.manager and project.manager not in recipients:
            recipients.append(project.manager)
        
        for member in recipients:
            if member != commenter:  # Ne pas notifier l'auteur du commentaire
                self.notify_generic(
                    recipients=[member],
                    subject=subject,
                    message=message,
                    notification_type='project_comment',
                    priority='low',
                    related_object_id=project.id,
                    related_object_type='project',
                    send_immediately=False
                )
    
    def notify_project_deadline_approaching(self, project, days_before):
        """
        Notifier l'approche d'une échéance de projet
        """
        priority = 'urgent' if days_before <= 1 else 'high' if days_before <= 3 else 'medium'
        emoji = '🚨' if days_before <= 1 else '⚠️' if days_before <= 3 else '📅'
        
        subject = f"{emoji} Rappel échéance projet: {project.name}"
        message = f"""
        {emoji} **Attention!** L'échéance du projet "{project.name}" approche.
        
        📅 **Échéance:** {project.deadline.strftime('%d/%m/%Y')}
        ⏰ **Jours restants:** {days_before} jour{'s' if days_before > 1 else ''}
        📊 **Statut:** {getattr(project, 'status', 'En cours')}
        
        👥 **Chef de projet:** {getattr(project, 'project_manager', {}).get('name', 'Non assigné') if hasattr(project, 'project_manager') else 'Non assigné'}
        
        🔗 **Action requise:** Vérifiez l'avancement du projet et prenez les mesures nécessaires.
        """
        
        # Notifier tous les membres du projet
        recipients = []
        
        # Vérifier si le projet a un champ members
        if hasattr(project, 'members'):
            if hasattr(project.members, 'all'):
                recipients = list(project.members.all())
            else:
                recipients = list(project.members)
        
        # Ajouter le manager si pas déjà dans la liste
        if hasattr(project, 'manager') and project.manager and project.manager not in recipients:
            recipients.append(project.manager)
        
        for member in recipients:
            self.notify_generic(
                recipients=[member],
                subject=subject,
                message=message,
                notification_type='project_deadline_approaching',
                priority=priority,
                related_object_id=project.id,
                related_object_type='project',
                send_immediately=False
            )
    
    def notify_project_deadline_reached(self, project):
        """
        Notifier que l'échéance du projet est atteinte
        """
        subject = f"⏰ Échéance atteinte: {project.name}"
        message = f"""
        ⏰ **L'échéance du projet "{project.name}" est atteinte aujourd'hui!**
        
        📅 **Date d'échéance:** {project.deadline.strftime('%d/%m/%Y')}
        📊 **Statut actuel:** {getattr(project, 'status', 'En cours')}
        
        👥 **Chef de projet:** {getattr(project, 'project_manager', {}).get('name', 'Non assigné') if hasattr(project, 'project_manager') else 'Non assigné'}
        
        🔗 **Action urgente:** Vérifiez immédiatement l'état du projet et mettez à jour le statut.
        """
        
        # Notifier tous les membres du projet
        recipients = []
        
        # Vérifier si le projet a un champ members
        if hasattr(project, 'members'):
            if hasattr(project.members, 'all'):
                recipients = list(project.members.all())
            else:
                recipients = list(project.members)
        
        # Ajouter le manager si pas déjà dans la liste
        if hasattr(project, 'manager') and project.manager and project.manager not in recipients:
            recipients.append(project.manager)
        
        for member in recipients:
            self.notify_generic(
                recipients=[member],
                subject=subject,
                message=message,
                notification_type='project_deadline_reached',
                priority='urgent',
                related_object_id=project.id,
                related_object_type='project',
                send_immediately=False
            )
    
    def notify_project_overdue(self, project, days_overdue):
        """
        Notifier qu'un projet est en retard
        """
        subject = f"🚨 Projet en retard: {project.name}"
        message = f"""
        🚨 **URGENT!** Le projet "{project.name}" est en retard.
        
        📅 **Échéance prévue:** {project.deadline.strftime('%d/%m/%Y')}
        ⏰ **Retard:** {days_overdue} jour{'s' if days_overdue > 1 else ''}
        📊 **Statut:** {getattr(project, 'status', 'En cours')}
        
        👥 **Chef de projet:** {getattr(project, 'project_manager', {}).get('name', 'Non assigné') if hasattr(project, 'project_manager') else 'Non assigné'}
        
        🔗 **Action immédiate:** Contactez l'équipe et prenez des mesures correctives.
        """
        
        # Notifier tous les membres du projet
        recipients = []
        
        # Vérifier si le projet a un champ members
        if hasattr(project, 'members'):
            if hasattr(project.members, 'all'):
                recipients = list(project.members.all())
            else:
                recipients = list(project.members)
        
        # Ajouter le manager si pas déjà dans la liste
        if hasattr(project, 'manager') and project.manager and project.manager not in recipients:
            recipients.append(project.manager)
        
        for member in recipients:
            self.notify_generic(
                recipients=[member],
                subject=subject,
                message=message,
                notification_type='project_overdue',
                priority='urgent',
                related_object_id=project.id,
                related_object_type='project',
                send_immediately=False
            )
    
    def _format_project_team(self, project):
        """Formater l'équipe du projet"""
        team_members = []
        
        # Vérifier si le projet a un champ members
        if hasattr(project, 'members'):
            # Gérer les cas où members est une liste ou un QuerySet
            if hasattr(project.members, 'all'):
                # QuerySet Django
                members = project.members.all()
            else:
                # Liste Python
                members = project.members
            
            for member in members:
                role = getattr(member, 'role_in_project', 'Membre')
                team_members.append(f"• {member.get_full_name() or member.username} ({role})")
        else:
            # Si pas de champ members, utiliser le manager
            if hasattr(project, 'manager') and project.manager:
                team_members.append(f"• {project.manager.get_full_name() or project.manager.username} (Chef de projet)")
        
        return '\n'.join(team_members) if team_members else "• Aucun membre assigné"
    
    def _format_changes(self, changes):
        """Formater les changements"""
        if not changes:
            return ""
        change_list = []
        for field, (old_value, new_value) in changes.items():
            change_list.append(f"• {field}: {old_value} → {new_value}")
        return '\n'.join(change_list)


class TaskNotificationService(ModuleNotificationService):
    """
    Service spécialisé pour les notifications liées aux tâches
    """
    
    def __init__(self):
        super().__init__("TÂCHES")
    
    def notify_task_created(self, task, creator):
        """
        Notifier la création d'une tâche
        """
        subject = f"📋 Nouvelle tâche créée: {task.title}"
        message = f"""
        Une nouvelle tâche a été créée:
        
        📋 **Détails de la tâche:**
        • Titre: {task.title}
        • Description: {task.description or 'Aucune description'}
        • Créée par: {creator.get_full_name() or creator.username}
        • Date de création: {task.created_at.strftime('%d/%m/%Y à %H:%M')}
        • Échéance: {task.due_date.strftime('%d/%m/%Y') if hasattr(task, 'due_date') and task.due_date else 'Non définie'}
        • Priorité: {getattr(task, 'priority', 'Moyenne')}
        
        👤 **Assigné à:** {task.assigned_to.get_full_name() if hasattr(task, 'assigned_to') and task.assigned_to else 'Non assigné'}
        📁 **Projet:** {task.project.name if hasattr(task, 'project') and task.project else 'Aucun projet'}
        
        🔗 **Accès direct:** Vous pouvez accéder à la tâche directement depuis cette notification.
        """
        
        # Notifier l'assigné et le créateur
        recipients = []
        if hasattr(task, 'assigned_to') and task.assigned_to:
            recipients.append(task.assigned_to)
        if creator not in recipients:
            recipients.append(creator)
        
        # Notifier aussi le chef de projet si différent
        if hasattr(task, 'project') and task.project and hasattr(task.project, 'project_manager'):
            if task.project.project_manager and task.project.project_manager not in recipients:
                recipients.append(task.project.project_manager)
        
        for recipient in recipients:
            self.notify_generic(
                recipients=[recipient],
                subject=subject,
                message=message,
                notification_type='task_created',
                priority='medium',
                related_object_id=task.id,
                related_object_type='task',
                send_immediately=False
            )
    
    def notify_task_updated(self, task, updater, changes=None):
        """
        Notifier la mise à jour d'une tâche
        """
        subject = f"📝 Tâche mise à jour: {task.title}"
        message = f"""
        La tâche "{task.title}" a été modifiée:
        
        👤 **Modifié par:** {updater.get_full_name() or updater.username}
        📅 **Date de modification:** {timezone.now().strftime('%d/%m/%Y à %H:%M')}
        
        {f'📋 **Changements apportés:**' + chr(10) + self._format_task_changes(changes) if changes else ''}
        
        🔗 **Accès direct:** Consultez les modifications dans le portail GHP.
        """
        
        # Notifier l'assigné et le créateur
        recipients = []
        if hasattr(task, 'assigned_to') and task.assigned_to:
            recipients.append(task.assigned_to)
        if hasattr(task, 'created_by') and task.created_by:
            recipients.append(task.created_by)
        
        for recipient in recipients:
            self.notify_generic(
                recipients=[recipient],
                subject=subject,
                message=message,
                notification_type='task_updated',
                priority='low',
                related_object_id=task.id,
                related_object_type='task',
                send_immediately=False
            )
    
    def notify_task_deadline_approaching(self, task, days_before):
        """
        Notifier l'approche d'une échéance de tâche
        """
        priority = 'urgent' if days_before <= 1 else 'high' if days_before <= 3 else 'medium'
        emoji = '🚨' if days_before <= 1 else '⚠️' if days_before <= 3 else '📅'
        
        subject = f"{emoji} Rappel échéance tâche: {task.title}"
        message = f"""
        {emoji} **Attention!** L'échéance de la tâche "{task.title}" approche.
        
        📅 **Échéance:** {task.due_date.strftime('%d/%m/%Y') if hasattr(task, 'due_date') and task.due_date else 'Non définie'}
        ⏰ **Jours restants:** {days_before} jour{'s' if days_before > 1 else ''}
        📊 **Statut:** {getattr(task, 'status', 'En cours')}
        👤 **Assigné à:** {task.assigned_to.get_full_name() if hasattr(task, 'assigned_to') and task.assigned_to else 'Non assigné'}
        
        🔗 **Action requise:** Vérifiez l'avancement de la tâche et prenez les mesures nécessaires.
        """
        
        # Notifier l'assigné
        if hasattr(task, 'assigned_to') and task.assigned_to:
            self.notify_generic(
                recipients=[task.assigned_to],
                subject=subject,
                message=message,
                notification_type='task_deadline_approaching',
                priority=priority,
                related_object_id=task.id,
                related_object_type='task',
                send_immediately=False
            )
    
    def notify_task_deadline_reached(self, task):
        """
        Notifier que l'échéance de la tâche est atteinte
        """
        subject = f"⏰ Échéance atteinte: {task.title}"
        message = f"""
        ⏰ **L'échéance de la tâche "{task.title}" est atteinte aujourd'hui!**
        
        📅 **Date d'échéance:** {task.due_date.strftime('%d/%m/%Y') if hasattr(task, 'due_date') and task.due_date else 'Non définie'}
        📊 **Statut actuel:** {getattr(task, 'status', 'En cours')}
        👤 **Assigné à:** {task.assigned_to.get_full_name() if hasattr(task, 'assigned_to') and task.assigned_to else 'Non assigné'}
        
        🔗 **Action urgente:** Vérifiez immédiatement l'état de la tâche et mettez à jour le statut.
        """
        
        # Notifier l'assigné
        if hasattr(task, 'assigned_to') and task.assigned_to:
            self.notify_generic(
                recipients=[task.assigned_to],
                subject=subject,
                message=message,
                notification_type='task_deadline_reached',
                priority='urgent',
                related_object_id=task.id,
                related_object_type='task',
                send_immediately=False
            )
    
    def notify_task_overdue(self, task, days_overdue):
        """
        Notifier qu'une tâche est en retard
        """
        subject = f"🚨 Tâche en retard: {task.title}"
        message = f"""
        🚨 **URGENT!** La tâche "{task.title}" est en retard.
        
        📅 **Échéance prévue:** {task.due_date.strftime('%d/%m/%Y') if hasattr(task, 'due_date') and task.due_date else 'Non définie'}
        ⏰ **Retard:** {days_overdue} jour{'s' if days_overdue > 1 else ''}
        📊 **Statut:** {getattr(task, 'status', 'En cours')}
        👤 **Assigné à:** {task.assigned_to.get_full_name() if hasattr(task, 'assigned_to') and task.assigned_to else 'Non assigné'}
        
        🔗 **Action immédiate:** Contactez l'assigné et prenez des mesures correctives.
        """
        
        # Notifier l'assigné et le chef de projet
        recipients = []
        if hasattr(task, 'assigned_to') and task.assigned_to:
            recipients.append(task.assigned_to)
        if hasattr(task, 'project') and task.project and hasattr(task.project, 'project_manager'):
            if task.project.project_manager and task.project.project_manager not in recipients:
                recipients.append(task.project.project_manager)
        
        for recipient in recipients:
            self.notify_generic(
                recipients=[recipient],
                subject=subject,
                message=message,
                notification_type='task_overdue',
                priority='urgent',
                related_object_id=task.id,
                related_object_type='task',
                send_immediately=False
            )
    
    def notify_task_completed(self, task, completer):
        """
        Notifier qu'une tâche est terminée
        """
        subject = f"✅ Tâche terminée: {task.title}"
        message = f"""
        ✅ **Félicitations!** La tâche "{task.title}" a été terminée.
        
        👤 **Terminée par:** {completer.get_full_name() or completer.username}
        📅 **Date de completion:** {timezone.now().strftime('%d/%m/%Y à %H:%M')}
        📊 **Statut:** Terminée
        
        🔗 **Accès direct:** Consultez les détails de la tâche terminée.
        """
        
        # Notifier le créateur et le chef de projet
        recipients = []
        if hasattr(task, 'created_by') and task.created_by:
            recipients.append(task.created_by)
        if hasattr(task, 'project') and task.project and hasattr(task.project, 'project_manager'):
            if task.project.project_manager and task.project.project_manager not in recipients:
                recipients.append(task.project.project_manager)
        
        for recipient in recipients:
            self.notify_generic(
                recipients=[recipient],
                subject=subject,
                message=message,
                notification_type='task_completed',
                priority='medium',
                related_object_id=task.id,
                related_object_type='task',
                send_immediately=False
            )
    
    def _format_task_changes(self, changes):
        """Formater les changements de tâche"""
        if not changes:
            return ""
        change_list = []
        for field, (old_value, new_value) in changes.items():
            change_list.append(f"• {field}: {old_value} → {new_value}")
        return '\n'.join(change_list)


class FinanceNotificationService(ModuleNotificationService):
    """
    Service pour les notifications du module Finance
    """
    
    def __init__(self):
        super().__init__("FINANCE")
    
    def notify_budget_alert(self, budget, amount, threshold):
        """
        Notifier un dépassement de budget
        """
        subject = f"Alerte budget: {budget.name}"
        message = f"""
        Alerte de dépassement de budget:
        
        Budget: {budget.name}
        Montant actuel: {amount}
        Seuil d'alerte: {threshold}
        Dépassement: {amount - threshold}
        
        Veuillez vérifier les dépenses du budget.
        """
        
        # Notifier les responsables financiers
        recipients = budget.responsible_users.all()
        self.notify_generic(
            recipients=recipients,
            subject=subject,
            message=message,
            notification_type='budget_alert',
            priority='high',
            related_object_id=budget.id,
            related_object_type='budget'
        )
    
    def notify_payment_approved(self, payment, approver):
        """
        Notifier l'approbation d'un paiement
        """
        subject = f"Paiement approuvé: {payment.reference}"
        message = f"""
        Un paiement a été approuvé:
        
        Référence: {payment.reference}
        Montant: {payment.amount}
        Bénéficiaire: {payment.beneficiary}
        Approuvé par: {approver.get_full_name() or approver.username}
        
        Le paiement peut maintenant être traité.
        """
        
        self.notify_generic(
            recipients=[payment.requester],
            subject=subject,
            message=message,
            notification_type='payment_approved',
            priority='medium',
            related_object_id=payment.id,
            related_object_type='payment'
        )


class RHNotificationService(ModuleNotificationService):
    """
    Service pour les notifications du module RH
    """
    
    def __init__(self):
        super().__init__("RH")
    
    def notify_leave_request(self, leave_request, manager):
        """
        Notifier une demande de congé
        """
        subject = f"Demande de congé: {leave_request.employee.get_full_name()}"
        message = f"""
        Nouvelle demande de congé:
        
        Employé: {leave_request.employee.get_full_name()}
        Type: {leave_request.leave_type}
        Période: {leave_request.start_date} au {leave_request.end_date}
        Durée: {leave_request.duration} jour(s)
        
        Veuillez traiter cette demande.
        """
        
        self.notify_generic(
            recipients=[manager],
            subject=subject,
            message=message,
            notification_type='leave_request',
            priority='medium',
            related_object_id=leave_request.id,
            related_object_type='leave_request'
        )
    
    def notify_leave_approved(self, leave_request, approver):
        """
        Notifier l'approbation d'un congé
        """
        subject = f"Congé approuvé: {leave_request.employee.get_full_name()}"
        message = f"""
        Votre demande de congé a été approuvée:
        
        Période: {leave_request.start_date} au {leave_request.end_date}
        Durée: {leave_request.duration} jour(s)
        Approuvé par: {approver.get_full_name() or approver.username}
        
        Vous pouvez maintenant prendre vos congés.
        """
        
        self.notify_generic(
            recipients=[leave_request.employee],
            subject=subject,
            message=message,
            notification_type='leave_approved',
            priority='low',
            related_object_id=leave_request.id,
            related_object_type='leave_request'
        )


class AchatNotificationService(ModuleNotificationService):
    """
    Service pour les notifications du module Achat
    """
    
    def __init__(self):
        super().__init__("ACHAT")
    
    def notify_purchase_request(self, purchase_request, approver):
        """
        Notifier une demande d'achat
        """
        subject = f"Demande d'achat: {purchase_request.reference}"
        message = f"""
        Nouvelle demande d'achat:
        
        Référence: {purchase_request.reference}
        Fournisseur: {purchase_request.supplier}
        Montant: {purchase_request.total_amount}
        Demandeur: {purchase_request.requester.get_full_name()}
        
        Veuillez traiter cette demande.
        """
        
        self.notify_generic(
            recipients=[approver],
            subject=subject,
            message=message,
            notification_type='purchase_request',
            priority='medium',
            related_object_id=purchase_request.id,
            related_object_type='purchase_request'
        )
    
    def notify_purchase_approved(self, purchase_request, approver):
        """
        Notifier l'approbation d'un achat
        """
        subject = f"Achat approuvé: {purchase_request.reference}"
        message = f"""
        Votre demande d'achat a été approuvée:
        
        Référence: {purchase_request.reference}
        Fournisseur: {purchase_request.supplier}
        Montant: {purchase_request.total_amount}
        Approuvé par: {approver.get_full_name() or approver.username}
        
        La commande peut maintenant être passée.
        """
        
        self.notify_generic(
            recipients=[purchase_request.requester],
            subject=subject,
            message=message,
            notification_type='purchase_approved',
            priority='medium',
            related_object_id=purchase_request.id,
            related_object_type='purchase_request'
        )


class VenteNotificationService(ModuleNotificationService):
    """
    Service pour les notifications du module Vente
    """
    
    def __init__(self):
        super().__init__("VENTE")
    
    def notify_new_lead(self, lead, sales_team):
        """
        Notifier un nouveau prospect
        """
        subject = f"Nouveau prospect: {lead.company_name}"
        message = f"""
        Nouveau prospect ajouté:
        
        Entreprise: {lead.company_name}
        Contact: {lead.contact_name}
        Email: {lead.email}
        Téléphone: {lead.phone}
        Source: {lead.source}
        
        Veuillez contacter ce prospect.
        """
        
        self.notify_generic(
            recipients=sales_team,
            subject=subject,
            message=message,
            notification_type='new_lead',
            priority='medium',
            related_object_id=lead.id,
            related_object_type='lead'
        )
    
    def notify_deal_won(self, deal, team):
        """
        Notifier un deal gagné
        """
        subject = f"Deal gagné: {deal.name}"
        message = f"""
        Félicitations! Un deal a été gagné:
        
        Deal: {deal.name}
        Client: {deal.client}
        Valeur: {deal.value}
        Probabilité: {deal.probability}%
        
        Excellent travail!
        """
        
        self.notify_generic(
            recipients=team,
            subject=subject,
            message=message,
            notification_type='deal_won',
            priority='high',
            related_object_id=deal.id,
            related_object_type='deal'
        )


class LogistiqueNotificationService(ModuleNotificationService):
    """
    Service pour les notifications du module Logistique
    """
    
    def __init__(self):
        super().__init__("LOGISTIQUE")
    
    def notify_delivery_scheduled(self, delivery, recipient):
        """
        Notifier une livraison programmée
        """
        subject = f"Livraison programmée: {delivery.reference}"
        message = f"""
        Une livraison a été programmée:
        
        Référence: {delivery.reference}
        Destinataire: {delivery.recipient_name}
        Adresse: {delivery.delivery_address}
        Date prévue: {delivery.scheduled_date}
        Transporteur: {delivery.carrier}
        
        Veuillez préparer la réception.
        """
        
        self.notify_generic(
            recipients=[recipient],
            subject=subject,
            message=message,
            notification_type='delivery_scheduled',
            priority='medium',
            related_object_id=delivery.id,
            related_object_type='delivery'
        )
    
    def notify_stock_alert(self, product, current_stock, min_stock):
        """
        Notifier un stock faible
        """
        subject = f"Alerte stock: {product.name}"
        message = f"""
        Alerte de stock faible:
        
        Produit: {product.name}
        Stock actuel: {current_stock}
        Stock minimum: {min_stock}
        Déficit: {min_stock - current_stock}
        
        Veuillez réapprovisionner.
        """
        
        # Notifier les responsables logistiques
        recipients = product.responsible_users.all()
        self.notify_generic(
            recipients=recipients,
            subject=subject,
            message=message,
            notification_type='stock_alert',
            priority='high',
            related_object_id=product.id,
            related_object_type='product'
        )


class JuridiqueNotificationService(ModuleNotificationService):
    """
    Service pour les notifications du module Juridique
    """
    
    def __init__(self):
        super().__init__("JURIDIQUE")
    
    def notify_contract_expiry(self, contract, days_before=30):
        """
        Notifier l'expiration d'un contrat
        """
        subject = f"Contrat expirant: {contract.name}"
        message = f"""
        Attention! Un contrat expire bientôt:
        
        Contrat: {contract.name}
        Partie: {contract.party}
        Date d'expiration: {contract.expiry_date}
        Jours restants: {days_before}
        
        Veuillez renouveler ou négocier le contrat.
        """
        
        # Notifier les responsables juridiques
        recipients = contract.responsible_users.all()
        self.notify_generic(
            recipients=recipients,
            subject=subject,
            message=message,
            notification_type='contract_expiry',
            priority='high',
            related_object_id=contract.id,
            related_object_type='contract'
        )
    
    def notify_legal_document_ready(self, document, requester):
        """
        Notifier qu'un document juridique est prêt
        """
        subject = f"Document prêt: {document.name}"
        message = f"""
        Votre document juridique est prêt:
        
        Document: {document.name}
        Type: {document.document_type}
        Date de création: {document.created_at.strftime('%d/%m/%Y')}
        
        Vous pouvez le télécharger depuis le portail.
        """
        
        self.notify_generic(
            recipients=[requester],
            subject=subject,
            message=message,
            notification_type='legal_document_ready',
            priority='medium',
            related_object_id=document.id,
            related_object_type='legal_document'
        )


class SystemNotificationService(ModuleNotificationService):
    """
    Service pour les notifications système
    """
    
    def __init__(self):
        super().__init__("SYSTÈME")
    
    def notify_system_maintenance(self, maintenance, users):
        """
        Notifier une maintenance système
        """
        subject = f"Maintenance système: {maintenance.title}"
        message = f"""
        Maintenance système programmée:
        
        Titre: {maintenance.title}
        Description: {maintenance.description}
        Date de début: {maintenance.start_date}
        Date de fin: {maintenance.end_date}
        Impact: {maintenance.impact_level}
        
        Le système sera indisponible pendant cette période.
        """
        
        self.notify_generic(
            recipients=users,
            subject=subject,
            message=message,
            notification_type='system_maintenance',
            priority='high',
            related_object_id=maintenance.id,
            related_object_type='maintenance'
        )
    
    def notify_security_alert(self, alert, security_team):
        """
        Notifier une alerte de sécurité
        """
        subject = f"Alerte sécurité: {alert.title}"
        message = f"""
        Alerte de sécurité détectée:
        
        Titre: {alert.title}
        Description: {alert.description}
        Niveau: {alert.severity}
        Date: {alert.detected_at.strftime('%d/%m/%Y %H:%M')}
        
        Veuillez traiter cette alerte immédiatement.
        """
        
        self.notify_generic(
            recipients=security_team,
            subject=subject,
            message=message,
            notification_type='security_alert',
            priority='urgent',
            related_object_id=alert.id,
            related_object_type='security_alert'
        )


# =============================================================================
# FONCTION UTILITAIRE POUR FACILITER L'UTILISATION
# =============================================================================

def get_notification_service(module_name: str) -> ModuleNotificationService:
    """
    Obtenir le service de notification pour un module spécifique
    """
    services = {
        'projects': ProjectNotificationService,
        'finance': FinanceNotificationService,
        'rh': RHNotificationService,
        'achat': AchatNotificationService,
        'vente': VenteNotificationService,
        'logistique': LogistiqueNotificationService,
        'juridique': JuridiqueNotificationService,
        'system': SystemNotificationService,
    }
    
    service_class = services.get(module_name.lower())
    if service_class:
        return service_class()
    else:
        # Service générique pour modules non spécifiés
        return ModuleNotificationService(module_name.upper())