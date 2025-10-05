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
    ) -> EmailNotification:
        """
        Créer une nouvelle notification email
        """
        try:
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
                details=f"Notification créée pour {recipient.email}"
            )
            
            self.logger.info(f"Notification créée: {notification.id} pour {recipient.email}")
            
            # Envoyer immédiatement si demandé
            if send_immediately:
                self.send_notification(notification.id)
                
            return notification
            
        except Exception as e:
            self.logger.error(f"Erreur lors de la création de la notification: {str(e)}")
            raise

    def send_notification(self, notification_id: int) -> bool:
        """
        Envoyer une notification email
        """
        try:
            notification = EmailNotification.objects.get(id=notification_id)
            
            if not notification.is_ready_to_send():
                self.logger.warning(f"Notification {notification_id} pas prête à être envoyée")
                return False
            
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
        Envoyer l'email via SMTP
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
            html_body = self._convert_to_html(body)
            email.attach_alternative(html_body, "text/html")
            
            # Envoyer l'email
            email.send()
            
            return True
            
        except Exception as e:
            self.logger.error(f"Erreur lors de l'envoi de l'email: {str(e)}")
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


class ProjectNotificationService:
    """
    Service spécialisé pour les notifications liées aux projets
    """
    
    def __init__(self):
        self.email_service = EmailNotificationService()
    
    def notify_project_created(self, project, creator):
        """
        Notifier la création d'un projet
        """
        subject = f"Nouveau projet créé: {project.name}"
        message = f"""
        Un nouveau projet a été créé:
        
        Nom: {project.name}
        Description: {project.description or 'Aucune description'}
        Créé par: {creator.get_full_name() or creator.username}
        Date de création: {project.created_at.strftime('%d/%m/%Y %H:%M')}
        
        Vous pouvez consulter le projet dans le portail GHP.
        """
        
        # Notifier tous les utilisateurs du projet
        for member in project.members.all():
            self.email_service.create_notification(
                recipient=member,
                subject=subject,
                message=message,
                notification_type='project_created',
                priority='medium',
                related_object_id=project.id,
                related_object_type='project'
            )
    
    def notify_project_updated(self, project, updater):
        """
        Notifier la mise à jour d'un projet
        """
        subject = f"Projet mis à jour: {project.name}"
        message = f"""
        Le projet "{project.name}" a été mis à jour:
        
        Modifié par: {updater.get_full_name() or updater.username}
        Date de modification: {timezone.now().strftime('%d/%m/%Y %H:%M')}
        
        Consultez les modifications dans le portail GHP.
        """
        
        for member in project.members.all():
            self.email_service.create_notification(
                recipient=member,
                subject=subject,
                message=message,
                notification_type='project_updated',
                priority='low',
                related_object_id=project.id,
                related_object_type='project'
            )
    
    def notify_deadline_reminder(self, project, days_before=1):
        """
        Notifier l'approche d'une échéance
        """
        subject = f"Rappel d'échéance: {project.name}"
        message = f"""
        Attention! L'échéance du projet "{project.name}" approche.
        
        Échéance: {project.deadline.strftime('%d/%m/%Y')}
        Jours restants: {days_before}
        
        Veuillez vérifier l'avancement du projet.
        """
        
        for member in project.members.all():
            self.email_service.create_notification(
                recipient=member,
                subject=subject,
                message=message,
                notification_type='deadline_reminder',
                priority='high',
                related_object_id=project.id,
                related_object_type='project'
            )
