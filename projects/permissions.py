from rest_framework import permissions


class IsProjectManagerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow:
    - PROJECT_MANAGER: Full access (read, create, update, delete)
    - PROJECT_USER: Read-only access
    - Other users: No access
    """
    
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admins/superusers always allowed
        if getattr(request.user, 'is_superuser', False) or getattr(request.user, 'is_staff', False) or getattr(request.user, 'role', None) == 'admin':
            return True

        # Allow read-only for safe methods
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Check if user has PROJECT_MANAGER role
        user_role = getattr(request.user, 'role', None)
        return user_role == 'PROJECT_MANAGER'
    
    def has_object_permission(self, request, view, obj):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admins/superusers always allowed
        if getattr(request.user, 'is_superuser', False) or getattr(request.user, 'is_staff', False) or getattr(request.user, 'role', None) == 'admin':
            return True

        # Allow read-only for safe methods
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Check if user has PROJECT_MANAGER role
        user_role = getattr(request.user, 'role', None)
        return user_role == 'PROJECT_MANAGER'


class IsProjectManager(permissions.BasePermission):
    """
    Permission that only allows PROJECT_MANAGER role
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admins/superusers always allowed
        if getattr(request.user, 'is_superuser', False) or getattr(request.user, 'is_staff', False) or getattr(request.user, 'role', None) == 'admin':
            return True

        user_role = getattr(request.user, 'role', None)
        return user_role == 'PROJECT_MANAGER'


class CanViewProject(permissions.BasePermission):
    """
    Permission that allows all authenticated users to view projects and tasks
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # All authenticated users can view data
        return True


class CanModifyProject(permissions.BasePermission):
    """
    Permission that allows all authenticated users to view data
    Only allows PROJECT_MANAGER, admin, manager roles to modify
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admins/superusers always allowed (both read and modify)
        if getattr(request.user, 'is_superuser', False) or getattr(request.user, 'is_staff', False) or getattr(request.user, 'role', None) == 'admin':
            return True

        user_role = getattr(request.user, 'role', None)
        
        # Allow all authenticated users to read data
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Only allow modifications for specific roles
        if request.method not in permissions.SAFE_METHODS:
            return user_role in ['PROJECT_MANAGER', 'manager', 'admin']
        
        return True
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admins/superusers always allowed (both read and modify)
        if getattr(request.user, 'is_superuser', False) or getattr(request.user, 'is_staff', False) or getattr(request.user, 'role', None) == 'admin':
            return True

        user_role = getattr(request.user, 'role', None)
        
        # Allow all authenticated users to read data
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Only allow modifications for specific roles
        if request.method not in permissions.SAFE_METHODS:
            return user_role in ['PROJECT_MANAGER', 'manager', 'admin']
        
        return True
