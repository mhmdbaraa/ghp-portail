"""
Commande Django pour envoyer les rappels automatiques
Usage: python manage.py send_reminders
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, date
from notifications.services import ProjectNotificationService, TaskNotificationService
from notifications.models import EmailNotification
from projects.models import Project
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Envoie les rappels automatiques pour les projets et tâches'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Simuler l\'envoi sans vraiment envoyer les emails',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Forcer l\'envoi même si déjà envoyé aujourd\'hui',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        force = options['force']
        
        self.stdout.write(
            self.style.SUCCESS('🔄 Démarrage du système de rappels automatiques...')
        )
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING('⚠️ Mode simulation activé - Aucun email ne sera envoyé')
            )
        
        # Statistiques
        stats = {
            'projects_checked': 0,
            'tasks_checked': 0,
            'notifications_sent': 0,
            'errors': 0
        }
        
        try:
            # 1. Rappels de projets
            self.stdout.write('\n📁 Vérification des rappels de projets...')
            project_stats = self.check_project_reminders(dry_run, force)
            stats.update(project_stats)
            
            # 2. Rappels de tâches
            self.stdout.write('\n📋 Vérification des rappels de tâches...')
            task_stats = self.check_task_reminders(dry_run, force)
            stats.update(task_stats)
            
            # 3. Afficher les statistiques
            self.display_stats(stats)
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Erreur lors de l\'exécution: {str(e)}')
            )
            stats['errors'] += 1

    def check_project_reminders(self, dry_run=False, force=False):
        """Vérifier et envoyer les rappels de projets"""
        stats = {'projects_checked': 0, 'notifications_sent': 0, 'errors': 0}
        
        try:
            # Récupérer tous les projets actifs
            today = timezone.now().date()
            projects = Project.objects.filter(
                status__in=['En attente', 'En cours', 'En pause']
            ).exclude(deadline__isnull=True)
            
            stats['projects_checked'] = projects.count()
            self.stdout.write(f'  📊 {stats["projects_checked"]} projets à vérifier')
            
            project_service = ProjectNotificationService()
            
            for project in projects:
                try:
                    deadline = project.deadline
                    days_remaining = (deadline - today).days
                    
                    # Rappels avant échéance
                    if days_remaining in [30, 14, 7, 3, 1]:
                        if not self.already_notified_today(project, 'project_deadline_approaching', days_remaining) or force:
                            if not dry_run:
                                project_service.notify_project_deadline_approaching(project, days_remaining)
                            self.stdout.write(f'    📧 Rappel projet "{project.name}" - {days_remaining} jours restants')
                            stats['notifications_sent'] += 1
                    
                    # Échéance atteinte
                    elif days_remaining == 0:
                        if not self.already_notified_today(project, 'project_deadline_reached') or force:
                            if not dry_run:
                                project_service.notify_project_deadline_reached(project)
                            self.stdout.write(f'    ⏰ Échéance atteinte: "{project.name}"')
                            stats['notifications_sent'] += 1
                    
                    # Projet en retard
                    elif days_remaining < 0:
                        days_overdue = abs(days_remaining)
                        if days_overdue in [1, 3, 7, 14, 30]:
                            if not self.already_notified_today(project, 'project_overdue', days_overdue) or force:
                                if not dry_run:
                                    project_service.notify_project_overdue(project, days_overdue)
                                self.stdout.write(f'    🚨 Projet en retard: "{project.name}" - {days_overdue} jours')
                                stats['notifications_sent'] += 1
                
                except Exception as e:
                    self.stdout.write(f'    ❌ Erreur projet {project.name}: {str(e)}')
                    stats['errors'] += 1
            
        except Exception as e:
            self.stdout.write(f'❌ Erreur rappels projets: {str(e)}')
            stats['errors'] += 1
        
        return stats

    def check_task_reminders(self, dry_run=False, force=False):
        """Vérifier et envoyer les rappels de tâches"""
        stats = {'tasks_checked': 0, 'notifications_sent': 0, 'errors': 0}
        
        try:
            # Pour l'instant, on simule les tâches
            # Dans une vraie application, vous auriez un modèle Task
            self.stdout.write('  📋 Système de tâches non implémenté dans ce test')
            stats['tasks_checked'] = 0
            
        except Exception as e:
            self.stdout.write(f'❌ Erreur rappels tâches: {str(e)}')
            stats['errors'] += 1
        
        return stats

    def already_notified_today(self, project, notification_type, days=None):
        """Vérifier si une notification a déjà été envoyée aujourd'hui"""
        today = timezone.now().date()
        
        # Construire le filtre
        filters = {
            'notification_type': notification_type,
            'related_object_id': project.id,
            'related_object_type': 'project',
            'created_at__date': today
        }
        
        if days is not None:
            # Pour les rappels, on peut ajouter une logique plus fine
            pass
        
        return EmailNotification.objects.filter(**filters).exists()

    def display_stats(self, stats):
        """Afficher les statistiques finales"""
        self.stdout.write('\n📊 Statistiques de l\'exécution:')
        self.stdout.write(f'  📁 Projets vérifiés: {stats.get("projects_checked", 0)}')
        self.stdout.write(f'  📋 Tâches vérifiées: {stats.get("tasks_checked", 0)}')
        self.stdout.write(f'  📧 Notifications envoyées: {stats.get("notifications_sent", 0)}')
        self.stdout.write(f'  ❌ Erreurs: {stats.get("errors", 0)}')
        
        if stats.get('notifications_sent', 0) > 0:
            self.stdout.write(
                self.style.SUCCESS('✅ Rappels envoyés avec succès!')
            )
        else:
            self.stdout.write(
                self.style.WARNING('ℹ️ Aucun rappel à envoyer aujourd\'hui')
            )










