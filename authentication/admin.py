from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User, Permission, Role, UserSession, DepartmentPermission


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User Admin"""
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'status', 'is_active', 'is_staff', 'created_at')
    list_filter = ('role', 'status', 'is_active', 'is_staff', 'is_superuser', 'created_at', 'department', 'filiale')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'phone', 'department', 'position')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'last_login_ip')
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'avatar', 'phone', 'location')}),
        ('Work info', {'fields': ('department', 'position', 'filiale', 'join_date')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'role', 'status', 'groups', 'user_permissions', 'roles')}),
        ('Important dates', {'fields': ('last_login', 'date_joined', 'created_at', 'updated_at')}),
        ('Security', {'fields': ('last_login_ip',)}),
        ('Preferences', {'fields': ('preferences',)}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'role', 'status'),
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related()


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    """Permission Admin"""
    list_display = ('name', 'codename', 'category', 'is_active', 'created_at')
    list_filter = ('category', 'is_active', 'created_at')
    search_fields = ('name', 'codename', 'description')
    ordering = ('category', 'name')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (None, {'fields': ('name', 'codename', 'description')}),
        ('Category', {'fields': ('category',)}),
        ('Status', {'fields': ('is_active',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    """Role Admin"""
    list_display = ('name', 'description', 'user_count', 'is_active', 'is_system', 'created_at')
    list_filter = ('is_active', 'is_system', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('name',)
    readonly_fields = ('created_at', 'updated_at', 'user_count')
    filter_horizontal = ('permissions',)
    
    fieldsets = (
        (None, {'fields': ('name', 'description')}),
        ('Permissions', {'fields': ('permissions',)}),
        ('Status', {'fields': ('is_active', 'is_system')}),
        ('Statistics', {'fields': ('user_count',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('permissions', 'users')


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    """User Session Admin"""
    list_display = ('user', 'ip_address', 'created_at', 'last_activity', 'is_active')
    list_filter = ('is_active', 'created_at', 'last_activity')
    search_fields = ('user__username', 'user__email', 'ip_address', 'session_key')
    ordering = ('-last_activity',)
    readonly_fields = ('session_key', 'created_at', 'last_activity')
    
    fieldsets = (
        (None, {'fields': ('user', 'session_key', 'ip_address')}),
        ('Browser Info', {'fields': ('user_agent',)}),
        ('Status', {'fields': ('is_active',)}),
        ('Timestamps', {'fields': ('created_at', 'last_activity')}),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(DepartmentPermission)
class DepartmentPermissionAdmin(admin.ModelAdmin):
    """Department Permission Admin"""
    list_display = ('user', 'department', 'can_view', 'can_edit', 'can_create', 'can_delete', 'created_at')
    list_filter = ('department', 'can_view', 'can_edit', 'can_create', 'can_delete', 'created_at')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name')
    ordering = ('user__username', 'department')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (None, {'fields': ('user', 'department')}),
        ('Permissions', {'fields': ('can_view', 'can_edit', 'can_create', 'can_delete')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')
