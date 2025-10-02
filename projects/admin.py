from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    Project, ProjectComment, ProjectAttachment, ProjectNote,
    Task, TaskComment, TaskAttachment, TimeEntry
)


class ProjectCommentInline(admin.TabularInline):
    """Inline admin for project comments"""
    model = ProjectComment
    extra = 0
    readonly_fields = ('created_at', 'updated_at')
    fields = ('author', 'content', 'created_at')


class ProjectAttachmentInline(admin.TabularInline):
    """Inline admin for project attachments"""
    model = ProjectAttachment
    extra = 0
    readonly_fields = ('uploaded_at', 'file_size')
    fields = ('file_name', 'file_path', 'file_type', 'file_size', 'uploaded_at')


class ProjectNoteInline(admin.TabularInline):
    """Inline admin for project notes"""
    model = ProjectNote
    extra = 0
    readonly_fields = ('created_at', 'updated_at', 'likes_count')
    fields = ('author', 'content', 'likes_count', 'created_at')


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    """Project Admin"""
    list_display = ('name', 'project_number', 'manager', 'status', 'priority', 'progress', 'budget_utilization', 'team_count', 'created_at')
    list_filter = ('status', 'priority', 'category', 'created_at', 'deadline', 'manager__department')
    search_fields = ('name', 'project_number', 'description', 'manager__username', 'manager__email')
    ordering = ('-created_at',)
    readonly_fields = ('project_number', 'created_at', 'updated_at', 'budget_utilization', 'team_count', 'is_overdue')
    filter_horizontal = ('team',)
    inlines = [ProjectCommentInline, ProjectAttachmentInline, ProjectNoteInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'project_number', 'description', 'status', 'priority', 'category')
        }),
        ('Management', {
            'fields': ('manager', 'team')
        }),
        ('Timeline', {
            'fields': ('start_date', 'deadline', 'completed_date')
        }),
        ('Budget & Resources', {
            'fields': ('budget', 'spent', 'budget_utilization')
        }),
        ('Progress', {
            'fields': ('progress',)
        }),
        ('Additional', {
            'fields': ('tags', 'attachments', 'notes'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_overdue', 'team_count'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('manager').prefetch_related('team')


class TaskCommentInline(admin.TabularInline):
    """Inline admin for task comments"""
    model = TaskComment
    extra = 0
    readonly_fields = ('created_at', 'updated_at')
    fields = ('author', 'content', 'created_at')


class TaskAttachmentInline(admin.TabularInline):
    """Inline admin for task attachments"""
    model = TaskAttachment
    extra = 0
    readonly_fields = ('uploaded_at', 'file_size')
    fields = ('file_name', 'file_path', 'file_type', 'file_size', 'uploaded_at')


class TimeEntryInline(admin.TabularInline):
    """Inline admin for time entries"""
    model = TimeEntry
    extra = 0
    readonly_fields = ('created_at', 'updated_at')
    fields = ('user', 'description', 'hours', 'date', 'created_at')


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    """Task Admin"""
    list_display = ('title', 'task_number', 'project', 'assignee', 'status', 'priority', 'task_type', 'progress_percentage', 'is_overdue', 'created_at')
    list_filter = ('status', 'priority', 'task_type', 'created_at', 'due_date', 'project__status')
    search_fields = ('title', 'task_number', 'description', 'assignee__username', 'project__name')
    ordering = ('-created_at',)
    readonly_fields = ('task_number', 'created_at', 'updated_at', 'progress_percentage', 'time_variance', 'is_overdue')
    inlines = [TaskCommentInline, TaskAttachmentInline, TimeEntryInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'task_number', 'description', 'status', 'priority', 'task_type')
        }),
        ('Relationships', {
            'fields': ('project', 'assignee', 'reporter')
        }),
        ('Timeline', {
            'fields': ('due_date', 'completed_date')
        }),
        ('Time Tracking', {
            'fields': ('estimated_time', 'actual_time', 'time_variance')
        }),
        ('Additional', {
            'fields': ('tags', 'attachments', 'notes'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('progress_percentage', 'is_overdue'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('project', 'assignee', 'reporter')


@admin.register(ProjectComment)
class ProjectCommentAdmin(admin.ModelAdmin):
    """Project Comment Admin"""
    list_display = ('project', 'author', 'content_preview', 'created_at')
    list_filter = ('created_at', 'project__status')
    search_fields = ('project__name', 'author__username', 'content')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content Preview'


@admin.register(ProjectAttachment)
class ProjectAttachmentAdmin(admin.ModelAdmin):
    """Project Attachment Admin"""
    list_display = ('file_name', 'project', 'uploaded_by', 'file_type', 'file_size_mb', 'uploaded_at')
    list_filter = ('file_type', 'uploaded_at', 'project__status')
    search_fields = ('file_name', 'project__name', 'uploaded_by__username')
    ordering = ('-uploaded_at',)
    readonly_fields = ('uploaded_at',)
    
    def file_size_mb(self, obj):
        return f"{obj.file_size / (1024 * 1024):.2f} MB"
    file_size_mb.short_description = 'File Size'


@admin.register(ProjectNote)
class ProjectNoteAdmin(admin.ModelAdmin):
    """Project Note Admin"""
    list_display = ('author', 'project', 'content_preview', 'likes_count', 'created_at')
    list_filter = ('created_at', 'project__status')
    search_fields = ('author__username', 'project__name', 'content')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'likes_count')
    filter_horizontal = ('likes',)
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content Preview'


@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    """Task Comment Admin"""
    list_display = ('task', 'author', 'content_preview', 'created_at')
    list_filter = ('created_at', 'task__status')
    search_fields = ('task__title', 'author__username', 'content')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content Preview'


@admin.register(TaskAttachment)
class TaskAttachmentAdmin(admin.ModelAdmin):
    """Task Attachment Admin"""
    list_display = ('file_name', 'task', 'uploaded_by', 'file_type', 'file_size_mb', 'uploaded_at')
    list_filter = ('file_type', 'uploaded_at', 'task__status')
    search_fields = ('file_name', 'task__title', 'uploaded_by__username')
    ordering = ('-uploaded_at',)
    readonly_fields = ('uploaded_at',)
    
    def file_size_mb(self, obj):
        return f"{obj.file_size / (1024 * 1024):.2f} MB"
    file_size_mb.short_description = 'File Size'


@admin.register(TimeEntry)
class TimeEntryAdmin(admin.ModelAdmin):
    """Time Entry Admin"""
    list_display = ('user', 'task', 'hours', 'date', 'description_preview', 'created_at')
    list_filter = ('date', 'created_at', 'task__status', 'task__project')
    search_fields = ('user__username', 'task__title', 'description')
    ordering = ('-date', '-created_at')
    readonly_fields = ('created_at', 'updated_at')
    
    def description_preview(self, obj):
        return obj.description[:50] + '...' if obj.description and len(obj.description) > 50 else obj.description or 'No description'
    description_preview.short_description = 'Description Preview'
