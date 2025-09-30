import django_filters
from django.db.models import Q
from .models import Project, Task


class ProjectFilter(django_filters.FilterSet):
    """
    Filter for projects
    """
    status = django_filters.ChoiceFilter(choices=Project.STATUS_CHOICES)
    priority = django_filters.ChoiceFilter(choices=Project.PRIORITY_CHOICES)
    category = django_filters.ChoiceFilter(choices=Project.CATEGORY_CHOICES)
    
    # Date filters
    start_date_after = django_filters.DateFilter(field_name='start_date', lookup_expr='gte')
    start_date_before = django_filters.DateFilter(field_name='start_date', lookup_expr='lte')
    deadline_after = django_filters.DateFilter(field_name='deadline', lookup_expr='gte')
    deadline_before = django_filters.DateFilter(field_name='deadline', lookup_expr='lte')
    
    # Team member filter
    team_member = django_filters.NumberFilter(method='filter_team_member')
    
    # Manager filter
    manager = django_filters.NumberFilter(field_name='manager')
    
    # Overdue filter
    is_overdue = django_filters.BooleanFilter(method='filter_overdue')
    
    class Meta:
        model = Project
        fields = ['status', 'priority', 'category', 'manager', 'team_member', 'is_overdue']
    
    def filter_team_member(self, queryset, name, value):
        """Filter projects by team member"""
        return queryset.filter(team=value)
    
    def filter_overdue(self, queryset, name, value):
        """Filter overdue projects"""
        from django.utils import timezone
        if value:
            return queryset.filter(
                deadline__lt=timezone.now().date(),
                status__in=['planning', 'in_progress']
            )
        return queryset


class TaskFilter(django_filters.FilterSet):
    """
    Filter for tasks
    """
    status = django_filters.ChoiceFilter(choices=Task.STATUS_CHOICES)
    priority = django_filters.ChoiceFilter(choices=Task.PRIORITY_CHOICES)
    task_type = django_filters.ChoiceFilter(choices=Task.TYPE_CHOICES)
    
    # Date filters
    due_date_after = django_filters.DateTimeFilter(field_name='due_date', lookup_expr='gte')
    due_date_before = django_filters.DateTimeFilter(field_name='due_date', lookup_expr='lte')
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    # User filters
    assignee = django_filters.NumberFilter(field_name='assignee')
    reporter = django_filters.NumberFilter(field_name='reporter')
    
    # Project filter
    project = django_filters.NumberFilter(field_name='project')
    
    # Overdue filter
    is_overdue = django_filters.BooleanFilter(method='filter_overdue')
    
    # My tasks filter
    my_tasks = django_filters.BooleanFilter(method='filter_my_tasks')
    
    class Meta:
        model = Task
        fields = ['status', 'priority', 'task_type', 'assignee', 'reporter', 'project', 'is_overdue', 'my_tasks']
    
    def filter_overdue(self, queryset, name, value):
        """Filter overdue tasks"""
        from django.utils import timezone
        if value:
            return queryset.filter(
                due_date__lt=timezone.now(),
                status__in=['not_started', 'in_progress']
            )
        return queryset
    
    def filter_my_tasks(self, queryset, name, value):
        """Filter tasks assigned to current user"""
        if value and hasattr(self, 'request') and self.request.user.is_authenticated:
            return queryset.filter(assignee=self.request.user)
        return queryset


