"""
Shared constants for authentication and authorization
"""

# User roles
ROLES = {
    'ADMIN': 'admin',
    'MANAGER': 'manager',
    'DEVELOPER': 'developer',
    'DESIGNER': 'designer',
    'TESTER': 'tester',
    'USER': 'user',
    'PROJECT_MANAGER': 'PROJECT_MANAGER',
    'PROJECT_USER': 'PROJECT_USER',
}

# Permission strings
PERMISSIONS = {
    # Project permissions
    'PROJECT_VIEW': 'project:view',
    'PROJECT_CREATE': 'project:create',
    'PROJECT_EDIT': 'project:edit',
    'PROJECT_DELETE': 'project:delete',
    
    # Task permissions
    'TASK_VIEW': 'task:view',
    'TASK_CREATE': 'task:create',
    'TASK_EDIT': 'task:edit',
    'TASK_DELETE': 'task:delete',
    
    # User management permissions
    'USER_VIEW': 'user:view',
    'USER_CREATE': 'user:create',
    'USER_EDIT': 'user:edit',
    'USER_DELETE': 'user:delete',
    'USER_MANAGE': 'user:manage',
    
    # Permission management
    'PERMISSION_VIEW': 'permission:view',
    'PERMISSION_CHANGE': 'permission:change',
    'ROLE_VIEW': 'role:view',
    'ROLE_CHANGE': 'role:change',
    
    # Calendar permissions
    'CALENDAR_VIEW': 'calendar:view',
    'CALENDAR_CREATE': 'calendar:create',
    'CALENDAR_EDIT': 'calendar:edit',
    'CALENDAR_DELETE': 'calendar:delete',
    'CALENDAR_EXPORT': 'calendar:export',
    
    # System permissions
    'SYSTEM_ADMIN': 'system:admin',
    'TEAM_VIEW': 'team:view',
    'TEAM_MANAGE': 'team:manage',
}

# Role-based permission groups
ROLE_PERMISSIONS = {
    ROLES['ADMIN']: [
        PERMISSIONS['PROJECT_VIEW'], PERMISSIONS['PROJECT_CREATE'], PERMISSIONS['PROJECT_EDIT'], PERMISSIONS['PROJECT_DELETE'],
        PERMISSIONS['TASK_VIEW'], PERMISSIONS['TASK_CREATE'], PERMISSIONS['TASK_EDIT'], PERMISSIONS['TASK_DELETE'],
        PERMISSIONS['USER_VIEW'], PERMISSIONS['USER_CREATE'], PERMISSIONS['USER_EDIT'], PERMISSIONS['USER_DELETE'], PERMISSIONS['USER_MANAGE'],
        PERMISSIONS['CALENDAR_VIEW'], PERMISSIONS['CALENDAR_CREATE'], PERMISSIONS['CALENDAR_EDIT'], PERMISSIONS['CALENDAR_DELETE'], PERMISSIONS['CALENDAR_EXPORT'],
        PERMISSIONS['SYSTEM_ADMIN'], PERMISSIONS['TEAM_VIEW'], PERMISSIONS['TEAM_MANAGE'],
        PERMISSIONS['PERMISSION_VIEW'], PERMISSIONS['PERMISSION_CHANGE'], PERMISSIONS['ROLE_VIEW'], PERMISSIONS['ROLE_CHANGE']
    ],
    
    ROLES['MANAGER']: [
        PERMISSIONS['PROJECT_VIEW'], PERMISSIONS['PROJECT_CREATE'], PERMISSIONS['PROJECT_EDIT'], PERMISSIONS['PROJECT_DELETE'],
        PERMISSIONS['TASK_VIEW'], PERMISSIONS['TASK_CREATE'], PERMISSIONS['TASK_EDIT'], PERMISSIONS['TASK_DELETE'],
        PERMISSIONS['USER_VIEW'], PERMISSIONS['USER_CREATE'], PERMISSIONS['USER_EDIT'],
        PERMISSIONS['CALENDAR_VIEW'], PERMISSIONS['CALENDAR_CREATE'], PERMISSIONS['CALENDAR_EDIT'], PERMISSIONS['CALENDAR_DELETE'], PERMISSIONS['CALENDAR_EXPORT'],
    ],
    
    ROLES['PROJECT_MANAGER']: [
        PERMISSIONS['PROJECT_VIEW'], PERMISSIONS['PROJECT_CREATE'], PERMISSIONS['PROJECT_EDIT'], PERMISSIONS['PROJECT_DELETE'],
        PERMISSIONS['TASK_VIEW'], PERMISSIONS['TASK_CREATE'], PERMISSIONS['TASK_EDIT'], PERMISSIONS['TASK_DELETE'],
        PERMISSIONS['USER_VIEW'], PERMISSIONS['USER_CREATE'], PERMISSIONS['USER_EDIT'],
        PERMISSIONS['CALENDAR_VIEW'], PERMISSIONS['CALENDAR_CREATE'], PERMISSIONS['CALENDAR_EDIT'], PERMISSIONS['CALENDAR_DELETE'], PERMISSIONS['CALENDAR_EXPORT'],
    ],
    
    ROLES['DEVELOPER']: [
        PERMISSIONS['PROJECT_VIEW'],
        PERMISSIONS['TASK_VIEW'], PERMISSIONS['TASK_CREATE'], PERMISSIONS['TASK_EDIT'],
        PERMISSIONS['CALENDAR_VIEW'],
    ],
    
    ROLES['DESIGNER']: [
        PERMISSIONS['PROJECT_VIEW'],
        PERMISSIONS['TASK_VIEW'], PERMISSIONS['TASK_CREATE'], PERMISSIONS['TASK_EDIT'],
        PERMISSIONS['CALENDAR_VIEW'],
    ],
    
    ROLES['TESTER']: [
        PERMISSIONS['PROJECT_VIEW'],
        PERMISSIONS['TASK_VIEW'], PERMISSIONS['TASK_EDIT'],
        PERMISSIONS['CALENDAR_VIEW'],
    ],
    
    ROLES['USER']: [
        PERMISSIONS['PROJECT_VIEW'],
        PERMISSIONS['TASK_VIEW'],
        PERMISSIONS['CALENDAR_VIEW'],
    ],
    
    ROLES['PROJECT_USER']: [
        PERMISSIONS['PROJECT_VIEW'],
        PERMISSIONS['TASK_VIEW'],
        PERMISSIONS['CALENDAR_VIEW'],
    ],
}

# User status options
USER_STATUS_CHOICES = [
    ('active', 'Active'),
    ('inactive', 'Inactive'),
    ('suspended', 'Suspended'),
]

# Role choices for Django model
ROLE_CHOICES = [
    (ROLES['ADMIN'], 'Administrator'),
    (ROLES['MANAGER'], 'Manager'),
    (ROLES['DEVELOPER'], 'Developer'),
    (ROLES['DESIGNER'], 'Designer'),
    (ROLES['TESTER'], 'Tester'),
    (ROLES['USER'], 'User'),
    (ROLES['PROJECT_MANAGER'], 'Project Manager'),
    (ROLES['PROJECT_USER'], 'Project User'),
]

# Helper functions
def get_role_permissions(role):
    """Get permissions for a specific role"""
    return ROLE_PERMISSIONS.get(role, [])

def has_permission(user, permission):
    """Check if user has a specific permission"""
    if not user:
        return False
    
    # Superuser has all permissions
    if user.role == ROLES['ADMIN'] or user.is_superuser or user.is_staff:
        return True
    
    user_permissions = get_role_permissions(user.role)
    return permission in user_permissions

def is_super_user(user):
    """Check if user is a superuser"""
    return user.role == ROLES['ADMIN'] or user.is_superuser or user.is_staff

def can_manage_users(user):
    """Check if user can manage other users"""
    return is_super_user(user) or user.role == ROLES['MANAGER']
