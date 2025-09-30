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
        ('PROJECT_MANAGER', 'Project Manager'),
        ('PROJECT_USER', 'Project User'),
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
        # Superuser (admin) has ALL permissions - no restrictions
        if self.role == 'admin' or self.is_superuser or self.is_staff:
            return True
        
        # Define simple role-based permission groups
        role_permissions = {
            'admin': [
                'project:view', 'project:create', 'project:edit', 'project:delete',
                'task:view', 'task:create', 'task:edit', 'task:delete',
                'user:view', 'user:create', 'user:edit', 'user:delete', 'user:manage'
            ],
            'manager': [
                'project:view', 'project:create', 'project:edit', 'project:delete',
                'task:view', 'task:create', 'task:edit', 'task:delete'
                # Removed user permissions - only superuser can manage users
            ],
            'developer': [
                'project:view', 'task:view', 'task:create', 'task:edit'
            ],
            'designer': [
                'project:view', 'task:view', 'task:create', 'task:edit'
            ],
            'tester': [
                'project:view', 'task:view', 'task:edit'
            ],
            'user': [
                'project:view', 'task:view'
            ],
            'PROJECT_MANAGER': [
                'project:view', 'project:create', 'project:edit', 'project:delete',
                'task:view', 'task:create', 'task:edit', 'task:delete'
                # Removed user permissions - only superuser can manage users
            ],
            'PROJECT_USER': [
                'project:view', 'task:view'
            ]
        }
        
        return permission in role_permissions.get(self.role, [])
    
    def save(self, *args, **kwargs):
        """Override save to ensure superuser has admin role"""
        if self.is_superuser and self.role != 'admin':
            self.role = 'admin'
        # Ensure admin/staff flags are consistent for superusers
        if self.is_superuser:
            if not self.is_staff:
                self.is_staff = True
        super().save(*args, **kwargs)
    
    def is_protected_user(self):
        """Check if user is protected from frontend modifications"""
        return self.is_superuser or self.username in ['admin', 'root', 'superuser']
    
    def can_be_modified_by(self, requesting_user):
        """Check if this user can be modified by the requesting user"""
        if not requesting_user:
            return False
        
        # Superusers can only be modified by other superusers
        if self.is_superuser:
            return requesting_user.is_superuser
        
        # Regular users can be modified by superusers or managers
        return requesting_user.is_superuser or requesting_user.role in ['admin', 'manager']
    
    @classmethod
    def fix_superuser_roles(cls):
        """Fix all superusers to have admin role"""
        superusers = cls.objects.filter(is_superuser=True)
        for user in superusers:
            if user.role != 'admin':
                user.role = 'admin'
                user.save()
                print(f"Fixed role for superuser: {user.username}")
        return superusers.count()
    
    @classmethod
    def fix_admin_user(cls):
        """Fix the admin user specifically"""
        try:
            admin_user = cls.objects.get(username='admin')
            if admin_user.role != 'admin':
                admin_user.role = 'admin'
                admin_user.save()
                print(f"Fixed admin user role: {admin_user.role}")
            return admin_user
        except cls.DoesNotExist:
            print("Admin user not found")
            return None
    
    def get_permissions(self):
        """Get all permissions for the user"""
        # Superuser (admin) has ALL permissions
        if self.role == 'admin' or self.is_superuser or self.is_staff:
            return [
                'project:view', 'project:create', 'project:edit', 'project:delete',
                'task:view', 'task:create', 'task:edit', 'task:delete',
                'user:view', 'user:create', 'user:edit', 'user:delete', 'user:manage',
                'team:view', 'team:manage',
                'system:admin'  # Special permission for system administration
            ]
        
        # Simple role-based permission groups
        role_permissions = {
            'manager': [
                'project:view', 'project:create', 'project:edit', 'project:delete',
                'task:view', 'task:create', 'task:edit', 'task:delete',
                'user:view', 'user:create', 'user:edit'
            ],
            'developer': [
                'project:view', 'task:view', 'task:create', 'task:edit'
            ],
            'designer': [
                'project:view', 'task:view', 'task:create', 'task:edit'
            ],
            'tester': [
                'project:view', 'task:view', 'task:edit'
            ],
            'user': [
                'project:view', 'task:view'
            ],
            'PROJECT_MANAGER': [
                'project:view', 'project:create', 'project:edit', 'project:delete',
                'task:view', 'task:create', 'task:edit', 'task:delete',
                'user:view', 'user:create', 'user:edit'
            ],
            'PROJECT_USER': [
                'project:view', 'task:view'
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
