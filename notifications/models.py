from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class EmailNotification(models.Model):
    """
    Modèle pour stocker les notifications email
    """
    NOTIFICATION_TYPES = [
        ('project_created', 'Projet créé'),
        ('project_updated', 'Projet mis à jour'),
        ('project_deleted', 'Projet supprimé'),
        ('task_assigned', 'Tâche assignée'),
        ('task_completed', 'Tâche terminée'),
        ('deadline_reminder', 'Rappel d\'échéance'),
        ('user_registered', 'Utilisateur enregistré'),
        ('system_alert', 'Alerte système'),
    ]

    PRIORITY_LEVELS = [
        ('low', 'Faible'),
        ('medium', 'Moyenne'),
        ('high', 'Élevée'),
        ('urgent', 'Urgente'),
    ]

    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('sent', 'Envoyé'),
        ('failed', 'Échec'),
        ('delivered', 'Livré'),
    ]

    # Champs principaux
    recipient = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='email_notifications',
        verbose_name="Destinataire"
    )
    subject = models.CharField(max_length=200, verbose_name="Sujet")
    message = models.TextField(verbose_name="Message")
    notification_type = models.CharField(
        max_length=50, 
        choices=NOTIFICATION_TYPES,
        verbose_name="Type de notification"
    )
    priority = models.CharField(
        max_length=10, 
        choices=PRIORITY_LEVELS,
        default='medium',
        verbose_name="Priorité"
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name="Statut"
    )
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    sent_at = models.DateTimeField(null=True, blank=True, verbose_name="Envoyé le")
    delivered_at = models.DateTimeField(null=True, blank=True, verbose_name="Livré le")
    
    # Champs optionnels
    related_object_id = models.PositiveIntegerField(null=True, blank=True, verbose_name="ID objet lié")
    related_object_type = models.CharField(max_length=100, null=True, blank=True, verbose_name="Type d'objet lié")
    
    # Configuration d'envoi
    send_immediately = models.BooleanField(default=True, verbose_name="Envoyer immédiatement")
    scheduled_send_time = models.DateTimeField(null=True, blank=True, verbose_name="Heure d'envoi programmée")
    
    # Gestion des erreurs
    error_message = models.TextField(blank=True, verbose_name="Message d'erreur")
    retry_count = models.PositiveIntegerField(default=0, verbose_name="Nombre de tentatives")
    max_retries = models.PositiveIntegerField(default=3, verbose_name="Nombre maximum de tentatives")

    class Meta:
        verbose_name = "Notification Email"
        verbose_name_plural = "Notifications Email"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'status']),
            models.Index(fields=['notification_type', 'created_at']),
            models.Index(fields=['priority', 'status']),
        ]

    def __str__(self):
        return f"{self.subject} - {self.recipient.email} ({self.get_status_display()})"

    def mark_as_sent(self):
        """Marquer la notification comme envoyée"""
        self.status = 'sent'
        self.sent_at = timezone.now()
        self.save(update_fields=['status', 'sent_at'])

    def mark_as_delivered(self):
        """Marquer la notification comme livrée"""
        self.status = 'delivered'
        self.delivered_at = timezone.now()
        self.save(update_fields=['status', 'delivered_at'])

    def mark_as_failed(self, error_message=""):
        """Marquer la notification comme échouée"""
        self.status = 'failed'
        self.error_message = error_message
        self.retry_count += 1
        self.save(update_fields=['status', 'error_message', 'retry_count'])

    def can_retry(self):
        """Vérifier si la notification peut être réessayée"""
        return self.retry_count < self.max_retries and self.status == 'failed'

    def is_ready_to_send(self):
        """Vérifier si la notification est prête à être envoyée"""
        if self.status != 'pending':
            return False
        
        if self.send_immediately:
            return True
            
        if self.scheduled_send_time and timezone.now() >= self.scheduled_send_time:
            return True
            
        return False


class EmailTemplate(models.Model):
    """
    Modèle pour stocker les templates d'emails
    """
    name = models.CharField(max_length=100, unique=True, verbose_name="Nom du template")
    subject_template = models.CharField(max_length=200, verbose_name="Template du sujet")
    body_template = models.TextField(verbose_name="Template du corps")
    notification_type = models.CharField(
        max_length=50,
        choices=EmailNotification.NOTIFICATION_TYPES,
        verbose_name="Type de notification"
    )
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Mis à jour le")

    class Meta:
        verbose_name = "Template Email"
        verbose_name_plural = "Templates Email"
        ordering = ['name']

    def __str__(self):
        return self.name


class EmailLog(models.Model):
    """
    Modèle pour logger les activités d'envoi d'emails
    """
    notification = models.ForeignKey(
        EmailNotification,
        on_delete=models.CASCADE,
        related_name='logs',
        verbose_name="Notification"
    )
    action = models.CharField(max_length=50, verbose_name="Action")
    details = models.TextField(blank=True, verbose_name="Détails")
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name="Horodatage")

    class Meta:
        verbose_name = "Log Email"
        verbose_name_plural = "Logs Email"
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.notification.subject} - {self.action} ({self.timestamp})"