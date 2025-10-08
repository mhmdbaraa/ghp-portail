"""
Service de rappels automatiques pour projets et tâches
"""
from django.utils import timezone
from django.db.models import Q
from datetime import timedelta
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)


class ReminderService:
    """
    Service pour gérer les rappels automatiques
    """
    
    # Configuration standard des rappels
    REMINDER_SCHEDULE = {
        'project': {
            'approaching': [30, 14, 7, 3, 1],  # Jours avant échéance
            'overdue': [1, 3, 7, 14, 30]       # Jours après échéance
        },
        'task': {
            'approaching': [14, 7, 3, 1],       # Jours avant échéance
            'overdue': [1, 3, 7, 14]           # Jours après échéance
        }
    }
    
    def __init__(self):
        self.logger = logger
    
    def process_project_reminders(self):
        """
        Traiter les rappels pour tous les projets
        """
        from notifications.services import ProjectNotificationService
        from projects.models import Project
        
        service = ProjectNotificationService()
        today = timezone.now().date()
        
        # Projets avec échéance approchante
        for days_before in self.REMINDER_SCHEDULE['project']['approaching']:
            target_date = today + timedelta(days=days_before)
            
            projects = Project.objects.filter(
                deadline__date=target_date,
                status__in=['active', 'in_progress', 'pending']
            )
            
            for project in projects:
                try:
                    service.notify_project_deadline_approaching(project, days_before)
                    self.logger.info(f"Rappel projet approchant envoyé: {project.name} ({days_before} jours)")
                except Exception as e:
                    self.logger.error(f"Erreur rappel projet approchant: {str(e)}")
        
        # Projets en retard
        for days_overdue in self.REMINDER_SCHEDULE['project']['overdue']:
            target_date = today - timedelta(days=days_overdue)
            
            projects = Project.objects.filter(
                deadline__date=target_date,
                status__in=['active', 'in_progress', 'pending']
            )
            
            for project in projects:
                try:
                    service.notify_project_overdue(project, days_overdue)
                    self.logger.info(f"Rappel projet en retard envoyé: {project.name} ({days_overdue} jours)")
                except Exception as e:
                    self.logger.error(f"Erreur rappel projet en retard: {str(e)}")
        
        # Projets dont l'échéance est aujourd'hui
        projects_today = Project.objects.filter(
            deadline__date=today,
            status__in=['active', 'in_progress', 'pending']
        )
        
        for project in projects_today:
            try:
                service.notify_project_deadline_reached(project)
                self.logger.info(f"Rappel échéance projet atteinte: {project.name}")
            except Exception as e:
                self.logger.error(f"Erreur rappel échéance projet: {str(e)}")
    
    def process_task_reminders(self):
        """
        Traiter les rappels pour toutes les tâches
        """
        from notifications.services import TaskNotificationService
        from projects.models import Task
        
        service = TaskNotificationService()
        today = timezone.now().date()
        
        # Tâches avec échéance approchante
        for days_before in self.REMINDER_SCHEDULE['task']['approaching']:
            target_date = today + timedelta(days=days_before)
            
            tasks = Task.objects.filter(
                due_date__date=target_date,
                status__in=['pending', 'in_progress', 'assigned']
            )
            
            for task in tasks:
                try:
                    service.notify_task_deadline_approaching(task, days_before)
                    self.logger.info(f"Rappel tâche approchante envoyé: {task.title} ({days_before} jours)")
                except Exception as e:
                    self.logger.error(f"Erreur rappel tâche approchante: {str(e)}")
        
        # Tâches en retard
        for days_overdue in self.REMINDER_SCHEDULE['task']['overdue']:
            target_date = today - timedelta(days=days_overdue)
            
            tasks = Task.objects.filter(
                due_date__date=target_date,
                status__in=['pending', 'in_progress', 'assigned']
            )
            
            for task in tasks:
                try:
                    service.notify_task_overdue(task, days_overdue)
                    self.logger.info(f"Rappel tâche en retard envoyé: {task.title} ({days_overdue} jours)")
                except Exception as e:
                    self.logger.error(f"Erreur rappel tâche en retard: {str(e)}")
        
        # Tâches dont l'échéance est aujourd'hui
        tasks_today = Task.objects.filter(
            due_date__date=today,
            status__in=['pending', 'in_progress', 'assigned']
        )
        
        for task in tasks_today:
            try:
                service.notify_task_deadline_reached(task)
                self.logger.info(f"Rappel échéance tâche atteinte: {task.title}")
            except Exception as e:
                self.logger.error(f"Erreur rappel échéance tâche: {str(e)}")
    
    def process_all_reminders(self):
        """
        Traiter tous les rappels (projets et tâches)
        """
        self.logger.info("Début du traitement des rappels automatiques")
        
        try:
            self.process_project_reminders()
            self.logger.info("Rappels projets traités")
        except Exception as e:
            self.logger.error(f"Erreur traitement rappels projets: {str(e)}")
        
        try:
            self.process_task_reminders()
            self.logger.info("Rappels tâches traités")
        except Exception as e:
            self.logger.error(f"Erreur traitement rappels tâches: {str(e)}")
        
        self.logger.info("Fin du traitement des rappels automatiques")
    
    def get_reminder_stats(self) -> Dict[str, Any]:
        """
        Obtenir les statistiques des rappels
        """
        from projects.models import Project, Task
        
        today = timezone.now().date()
        
        # Statistiques projets
        projects_approaching = 0
        projects_overdue = 0
        projects_today = 0
        
        for days_before in self.REMINDER_SCHEDULE['project']['approaching']:
            target_date = today + timedelta(days=days_before)
            count = Project.objects.filter(
                deadline=target_date,
                status__in=['active', 'in_progress', 'pending']
            ).count()
            projects_approaching += count
        
        for days_overdue in self.REMINDER_SCHEDULE['project']['overdue']:
            target_date = today - timedelta(days=days_overdue)
            count = Project.objects.filter(
                deadline=target_date,
                status__in=['active', 'in_progress', 'pending']
            ).count()
            projects_overdue += count
        
        projects_today = Project.objects.filter(
            deadline=today,
            status__in=['active', 'in_progress', 'pending']
        ).count()
        
        # Statistiques tâches
        tasks_approaching = 0
        tasks_overdue = 0
        tasks_today = 0
        
        for days_before in self.REMINDER_SCHEDULE['task']['approaching']:
            target_date = today + timedelta(days=days_before)
            count = Task.objects.filter(
                due_date=target_date,
                status__in=['pending', 'in_progress', 'assigned']
            ).count()
            tasks_approaching += count
        
        for days_overdue in self.REMINDER_SCHEDULE['task']['overdue']:
            target_date = today - timedelta(days=days_overdue)
            count = Task.objects.filter(
                due_date=target_date,
                status__in=['pending', 'in_progress', 'assigned']
            ).count()
            tasks_overdue += count
        
        tasks_today = Task.objects.filter(
            due_date=today,
            status__in=['pending', 'in_progress', 'assigned']
        ).count()
        
        return {
            'projects': {
                'approaching': projects_approaching,
                'overdue': projects_overdue,
                'today': projects_today,
                'total': projects_approaching + projects_overdue + projects_today
            },
            'tasks': {
                'approaching': tasks_approaching,
                'overdue': tasks_overdue,
                'today': tasks_today,
                'total': tasks_approaching + tasks_overdue + tasks_today
            },
            'schedule': self.REMINDER_SCHEDULE
        }
    
    def send_immediate_reminders(self, project_id=None, task_id=None):
        """
        Envoyer des rappels immédiats pour un projet ou une tâche spécifique
        """
        if project_id:
            from notifications.services import ProjectNotificationService
            from projects.models import Project
            
            try:
                project = Project.objects.get(id=project_id)
                service = ProjectNotificationService()
                
                # Calculer les jours restants
                today = timezone.now().date()
                if project.deadline:
                    days_remaining = (project.deadline.date() - today).days
                    
                    if days_remaining > 0:
                        service.notify_project_deadline_approaching(project, days_remaining)
                    elif days_remaining == 0:
                        service.notify_project_deadline_reached(project)
                    else:
                        service.notify_project_overdue(project, abs(days_remaining))
                
                self.logger.info(f"Rappel immédiat envoyé pour projet: {project.name}")
                
            except Project.DoesNotExist:
                self.logger.error(f"Projet {project_id} introuvable")
            except Exception as e:
                self.logger.error(f"Erreur rappel immédiat projet: {str(e)}")
        
        if task_id:
            from notifications.services import TaskNotificationService
            from projects.models import Task
            
            try:
                task = Task.objects.get(id=task_id)
                service = TaskNotificationService()
                
                # Calculer les jours restants
                today = timezone.now().date()
                if task.due_date:
                    days_remaining = (task.due_date.date() - today).days
                    
                    if days_remaining > 0:
                        service.notify_task_deadline_approaching(task, days_remaining)
                    elif days_remaining == 0:
                        service.notify_task_deadline_reached(task)
                    else:
                        service.notify_task_overdue(task, abs(days_remaining))
                
                self.logger.info(f"Rappel immédiat envoyé pour tâche: {task.title}")
                
            except Task.DoesNotExist:
                self.logger.error(f"Tâche {task_id} introuvable")
            except Exception as e:
                self.logger.error(f"Erreur rappel immédiat tâche: {str(e)}")

