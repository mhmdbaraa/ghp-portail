from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import date
from .constants import ROLES, PERMISSIONS, ROLE_PERMISSIONS, USER_STATUS_CHOICES, ROLE_CHOICES, has_permission, is_super_user

# Department choices from projects app
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


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser
    """
    ROLE_CHOICES = ROLE_CHOICES
    STATUS_CHOICES = USER_STATUS_CHOICES
    
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
        return has_permission(self, permission)
    
    def can_view_department(self, department):
        """Check if user can view projects from a specific department"""
        # Superusers and admins can see all departments
        if self.is_superuser or self.role == 'admin':
            return True
        
        # Check if user has explicit permission for this department
        try:
            perm = self.department_permissions.get(department=department)
            return perm.can_view
        except DepartmentPermission.DoesNotExist:
            # If no explicit permission, check if it's their own department
            return self.department == department
    
    def can_edit_department(self, department):
        """Check if user can edit projects from a specific department"""
        # Superusers and admins can edit all departments
        if self.is_superuser or self.role == 'admin':
            return True
        
        # Check if user has explicit permission for this department
        try:
            perm = self.department_permissions.get(department=department)
            return perm.can_edit
        except DepartmentPermission.DoesNotExist:
            # If no explicit permission, check if it's their own department
            return self.department == department
    
    def can_create_department(self, department):
        """Check if user can create projects for a specific department"""
        # Superusers and admins can create for all departments
        if self.is_superuser or self.role == 'admin':
            return True
        
        # Check if user has explicit permission for this department
        try:
            perm = self.department_permissions.get(department=department)
            return perm.can_create
        except DepartmentPermission.DoesNotExist:
            # If no explicit permission, check if it's their own department
            return self.department == department
    
    def get_accessible_departments(self):
        """Get list of departments the user can access"""
        # Superusers and admins can access all departments
        if self.is_superuser or self.role == 'admin':
            return [choice[0] for choice in DEPARTMENT_CHOICES]
        
        accessible = []
        
        # Add user's own department
        if self.department:
            accessible.append(self.department)
        
        # Add departments with explicit permissions
        for perm in self.department_permissions.filter(can_view=True):
            if perm.department not in accessible:
                accessible.append(perm.department)
        
        return accessible
    
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
        from .constants import get_role_permissions
        return get_role_permissions(self.role)


class Permission(models.Model):
    """
    Custom Permission model for fine-grained access control
    """
    CATEGORY_CHOICES = [
        ('users', 'Utilisateurs'),
        ('projects', 'Projets'),
        ('tasks', 'Tâches'),
        ('teams', 'Équipes'),
        ('calendar', 'Calendrier'),
        ('reports', 'Rapports'),
        ('settings', 'Paramètres'),
        ('finance', 'Finance'),
        ('hr', 'Ressources Humaines'),
        ('inventory', 'Inventaire'),
        ('sales', 'Ventes'),
        ('marketing', 'Marketing'),
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
    display_name = models.CharField(max_length=255, blank=True, null=True)
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


class DepartmentPermission(models.Model):
    """
    Model to manage user permissions for departments
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='department_permissions')
    department = models.CharField(max_length=20, choices=DEPARTMENT_CHOICES)
    can_view = models.BooleanField(default=True)
    can_edit = models.BooleanField(default=False)
    can_create = models.BooleanField(default=False)
    can_delete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'department_permissions'
        unique_together = ['user', 'department']
        verbose_name = 'Department Permission'
        verbose_name_plural = 'Department Permissions'
    
    def __str__(self):
        return f"{self.user.username} - {self.get_department_display()}"
