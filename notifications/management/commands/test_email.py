from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from notifications.services import EmailNotificationService
from notifications.models import EmailTemplate
from django.utils import timezone

User = get_user_model()


class Command(BaseCommand):
    help = 'Tester le système de notification email'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='Email du destinataire pour le test',
            default='test@example.com'
        )
        parser.add_argument(
            '--type',
            type=str,
            choices=['system_alert', 'project_created', 'project_updated', 'deadline_reminder'],
            default='system_alert',
            help='Type de notification à tester'
        )

    def handle(self, *args, **options):
        email = options['email']
        notification_type = options['type']
        
        self.stdout.write(
            self.style.SUCCESS(f'🧪 Test du système de notification email')
        )
        self.stdout.write(f'📧 Email destinataire: {email}')
        self.stdout.write(f'📋 Type de notification: {notification_type}')
        
        try:
            # Créer ou récupérer un utilisateur de test
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email.split('@')[0],
                    'first_name': 'Test',
                    'last_name': 'User',
                    'is_active': True
                }
            )
            
            if created:
                self.stdout.write(
                    self.style.WARNING(f'👤 Utilisateur de test créé: {user.email}')
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(f'👤 Utilisateur existant trouvé: {user.email}')
                )
            
            # Créer les templates de test s'ils n'existent pas
            self.create_test_templates()
            
            # Tester le service de notification
            service = EmailNotificationService()
            
            # Créer une notification de test
            if notification_type == 'system_alert':
                notification = service.create_notification(
                    recipient=user,
                    subject="🧪 Test du système d'email - GHP Portail",
                    message=f"""
                    Ceci est un email de test pour vérifier le bon fonctionnement du système de notification.
                    
                    Détails du test:
                    - Date: {timezone.now().strftime('%d/%m/%Y %H:%M:%S')}
                    - Type: {notification_type}
                    - Utilisateur: {user.get_full_name() or user.username}
                    - Système: GHP Portail
                    
                    Si vous recevez cet email, cela signifie que la configuration email fonctionne correctement.
                    
                    Configuration utilisée:
                    - Serveur SMTP: 172.16.0.25:25
                    - TLS: Désactivé
                    - Expéditeur: GHPportail@groupehdyrapahrm.com
                    
                    Cordialement,
                    L'équipe GHP Portail
                    """,
                    notification_type=notification_type,
                    priority='low'
                )
                
            elif notification_type == 'project_created':
                notification = service.create_notification(
                    recipient=user,
                    subject="🎉 Nouveau projet créé - Test",
                    message=f"""
                    Un nouveau projet de test a été créé.
                    
                    Nom du projet: Projet Test GHP
                    Description: Projet de test pour vérifier les notifications
                    Créé par: {user.get_full_name() or user.username}
                    Date: {timezone.now().strftime('%d/%m/%Y %H:%M')}
                    
                    Ce projet est utilisé uniquement pour tester le système de notification.
                    """,
                    notification_type=notification_type,
                    priority='medium',
                    related_object_id=999,
                    related_object_type='project'
                )
                
            elif notification_type == 'deadline_reminder':
                notification = service.create_notification(
                    recipient=user,
                    subject="⏰ Rappel d'échéance - Test",
                    message=f"""
                    Attention! L'échéance du projet de test approche.
                    
                    Projet: Projet Test GHP
                    Échéance: {(timezone.now() + timezone.timedelta(days=1)).strftime('%d/%m/%Y')}
                    Jours restants: 1
                    
                    Ceci est un test du système de rappel d'échéance.
                    """,
                    notification_type=notification_type,
                    priority='high',
                    related_object_id=999,
                    related_object_type='project'
                )
            
            self.stdout.write(
                self.style.SUCCESS(f'✅ Notification créée avec l\'ID: {notification.id}')
            )
            
            # Afficher les statistiques
            stats = service.get_notification_stats()
            self.stdout.write('\n📊 Statistiques des notifications:')
            self.stdout.write(f'   Total: {stats["total"]}')
            self.stdout.write(f'   En attente: {stats["pending"]}')
            self.stdout.write(f'   Envoyées: {stats["sent"]}')
            self.stdout.write(f'   Échouées: {stats["failed"]}')
            self.stdout.write(f'   Livrées: {stats["delivered"]}')
            
            self.stdout.write(
                self.style.SUCCESS('\n🎉 Test terminé avec succès!')
            )
            self.stdout.write(
                self.style.WARNING('📧 Vérifiez votre boîte email pour confirmer la réception.')
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Erreur lors du test: {str(e)}')
            )
            raise

    def create_test_templates(self):
        """Créer les templates de test s'ils n'existent pas"""
        templates_data = [
            {
                'name': 'Template Test - Alerte Système',
                'subject_template': '🧪 {{ subject }}',
                'body_template': '''
                <h2>Test du Système Email</h2>
                <p>{{ message }}</p>
                <p><strong>Date:</strong> {{ created_at|date:"d/m/Y à H:i" }}</p>
                <p><strong>Utilisateur:</strong> {{ recipient.get_full_name|default:recipient.username }}</p>
                ''',
                'notification_type': 'system_alert'
            },
            {
                'name': 'Template Test - Projet Créé',
                'subject_template': '🎉 {{ subject }}',
                'body_template': '''
                <h2>Nouveau Projet Créé</h2>
                <p>{{ message }}</p>
                <p><strong>Date de création:</strong> {{ created_at|date:"d/m/Y à H:i" }}</p>
                ''',
                'notification_type': 'project_created'
            },
            {
                'name': 'Template Test - Rappel Échéance',
                'subject_template': '⏰ {{ subject }}',
                'body_template': '''
                <h2>Rappel d\'Échéance</h2>
                <p>{{ message }}</p>
                <p><strong>Priorité:</strong> Élevée</p>
                ''',
                'notification_type': 'deadline_reminder'
            }
        ]
        
        for template_data in templates_data:
            template, created = EmailTemplate.objects.get_or_create(
                name=template_data['name'],
                defaults=template_data
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'📝 Template créé: {template.name}')
                )
