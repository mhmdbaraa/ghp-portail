#!/usr/bin/env python
"""
Script de test pour vérifier la configuration email
"""
import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'projecttracker.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone


def test_email_configuration():
    """Tester la configuration email"""
    print("🧪 Test de la configuration email GHP Portail")
    print("=" * 50)
    
    # Afficher la configuration
    print(f"📧 Configuration email:")
    print(f"   Backend: {settings.EMAIL_BACKEND}")
    print(f"   Host: {settings.EMAIL_HOST}")
    print(f"   Port: {settings.EMAIL_PORT}")
    print(f"   TLS: {settings.EMAIL_USE_TLS}")
    print(f"   From: {settings.DEFAULT_FROM_EMAIL}")
    print(f"   Server: {settings.SERVER_EMAIL}")
    print()
    
    # Test d'envoi d'email
    try:
        print("📤 Test d'envoi d'email...")
        
        subject = "🧪 Test Configuration Email - GHP Portail"
        message = f"""
        Ceci est un email de test pour vérifier la configuration email du système GHP Portail.
        
        Détails du test:
        - Date: {timezone.now().strftime('%d/%m/%Y %H:%M:%S')}
        - Serveur SMTP: {settings.EMAIL_HOST}:{settings.EMAIL_PORT}
        - TLS: {'Activé' if settings.EMAIL_USE_TLS else 'Désactivé'}
        - Expéditeur: {settings.DEFAULT_FROM_EMAIL}
        
        Si vous recevez cet email, la configuration fonctionne correctement!
        
        Configuration utilisée:
        EMAIL_BACKEND = "{settings.EMAIL_BACKEND}"
        EMAIL_HOST = "{settings.EMAIL_HOST}"
        EMAIL_PORT = {settings.EMAIL_PORT}
        EMAIL_USE_TLS = {settings.EMAIL_USE_TLS}
        DEFAULT_FROM_EMAIL = "{settings.DEFAULT_FROM_EMAIL}"
        
        Cordialement,
        L'équipe GHP Portail
        """
        
        # Demander l'email de test
        test_email = input("📧 Entrez votre email pour le test (ou appuyez sur Entrée pour utiliser test@example.com): ").strip()
        if not test_email:
            test_email = "test@example.com"
        
        print(f"📤 Envoi vers: {test_email}")
        
        # Envoyer l'email
        result = send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[test_email],
            fail_silently=False
        )
        
        if result:
            print("✅ Email envoyé avec succès!")
            print(f"📧 Vérifiez votre boîte email: {test_email}")
        else:
            print("❌ Échec de l'envoi de l'email")
            
    except Exception as e:
        print(f"❌ Erreur lors de l'envoi: {str(e)}")
        print("\n🔧 Vérifications possibles:")
        print("   - Vérifiez que le serveur SMTP 172.16.0.25 est accessible")
        print("   - Vérifiez que le port 25 est ouvert")
        print("   - Vérifiez la configuration réseau")
        print("   - Vérifiez les logs du serveur email")


def test_notification_system():
    """Tester le système de notification"""
    print("\n🔔 Test du système de notification")
    print("=" * 50)
    
    try:
        from notifications.services import EmailNotificationService
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        
        # Créer un utilisateur de test
        user, created = User.objects.get_or_create(
            email="test@example.com",
            defaults={
                'username': 'testuser',
                'first_name': 'Test',
                'last_name': 'User',
                'is_active': True
            }
        )
        
        print(f"👤 Utilisateur de test: {user.email}")
        
        # Créer une notification
        service = EmailNotificationService()
        notification = service.create_notification(
            recipient=user,
            subject="🧪 Test Notification System",
            message="Ceci est un test du système de notification.",
            notification_type='system_alert',
            priority='low'
        )
        
        print(f"✅ Notification créée: ID {notification.id}")
        
        # Afficher les statistiques
        stats = service.get_notification_stats()
        print(f"📊 Statistiques: {stats}")
        
    except Exception as e:
        print(f"❌ Erreur du système de notification: {str(e)}")


if __name__ == "__main__":
    print("🚀 Démarrage des tests de configuration email")
    print()
    
    # Test de configuration
    test_email_configuration()
    
    # Test du système de notification
    test_notification_system()
    
    print("\n🎉 Tests terminés!")
