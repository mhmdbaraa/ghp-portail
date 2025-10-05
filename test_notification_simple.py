#!/usr/bin/env python
"""
Test simple du système de notification sans envoi d'email
"""
import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'projecttracker.settings')
django.setup()

from notifications.services import EmailNotificationService
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


def test_notification_creation():
    """Tester la création de notifications sans envoi"""
    print("🧪 Test du système de notification (sans envoi d'email)")
    print("=" * 60)
    
    try:
        # Créer un utilisateur de test
        user, created = User.objects.get_or_create(
            email='test@example.com',
            defaults={
                'username': 'testuser',
                'first_name': 'Test',
                'last_name': 'User',
                'is_active': True
            }
        )
        
        if created:
            print(f"✅ Utilisateur de test créé: {user.email}")
        else:
            print(f"👤 Utilisateur existant: {user.email}")
        
        # Créer le service
        service = EmailNotificationService()
        
        # Test 1: Notification système
        print("\n📧 Test 1: Notification système")
        notification1 = service.create_notification(
            recipient=user,
            subject="🧪 Test Notification System",
            message="Ceci est un test du système de notification.",
            notification_type='system_alert',
            priority='low',
            send_immediately=False  # Ne pas envoyer immédiatement
        )
        print(f"   ✅ Notification créée: ID {notification1.id}")
        print(f"   📋 Type: {notification1.notification_type}")
        print(f"   📊 Statut: {notification1.status}")
        
        # Test 2: Notification projet
        print("\n📧 Test 2: Notification projet")
        notification2 = service.create_notification(
            recipient=user,
            subject="🎉 Nouveau projet créé",
            message="Un nouveau projet a été créé pour les tests.",
            notification_type='project_created',
            priority='medium',
            related_object_id=123,
            related_object_type='project',
            send_immediately=False
        )
        print(f"   ✅ Notification créée: ID {notification2.id}")
        print(f"   📋 Type: {notification2.notification_type}")
        print(f"   🔗 Objet lié: {notification2.related_object_type} #{notification2.related_object_id}")
        
        # Test 3: Notification rappel
        print("\n📧 Test 3: Notification rappel")
        notification3 = service.create_notification(
            recipient=user,
            subject="⏰ Rappel d'échéance",
            message="L'échéance du projet approche.",
            notification_type='deadline_reminder',
            priority='high',
            related_object_id=123,
            related_object_type='project',
            send_immediately=False
        )
        print(f"   ✅ Notification créée: ID {notification3.id}")
        print(f"   📋 Type: {notification3.notification_type}")
        print(f"   🚨 Priorité: {notification3.priority}")
        
        # Afficher les statistiques
        print("\n📊 Statistiques des notifications:")
        stats = service.get_notification_stats()
        print(f"   Total: {stats['total']}")
        print(f"   En attente: {stats['pending']}")
        print(f"   Envoyées: {stats['sent']}")
        print(f"   Échouées: {stats['failed']}")
        print(f"   Livrées: {stats['delivered']}")
        
        # Afficher les notifications par type
        print(f"\n📋 Par type:")
        for notification_type, count in stats['by_type'].items():
            print(f"   {notification_type}: {count}")
        
        print(f"\n🎯 Par priorité:")
        for priority, count in stats['by_priority'].items():
            print(f"   {priority}: {count}")
        
        print("\n✅ Tous les tests de création de notifications ont réussi!")
        print("📝 Les notifications sont créées en base de données")
        print("📧 Pour tester l'envoi d'email, vérifiez la connectivité au serveur SMTP")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors du test: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_email_configuration():
    """Afficher la configuration email"""
    print("\n📧 Configuration email:")
    print("=" * 40)
    
    from django.conf import settings
    print(f"Backend: {settings.EMAIL_BACKEND}")
    print(f"Host: {settings.EMAIL_HOST}")
    print(f"Port: {settings.EMAIL_PORT}")
    print(f"TLS: {settings.EMAIL_USE_TLS}")
    print(f"From: {settings.DEFAULT_FROM_EMAIL}")
    print(f"Server: {settings.SERVER_EMAIL}")


if __name__ == "__main__":
    print("🚀 Test du système de notification GHP Portail")
    print()
    
    # Afficher la configuration
    test_email_configuration()
    
    # Tester la création de notifications
    success = test_notification_creation()
    
    if success:
        print("\n🎉 Tests terminés avec succès!")
        print("💡 Le système de notification est fonctionnel")
        print("📧 Pour tester l'envoi d'email, vérifiez la connectivité réseau")
    else:
        print("\n❌ Tests échoués")
        sys.exit(1)
