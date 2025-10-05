#!/usr/bin/env python
"""
Test d'envoi d'email avec gestion d'erreurs
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
import socket


def test_smtp_connection():
    """Tester la connexion SMTP"""
    print("🔌 Test de connexion SMTP")
    print("=" * 40)
    
    try:
        import smtplib
        
        # Test de connexion au serveur SMTP
        print(f"📡 Connexion au serveur {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
        
        server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
        server.quit()
        
        print("✅ Connexion SMTP réussie!")
        return True
        
    except socket.timeout:
        print("❌ Timeout de connexion - Le serveur ne répond pas")
        return False
    except socket.gaierror:
        print("❌ Erreur DNS - Impossible de résoudre l'adresse")
        return False
    except ConnectionRefusedError:
        print("❌ Connexion refusée - Le serveur refuse la connexion")
        return False
    except Exception as e:
        print(f"❌ Erreur de connexion: {str(e)}")
        return False


def test_email_send():
    """Tester l'envoi d'email"""
    print("\n📧 Test d'envoi d'email")
    print("=" * 40)
    
    # Demander l'email de test
    test_email = input("📧 Entrez votre email pour le test (ou appuyez sur Entrée pour annuler): ").strip()
    if not test_email:
        print("❌ Test annulé")
        return False
    
    try:
        subject = "🧪 Test Email GHP Portail"
        message = f"""
        Ceci est un email de test du système GHP Portail.
        
        Configuration utilisée:
        - Serveur SMTP: {settings.EMAIL_HOST}:{settings.EMAIL_PORT}
        - TLS: {'Activé' if settings.EMAIL_USE_TLS else 'Désactivé'}
        - Expéditeur: {settings.DEFAULT_FROM_EMAIL}
        - Date: {timezone.now().strftime('%d/%m/%Y %H:%M:%S')}
        
        Si vous recevez cet email, la configuration fonctionne correctement!
        
        Cordialement,
        L'équipe GHP Portail
        """
        
        print(f"📤 Envoi vers: {test_email}")
        print("⏳ Envoi en cours...")
        
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
            return True
        else:
            print("❌ Échec de l'envoi de l'email")
            return False
            
    except Exception as e:
        print(f"❌ Erreur lors de l'envoi: {str(e)}")
        print("\n🔧 Solutions possibles:")
        print("   1. Vérifiez que le serveur 172.16.0.25 est accessible")
        print("   2. Vérifiez que le port 25 est ouvert")
        print("   3. Vérifiez la configuration réseau")
        print("   4. Contactez l'administrateur système")
        return False


def test_notification_send():
    """Tester l'envoi via le système de notification"""
    print("\n🔔 Test d'envoi via système de notification")
    print("=" * 50)
    
    try:
        from notifications.services import EmailNotificationService
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        
        # Demander l'email
        test_email = input("📧 Entrez votre email pour le test: ").strip()
        if not test_email:
            print("❌ Test annulé")
            return False
        
        # Créer ou récupérer l'utilisateur
        user, created = User.objects.get_or_create(
            email=test_email,
            defaults={
                'username': test_email.split('@')[0],
                'first_name': 'Test',
                'last_name': 'User',
                'is_active': True
            }
        )
        
        print(f"👤 Utilisateur: {user.email}")
        
        # Créer une notification
        service = EmailNotificationService()
        notification = service.create_notification(
            recipient=user,
            subject="🧪 Test Notification GHP Portail",
            message=f"""
            Ceci est un test du système de notification GHP Portail.
            
            Détails du test:
            - Date: {timezone.now().strftime('%d/%m/%Y %H:%M:%S')}
            - Type: Test système
            - Utilisateur: {user.get_full_name() or user.username}
            
            Configuration:
            - Serveur SMTP: {settings.EMAIL_HOST}:{settings.EMAIL_PORT}
            - TLS: {'Activé' if settings.EMAIL_USE_TLS else 'Désactivé'}
            - Expéditeur: {settings.DEFAULT_FROM_EMAIL}
            
            Si vous recevez cet email, le système de notification fonctionne correctement!
            
            Cordialement,
            L'équipe GHP Portail
            """,
            notification_type='system_alert',
            priority='low',
            send_immediately=True  # Envoyer immédiatement
        )
        
        print(f"✅ Notification créée: ID {notification.id}")
        print("📤 Tentative d'envoi...")
        
        # Attendre un peu pour voir le résultat
        import time
        time.sleep(2)
        
        # Vérifier le statut
        notification.refresh_from_db()
        print(f"📊 Statut final: {notification.status}")
        
        if notification.status == 'sent':
            print("✅ Email envoyé avec succès!")
            return True
        elif notification.status == 'failed':
            print(f"❌ Échec de l'envoi: {notification.error_message}")
            return False
        else:
            print(f"⏳ Statut: {notification.status}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("🚀 Test complet du système d'email GHP Portail")
    print()
    
    # Test 1: Connexion SMTP
    smtp_ok = test_smtp_connection()
    
    if smtp_ok:
        # Test 2: Envoi d'email simple
        email_ok = test_email_send()
        
        if email_ok:
            # Test 3: Système de notification
            test_notification_send()
    
    print("\n🎉 Tests terminés!")
    if smtp_ok:
        print("💡 Le serveur SMTP est accessible")
    else:
        print("⚠️  Problème de connectivité SMTP")
