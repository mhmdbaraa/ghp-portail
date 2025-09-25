from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser
    """
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('manager', 'Manager'),
        ('developer', 'Developer'),
        ('designer', 'Designer'),
        ('tester', 'Tester'),
        ('user', 'User'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
    ]
    
    # Additional fields
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    position = models.CharField(max_length=100, blank=True, null=True)
    join_date = models.DateField(default=lambda: timezone.now().date())
    last_login_ip = models.GenericIPAddressField(blank=True, null=True)
    
    # User preferences
    preferences = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'auth_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username
    
    def has_permission(self, permission):
        """Check if user has a specific permission"""
        if self.role == 'admin':
            return True
        
        # Define role-based permissions
        role_permissions = {
            'manager': [
                'project:view', 'project:create', 'project:edit', 'project:delete',
                'task:view', 'task:create', 'task:edit', 'task:delete',
                'team:view', 'team:manage', 'user:view'
            ],
            'developer': [
                'project:view', 'task:view', 'task:create', 'task:edit',
                'team:view'
            ],
            'designer': [
                'project:view', 'task:view', 'task:create', 'task:edit',
                'team:view'
            ],
            'tester': [
                'project:view', 'task:view', 'task:edit',
                'team:view'
            ],
            'user': [
                'project:view', 'task:view', 'team:view'
            ]
        }
        
        return permission in role_permissions.get(self.role, [])
    
    def get_permissions(self):
        """Get all permissions for the user"""
        if self.role == 'admin':
            return [
                'project:view', 'project:create', 'project:edit', 'project:delete',
                'task:view', 'task:create', 'task:edit', 'task:delete',
                'team:view', 'team:manage', 'user:manage'
            ]
        
        role_permissions = {
            'manager': [
                'project:view', 'project:create', 'project:edit', 'project:delete',
                'task:view', 'task:create', 'task:edit', 'task:delete',
                'team:view', 'team:manage', 'user:view'
            ],
            'developer': [
                'project:view', 'task:view', 'task:create', 'task:edit',
                'team:view'
            ],
            'designer': [
                'project:view', 'task:view', 'task:create', 'task:edit',
                'team:view'
            ],
            'tester': [
                'project:view', 'task:view', 'task:edit',
                'team:view'
            ],
            'user': [
                'project:view', 'task:view', 'team:view'
            ]
        }
        
        return role_permissions.get(self.role, [])


class UserSession(models.Model):
    """
    Track user sessions for security and analytics
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    session_key = models.CharField(max_length=40, unique=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'user_sessions'
        verbose_name = 'User Session'
        verbose_name_plural = 'User Sessions'
    
    def __str__(self):
        return f"{self.user.username} - {self.ip_address}"
