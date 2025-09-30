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
        
        user_role = getattr(request.user, 'role', None)
        return user_role == 'PROJECT_MANAGER'


class CanViewProject(permissions.BasePermission):
    """
    Permission that allows both PROJECT_MANAGER and PROJECT_USER to view
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        user_role = getattr(request.user, 'role', None)
        return user_role in ['PROJECT_MANAGER', 'PROJECT_USER']


class CanModifyProject(permissions.BasePermission):
    """
    Permission that only allows PROJECT_MANAGER to modify
    Blocks access entirely if user doesn't have PROJECT_MANAGER or PROJECT_USER role
    """
    
    message = "Vous devez avoir un rôle PROJECT_MANAGER ou PROJECT_USER pour accéder aux projets."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        user_role = getattr(request.user, 'role', None)
        
        # Block access if user doesn't have any project role
        if user_role not in ['PROJECT_MANAGER', 'PROJECT_USER']:
            return False
        
        # Only allow modifications for PROJECT_MANAGER
        if request.method not in permissions.SAFE_METHODS:
            return user_role == 'PROJECT_MANAGER'
        
        # Allow read for both roles
        return True
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        user_role = getattr(request.user, 'role', None)
        
        # Block access if user doesn't have any project role
        if user_role not in ['PROJECT_MANAGER', 'PROJECT_USER']:
            return False
        
        # Only allow modifications for PROJECT_MANAGER
        if request.method not in permissions.SAFE_METHODS:
            return user_role == 'PROJECT_MANAGER'
        
        # Allow read for both roles
        return True
