from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import date


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
    filiale = models.CharField(max_length=50, blank=True, null=True)
    join_date = models.DateField(default=date.today)
    last_login_ip = models.GenericIPAddressField(blank=True, null=True)
    
    # User preferences
    preferences = models.JSONField(default=dict, blank=True)
    
    # Custom roles relationship
    roles = models.ManyToManyField('Role', blank=True, related_name='users')
    
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


class Permission(models.Model):
    """
    Custom Permission model for fine-grained access control
    """
    CATEGORY_CHOICES = [
        ('users', 'Users'),
        ('projects', 'Projects'),
        ('tasks', 'Tasks'),
        ('teams', 'Teams'),
        ('reports', 'Reports'),
        ('settings', 'Settings'),
    ]
    
    name = models.CharField(max_length=255, unique=True)
    codename = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='users')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'custom_permissions'
        verbose_name = 'Permission'
        verbose_name_plural = 'Permissions'
        ordering = ['category', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.codename})"


class Role(models.Model):
    """
    Custom Role model for role-based access control
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    permissions = models.ManyToManyField(Permission, blank=True, related_name='roles')
    is_active = models.BooleanField(default=True)
    is_system = models.BooleanField(default=False)  # System roles cannot be deleted
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'custom_roles'
        verbose_name = 'Role'
        verbose_name_plural = 'Roles'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    @property
    def user_count(self):
        """Get the number of users with this role"""
        return self.users.count()


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
