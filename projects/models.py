from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

def default_list():
    return []


class Project(models.Model):
    """
    Project model for managing projects
    """
    STATUS_CHOICES = [
        ('planification', 'Planification'),
        ('en_cours', 'En cours'),
        ('en_attente', 'En attente'),
        ('en_retard', 'En retard'),
        ('termine', 'Terminé'),
        ('annule', 'Annulé'),
    ]
    
    PRIORITY_CHOICES = [
        ('faible', 'Faible'),
        ('moyen', 'Moyen'),
        ('eleve', 'Élevé'),
        ('critique', 'Critique'),
    ]
    
    CATEGORY_CHOICES = [
        ('app_web', 'App Web'),
        ('app_mobile', 'App Mobile'),
        ('reporting', 'Reporting'),
        ('digitalisation', 'Digitalisation'),
        ('erp', 'ERP'),
        ('ai', 'AI'),
        ('web_mobile', 'Web & Mobile'),
        ('other', 'Autre'),
    ]
    
    DEPARTMENT_CHOICES = [
        ('comptabilite', 'Comptabilité'),
        ('finance', 'Finance'),
        ('service_clients', 'Service clients'),
        ('risque_clients', 'Risque clients'),
        ('service_generaux', 'Service généraux'),
        ('controle_gestion', 'Contrôle de gestion'),
        ('juridique', 'Juridique'),
        ('evenementiel', 'Événementiel'),
    ]
    
    # Basic information
    name = models.CharField(max_length=200)
    project_number = models.CharField(max_length=50, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    department = models.CharField(max_length=20, choices=DEPARTMENT_CHOICES, default='comptabilite')
    
    # Project management
    manager = models.ForeignKey(User, on_delete=models.CASCADE, related_name='managed_projects')
    team = models.ManyToManyField(User, related_name='projects', blank=True)
    
    # Timeline
    start_date = models.DateField()
    deadline = models.DateField()
    completed_date = models.DateField(blank=True, null=True)
    
    # Budget and resources
    budget = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    spent = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Progress tracking
    progress = models.IntegerField(default=0, help_text="Progress percentage (0-100)")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planification')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='moyen')
    
    # Additional fields
    tags = models.JSONField(default=default_list, blank=True)
    attachments = models.JSONField(default=default_list, blank=True)
    notes = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'projects'
        ordering = ['-created_at']
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'
    
    def __str__(self):
        return self.name
    
    @property
    def is_overdue(self):
        """Check if project is overdue"""
        if self.status == 'completed':
            return False
        return timezone.now().date() > self.deadline
    
    @property
    def budget_utilization(self):
        """Calculate budget utilization percentage"""
        if self.budget <= 0:
            return 0
        return round((self.spent / self.budget) * 100, 2)
    
    @property
    def team_count(self):
        """Get team member count"""
        return self.team.count()
    
    def get_tasks_count(self):
        """Get total tasks count"""
        return self.tasks.count()
    
    def get_completed_tasks_count(self):
        """Get completed tasks count"""
        return self.tasks.filter(status='completed').count()
    
    def save(self, *args, **kwargs):
        """Override save to generate project number"""
        if not self.project_number:
            self.project_number = self.generate_project_number()
        super().save(*args, **kwargs)
    
    def generate_project_number(self):
        """Generate unique project number in format prj-year-index"""
        from django.db.models import Max
        from datetime import datetime
        
        # Get current year (last 2 digits)
        current_year = datetime.now().year % 100
        
        # Get the highest index for projects in current year
        existing_projects = Project.objects.filter(
            project_number__startswith=f"prj-{current_year:02d}-"
        )
        
        if existing_projects.exists():
            # Extract the highest index from existing project numbers
            max_index = 0
            for project in existing_projects:
                try:
                    # Extract index from project_number like "prj-25-01"
                    parts = project.project_number.split('-')
                    if len(parts) == 3 and parts[2].isdigit():
                        index = int(parts[2])
                        max_index = max(max_index, index)
                except (ValueError, IndexError):
                    continue
            next_index = max_index + 1
        else:
            next_index = 1
        
        return f"prj-{current_year:02d}-{next_index:02d}"


class ProjectComment(models.Model):
    """
    Comments on projects
    """
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'project_comments'
        ordering = ['-created_at']
        verbose_name = 'Project Comment'
        verbose_name_plural = 'Project Comments'
    
    def __str__(self):
        return f"Comment by {self.author.username} on {self.project.name}"


class ProjectAttachment(models.Model):
    """
    File attachments for projects
    """
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='project_attachments')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    file_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)
    file_size = models.BigIntegerField()
    file_type = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True, help_text="Description of the attachment")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'project_attachments'
        ordering = ['-uploaded_at']
        verbose_name = 'Project Attachment'
        verbose_name_plural = 'Project Attachments'
    
    def __str__(self):
        return f"{self.file_name} - {self.project.name}"
    
    @property
    def file_size_human(self):
        """Return human readable file size"""
        size = self.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"


class Task(models.Model):
    """
    Task model for managing project tasks
    """
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('on_hold', 'On Hold'),
        ('cancelled', 'Cancelled'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    TYPE_CHOICES = [
        ('bug', 'Bug'),
        ('feature', 'Feature'),
        ('improvement', 'Improvement'),
        ('task', 'Task'),
        ('epic', 'Epic'),
        ('story', 'Story'),
    ]
    
    # Basic information
    title = models.CharField(max_length=200)
    task_number = models.CharField(max_length=50, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    task_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='task')
    
    # Relationships
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reported_tasks')
    
    # Timeline
    due_date = models.DateTimeField(blank=True, null=True)
    completed_date = models.DateTimeField(blank=True, null=True)
    
    # Time tracking
    estimated_time = models.DecimalField(max_digits=8, decimal_places=2, default=0, help_text="Estimated time in hours")
    actual_time = models.DecimalField(max_digits=8, decimal_places=2, default=0, help_text="Actual time spent in hours")
    
    # Additional fields
    tags = models.JSONField(default=default_list, blank=True)
    attachments = models.JSONField(default=default_list, blank=True)
    notes = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tasks'
        ordering = ['-created_at']
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'
    
    def __str__(self):
        return self.title
    
    @property
    def is_overdue(self):
        """Check if task is overdue"""
        if self.status == 'completed':
            return False
        if not self.due_date:
            return False
        return timezone.now() > self.due_date
    
    @property
    def time_variance(self):
        """Calculate time variance (actual vs estimated)"""
        if self.estimated_time <= 0:
            return 0
        return round(self.actual_time - self.estimated_time, 2)
    
    @property
    def progress_percentage(self):
        """Calculate progress percentage based on status"""
        status_progress = {
            'not_started': 0,
            'in_progress': 50,
            'completed': 100,
            'on_hold': 25,
            'cancelled': 0,
        }
        return status_progress.get(self.status, 0)
    
    def save(self, *args, **kwargs):
        """Override save to generate task number"""
        if not self.task_number:
            self.task_number = self.generate_task_number()
        super().save(*args, **kwargs)
    
    def generate_task_number(self):
        """Generate unique task number in format t-year-index"""
        from django.db.models import Max
        from datetime import datetime
        
        # Get current year (last 2 digits)
        current_year = datetime.now().year % 100
        
        # Get the highest index for tasks in current year
        existing_tasks = Task.objects.filter(
            task_number__startswith=f"t-{current_year:02d}-"
        )
        
        if existing_tasks.exists():
            # Extract the highest index from existing task numbers
            max_index = 0
            for task in existing_tasks:
                try:
                    # Extract index from task_number like "t-25-01"
                    parts = task.task_number.split('-')
                    if len(parts) == 3 and parts[2].isdigit():
                        index = int(parts[2])
                        max_index = max(max_index, index)
                except (ValueError, IndexError):
                    continue
            next_index = max_index + 1
        else:
            next_index = 1
        
        return f"t-{current_year:02d}-{next_index:02d}"


class TaskComment(models.Model):
    """
    Comments on tasks
    """
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'task_comments'
        ordering = ['-created_at']
        verbose_name = 'Task Comment'
        verbose_name_plural = 'Task Comments'
    
    def __str__(self):
        return f"Comment by {self.author.username} on {self.task.title}"


class TaskAttachment(models.Model):
    """
    File attachments for tasks
    """
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='task_attachments')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    file_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)
    file_size = models.BigIntegerField()
    file_type = models.CharField(max_length=100)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'task_attachments'
        ordering = ['-uploaded_at']
        verbose_name = 'Task Attachment'
        verbose_name_plural = 'Task Attachments'
    
    def __str__(self):
        return f"{self.file_name} - {self.task.title}"


class TimeEntry(models.Model):
    """
    Time tracking entries for tasks
    """
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='time_entries')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.TextField(blank=True, null=True)
    hours = models.DecimalField(max_digits=8, decimal_places=2)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'time_entries'
        ordering = ['-date', '-created_at']
        verbose_name = 'Time Entry'
        verbose_name_plural = 'Time Entries'
        unique_together = ['task', 'user', 'date']
    
    def __str__(self):
        return f"{self.user.username} - {self.hours}h on {self.task.title} ({self.date})"


class ProjectNote(models.Model):
    """
    Social media-style notes/comments for projects
    """
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='project_notes')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='project_notes')
    content = models.TextField()
    
    # Social features
    likes = models.ManyToManyField(User, related_name='liked_notes', blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'project_notes'
        ordering = ['-created_at']
        verbose_name = 'Project Note'
        verbose_name_plural = 'Project Notes'
    
    def __str__(self):
        return f"{self.author.username} - {self.content[:50]}..."
    
    @property
    def likes_count(self):
        return self.likes.count()
