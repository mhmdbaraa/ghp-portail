#!/usr/bin/env python
"""
Service email amélioré avec gestion des erreurs et fallback
"""
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from django.utils import timezone
from typing import List, Dict, Any, Optional
import json

logger = logging.getLogger(__name__)


class EnhancedEmailService:
    """
    Service email amélioré avec gestion des erreurs et fallback
    """
    
    def __init__(self):
        self.logger = logger
        self.smtp_configs = self._get_smtp_configs()
    
    def _get_smtp_configs(self) -> List[Dict[str, Any]]:
        """
        Obtenir les configurations SMTP disponibles
        """
        configs = [
            {
                'name': 'Internal SMTP',
                'host': '172.16.0.25',
                'port': 25,
                'use_tls': False,
                'use_ssl': False,
                'username': 'GHPportail@groupehdyrapahrm.com',
                'password': '',  # À configurer
                'from_email': 'GHPportail@groupehdyrapahrm.com',
                'priority': 1
            },
            {
                'name': 'Gmail SMTP',
                'host': 'smtp.gmail.com',
                'port': 587,
                'use_tls': True,
                'use_ssl': False,
                'username': '',  # À configurer
                'password': '',  # À configurer
                'from_email': '',  # À configurer
                'priority': 2
            },
            {
                'name': 'Outlook SMTP',
                'host': 'smtp-mail.outlook.com',
                'port': 587,
                'use_tls': True,
                'use_ssl': False,
                'username': '',  # À configurer
                'password': '',  # À configurer
                'from_email': '',  # À configurer
                'priority': 3
            }
        ]
        return configs
    
    def send_email_with_fallback(
        self,
        recipient_list: List[str],
        subject: str,
        body: str,
        html_body: Optional[str] = None,
        from_email: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Envoyer un email avec fallback automatique
        """
        result = {
            'success': False,
            'method_used': None,
            'error': None,
            'recipients_sent': [],
            'recipients_failed': []
        }
        
        # Trier les configurations par priorité
        sorted_configs = sorted(self.smtp_configs, key=lambda x: x['priority'])
        
        for config in sorted_configs:
            try:
                self.logger.info(f"Tentative d'envoi avec {config['name']}")
                
                if self._is_internal_domain(recipient_list[0]) and config['name'] == 'Internal SMTP':
                    # Pour les domaines internes, utiliser le SMTP interne
                    success = self._send_with_config(config, recipient_list, subject, body, html_body, from_email)
                elif not self._is_internal_domain(recipient_list[0]) and config['name'] != 'Internal SMTP':
                    # Pour les domaines externes, utiliser un SMTP externe
                    success = self._send_with_config(config, recipient_list, subject, body, html_body, from_email)
                else:
                    continue
                
                if success:
                    result['success'] = True
                    result['method_used'] = config['name']
                    result['recipients_sent'] = recipient_list
                    self.logger.info(f"Email envoyé avec succès via {config['name']}")
                    return result
                    
            except Exception as e:
                self.logger.warning(f"Échec avec {config['name']}: {str(e)}")
                result['error'] = str(e)
                continue
        
        # Si tous les SMTP ont échoué
        result['recipients_failed'] = recipient_list
        self.logger.error(f"Tous les SMTP ont échoué pour {recipient_list}")
        return result
    
    def _is_internal_domain(self, email: str) -> bool:
        """
        Vérifier si l'email est d'un domaine interne (local uniquement)
        """
        internal_domains = [
            'groupehydrapharm.com',
            'ghp.com',
            'groupehdyrapahrm.com',  # Domaine avec faute de frappe dans la config
            'localhost',
            'local'
        ]
        
        domain = email.split('@')[-1].lower()
        return domain in internal_domains
    
    def _send_with_config(
        self,
        config: Dict[str, Any],
        recipient_list: List[str],
        subject: str,
        body: str,
        html_body: Optional[str] = None,
        from_email: Optional[str] = None
    ) -> bool:
        """
        Envoyer un email avec une configuration spécifique
        """
        try:
            # Vérifier si la configuration est complète
            if not config['username'] or not config['password']:
                self.logger.warning(f"Configuration {config['name']} incomplète (username/password manquants)")
                return False
            
            # Créer le message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = from_email or config['from_email']
            msg['To'] = ', '.join(recipient_list)
            
            # Ajouter le contenu texte
            text_part = MIMEText(body, 'plain', 'utf-8')
            msg.attach(text_part)
            
            # Ajouter le contenu HTML si disponible
            if html_body:
                html_part = MIMEText(html_body, 'html', 'utf-8')
                msg.attach(html_part)
            
            # Connexion SMTP
            if config['use_ssl']:
                server = smtplib.SMTP_SSL(config['host'], config['port'])
            else:
                server = smtplib.SMTP(config['host'], config['port'])
            
            # Authentification
            server.login(config['username'], config['password'])
            
            # Envoi
            server.send_message(msg)
            server.quit()
            
            return True
            
        except Exception as e:
            self.logger.error(f"Erreur lors de l'envoi avec {config['name']}: {str(e)}")
            return False
    
    def send_email_django_fallback(
        self,
        recipient_list: List[str],
        subject: str,
        body: str,
        html_body: Optional[str] = None,
        from_email: Optional[str] = None
    ) -> bool:
        """
        Envoyer un email en utilisant Django avec gestion d'erreur améliorée
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
    
    def test_smtp_connection(self, config: Dict[str, Any]) -> bool:
        """
        Tester la connexion SMTP
        """
        try:
            if config['use_ssl']:
                server = smtplib.SMTP_SSL(config['host'], config['port'])
            else:
                server = smtplib.SMTP(config['host'], config['port'])
            
            if config['use_tls']:
                server.starttls()
            
            if config['username'] and config['password']:
                server.login(config['username'], config['password'])
            
            server.quit()
            return True
            
        except Exception as e:
            self.logger.error(f"Test SMTP échoué pour {config['name']}: {str(e)}")
            return False
    
    def get_available_smtp_configs(self) -> List[Dict[str, Any]]:
        """
        Obtenir les configurations SMTP disponibles et testées
        """
        available_configs = []
        
        for config in self.smtp_configs:
            if self.test_smtp_connection(config):
                available_configs.append(config)
        
        return available_configs


# =============================================================================
# INTÉGRATION AVEC LE SERVICE DE NOTIFICATION EXISTANT
# =============================================================================

class EnhancedEmailNotificationService:
    """
    Service de notification amélioré utilisant le service email amélioré
    """
    
    def __init__(self):
        self.email_service = EnhancedEmailService()
        self.logger = logger
    
    def send_notification_enhanced(
        self,
        recipient_list: List[str],
        subject: str,
        body: str,
        html_body: Optional[str] = None,
        from_email: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Envoyer une notification avec le service amélioré
        """
        # Essayer d'abord avec le service amélioré
        result = self.email_service.send_email_with_fallback(
            recipient_list=recipient_list,
            subject=subject,
            body=body,
            html_body=html_body,
            from_email=from_email
        )
        
        # Si échec, essayer avec Django
        if not result['success']:
            self.logger.warning("Fallback vers Django email service")
            django_success = self.email_service.send_email_django_fallback(
                recipient_list=recipient_list,
                subject=subject,
                body=body,
                html_body=html_body,
                from_email=from_email
            )
            
            if django_success:
                result['success'] = True
                result['method_used'] = 'Django Fallback'
                result['recipients_sent'] = recipient_list
        
        return result
