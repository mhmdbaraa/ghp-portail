#!/usr/bin/env python
"""
Service de notification configuré pour les domaines locaux uniquement
"""
import logging
from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from django.utils import timezone
from typing import List, Dict, Any, Optional
from .models import EmailNotification, EmailLog

logger = logging.getLogger(__name__)


class LocalDomainEmailService:
    """
    Service email configuré pour les domaines locaux uniquement
    """
    
    def __init__(self):
        self.logger = logger
        self.local_domains = self._get_local_domains()
    
    def _get_local_domains(self) -> List[str]:
        """
        Obtenir la liste des domaines locaux autorisés
        """
        return [
            'groupehydrapharm.com',
            'ghp.com',
            'groupehdyrapahrm.com',  # Domaine avec faute de frappe dans la config
            'localhost',
            'local',
            'internal'
        ]
    
    def is_local_domain(self, email: str) -> bool:
        """
        Vérifier si l'email est d'un domaine local
        """
        if not email or '@' not in email:
            return False
            
        domain = email.split('@')[-1].lower()
        return domain in self.local_domains
    
    def filter_local_recipients(self, recipient_list: List[str]) -> Dict[str, List[str]]:
        """
        Filtrer les destinataires pour ne garder que les domaines locaux
        """
        local_recipients = []
        external_recipients = []
        
        for email in recipient_list:
            if self.is_local_domain(email):
                local_recipients.append(email)
            else:
                external_recipients.append(email)
        
        return {
            'local': local_recipients,
            'external': external_recipients
        }
    
    def send_email_local_only(
        self,
        recipient_list: List[str],
        subject: str,
        body: str,
        html_body: Optional[str] = None,
        from_email: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Envoyer un email uniquement aux domaines locaux
        """
        result = {
            'success': False,
            'local_sent': [],
            'external_skipped': [],
            'error': None
        }
        
        # Filtrer les destinataires
        filtered = self.filter_local_recipients(recipient_list)
        
        if not filtered['local']:
            result['error'] = "Aucun destinataire local trouvé"
            result['external_skipped'] = filtered['external']
            self.logger.warning(f"Aucun destinataire local pour: {recipient_list}")
            return result
        
        # Avertir pour les domaines externes ignorés
        if filtered['external']:
            self.logger.info(f"Domaines externes ignorés: {filtered['external']}")
            result['external_skipped'] = filtered['external']
        
        try:
            # Envoyer uniquement aux domaines locaux
            success = self._send_email_django(
                recipient_list=filtered['local'],
                subject=subject,
                body=body,
                html_body=html_body,
                from_email=from_email
            )
            
            if success:
                result['success'] = True
                result['local_sent'] = filtered['local']
                self.logger.info(f"Email envoyé aux domaines locaux: {filtered['local']}")
            else:
                result['error'] = "Échec de l'envoi via Django"
                
        except Exception as e:
            result['error'] = str(e)
            self.logger.error(f"Erreur lors de l'envoi: {str(e)}")
        
        return result
    
    def _send_email_django(
        self,
        recipient_list: List[str],
        subject: str,
        body: str,
        html_body: Optional[str] = None,
        from_email: Optional[str] = None
    ) -> bool:
        """
        Envoyer un email via Django (domaines locaux uniquement)
        """
        try:
            # Utiliser EmailMultiAlternatives pour supporter HTML
            email = EmailMultiAlternatives(
                subject=subject,
                body=body,
                from_email=from_email or settings.DEFAULT_FROM_EMAIL,
                to=recipient_list
            )
            
            # Ajouter une version HTML si disponible
            if html_body:
                email.attach_alternative(html_body, "text/html")
            
            # Envoyer l'email
            email.send()
            return True
            
        except Exception as e:
            self.logger.error(f"Erreur Django email: {str(e)}")
            return False


class LocalDomainNotificationService:
    """
    Service de notification configuré pour les domaines locaux uniquement
    """
    
    def __init__(self):
        self.email_service = LocalDomainEmailService()
        self.logger = logger
    
    def send_notification_local_only(
        self,
        recipient_list: List[str],
        subject: str,
        body: str,
        html_body: Optional[str] = None,
        from_email: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Envoyer une notification uniquement aux domaines locaux
        """
        # Filtrer les destinataires
        filtered = self.email_service.filter_local_recipients(recipient_list)
        
        if not filtered['local']:
            self.logger.warning(f"Aucun destinataire local trouvé dans: {recipient_list}")
            return {
                'success': False,
                'local_sent': [],
                'external_skipped': filtered['external'],
                'error': 'Aucun destinataire local'
            }
        
        # Envoyer aux domaines locaux
        result = self.email_service.send_email_local_only(
            recipient_list=recipient_list,
            subject=subject,
            body=body,
            html_body=html_body,
            from_email=from_email
        )
        
        return result
    
    def create_notification_local_only(
        self,
        recipient,
        subject: str,
        message: str,
        notification_type: str,
        priority: str = 'medium',
        send_immediately: bool = True,
        related_object_id: Optional[int] = None,
        related_object_type: Optional[str] = None
    ) -> Optional[EmailNotification]:
        """
        Créer une notification uniquement si le destinataire est local
        """
        # Vérifier si le destinataire est local
        if not self.email_service.is_local_domain(recipient.email):
            self.logger.warning(f"Destinataire externe ignoré: {recipient.email}")
            return None
        
        try:
            notification = EmailNotification.objects.create(
                recipient=recipient,
                subject=subject,
                message=message,
                notification_type=notification_type,
                priority=priority,
                send_immediately=send_immediately,
                related_object_id=related_object_id,
                related_object_type=related_object_type
            )
            
            # Log de création
            EmailLog.objects.create(
                notification=notification,
                action='created',
                details=f"Notification créée pour {recipient.email} (domaine local)"
            )
            
            self.logger.info(f"Notification créée pour domaine local: {notification.id} pour {recipient.email}")
            
            # Envoyer immédiatement si demandé
            if send_immediately:
                self.send_notification_local_only(
                    recipient_list=[recipient.email],
                    subject=subject,
                    body=message,
                    from_email=settings.DEFAULT_FROM_EMAIL
                )
                
            return notification
            
        except Exception as e:
            self.logger.error(f"Erreur lors de la création de la notification: {str(e)}")
            return None
    
    def get_local_domains(self) -> List[str]:
        """
        Obtenir la liste des domaines locaux
        """
        return self.email_service.local_domains
    
    def add_local_domain(self, domain: str):
        """
        Ajouter un domaine local
        """
        domain = domain.lower()
        if domain not in self.email_service.local_domains:
            self.email_service.local_domains.append(domain)
            self.logger.info(f"Domaine local ajouté: {domain}")
    
    def remove_local_domain(self, domain: str):
        """
        Supprimer un domaine local
        """
        domain = domain.lower()
        if domain in self.email_service.local_domains:
            self.email_service.local_domains.remove(domain)
            self.logger.info(f"Domaine local supprimé: {domain}")


# =============================================================================
# FONCTION UTILITAIRE POUR FACILITER L'UTILISATION
# =============================================================================

def get_local_domain_service() -> LocalDomainNotificationService:
    """
    Obtenir le service de notification pour domaines locaux
    """
    return LocalDomainNotificationService()







