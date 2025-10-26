from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Project, ProjectComment, ProjectAttachment, Task, TaskComment, TaskAttachment, TimeEntry, ProjectNote

User = get_user_model()


class ProjectSerializer(serializers.ModelSerializer):
    """
    Serializer for Project model
    """
    manager_name = serializers.CharField(source='manager.full_name', read_only=True)
    team_count = serializers.ReadOnlyField()
    tasks_count = serializers.SerializerMethodField()
    completed_tasks_count = serializers.SerializerMethodField()
    is_overdue = serializers.ReadOnlyField()
    budget_utilization = serializers.ReadOnlyField()
    team_members = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'project_number', 'description', 'status', 'priority', 'category', 'department',
            'manager', 'manager_name', 'team', 'team_members', 'team_count',
            'start_date', 'deadline', 'completed_date', 'budget', 'spent',
            'progress', 'tags', 'attachments', 'notes', 'is_overdue',
            'budget_utilization', 'tasks_count', 'completed_tasks_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_tasks_count(self, obj):
        return obj.get_tasks_count()
    
    def get_completed_tasks_count(self, obj):
        return obj.get_completed_tasks_count()
    
    def get_team_members(self, obj):
        return [
            {
                'id': member.id,
                'username': member.username,
                'full_name': member.full_name,
                'role': member.role,
                'avatar': member.avatar.url if member.avatar else None
            }
            for member in obj.team.all()
        ]


class ProjectListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for project lists
    """
    manager_name = serializers.CharField(source='manager.full_name', read_only=True)
    manager_details = serializers.SerializerMethodField()
    team_count = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()
    progress = serializers.ReadOnlyField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'project_number', 'description', 'status', 'priority', 'category', 'department',
            'manager', 'manager_name', 'manager_details', 'team_count', 'start_date', 'deadline',
            'budget', 'spent', 'tags', 'notes',
            'progress', 'is_overdue', 'created_at'
        ]
    
    def get_manager_details(self, obj):
        if obj.manager:
            return {
                'id': obj.manager.id,
                'username': obj.manager.username,
                'full_name': obj.manager.full_name,
                'role': obj.manager.role,
                'position': obj.manager.position
            }
        return None


class ProjectCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating projects
    """
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'status', 'priority', 'category', 'department',
            'manager', 'team', 'start_date', 'deadline', 'budget',
            'tags', 'notes'
        ]
        read_only_fields = ['id']
    
    def validate(self, data):
        """Validate required fields and logical constraints"""
        errors = {}

        required_fields = ['name', 'status', 'priority', 'category', 'start_date', 'deadline', 'manager']
        for field in required_fields:
            if not data.get(field):
                errors[field] = ["Ce champ est obligatoire"]

        # Dates order
        start_date = data.get('start_date')
        deadline = data.get('deadline')
        if start_date and deadline and start_date > deadline:
            errors['deadline'] = ["La date de fin doit être postérieure à la date de début"]

        # Budget >= 0
        budget = data.get('budget')
        if budget is not None:
            try:
                if float(budget) < 0:
                    errors['budget'] = ["Le budget doit être supérieur ou égal à 0"]
            except Exception:
                errors['budget'] = ["Budget invalide"]

        if errors:
            raise serializers.ValidationError(errors)

        return data

    def create(self, validated_data):
        """Override create method to add debug logging"""
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f"Creating project with validated_data: {validated_data}")
        logger.info(f"Manager: {validated_data.get('manager')}")
        logger.info(f"Start date: {validated_data.get('start_date')}")
        logger.info(f"Deadline: {validated_data.get('deadline')}")
        logger.info(f"Budget: {validated_data.get('budget')}")
        logger.info(f"Tags: {validated_data.get('tags')}")
        
        return super().create(validated_data)
    
    def is_valid(self, raise_exception=False):
        """Override is_valid to add debug logging"""
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f"Serializer is_valid called with data: {self.initial_data}")
        logger.info(f"Manager in data: {self.initial_data.get('manager')}")
        logger.info(f"Start date in data: {self.initial_data.get('start_date')}")
        logger.info(f"Deadline in data: {self.initial_data.get('deadline')}")
        logger.info(f"Budget in data: {self.initial_data.get('budget')}")
        logger.info(f"Tags in data: {self.initial_data.get('tags')}")
        
        result = super().is_valid(raise_exception=raise_exception)
        
        if not result:
            logger.error(f"Validation failed with errors: {self.errors}")
        
        return result
    
    def validate_manager(self, value):
        """Validate manager field"""
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Validating manager: {value} (type: {type(value)})")
        
        if not value:
            raise serializers.ValidationError("Manager is required")
        return value
    
    def validate_start_date(self, value):
        """Validate start_date field"""
        if not value:
            raise serializers.ValidationError("Start date is required")
        return value
    
    def validate(self, data):
        """Validate project data"""
        start_date = data.get('start_date')
        deadline = data.get('deadline')
        
        if start_date and deadline and start_date > deadline:
            raise serializers.ValidationError("Start date cannot be after deadline")
        
        return data


class ProjectCommentSerializer(serializers.ModelSerializer):
    """
    Serializer for project comments
    """
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_avatar = serializers.SerializerMethodField()
    
    class Meta:
        model = ProjectComment
        fields = [
            'id', 'project', 'author', 'author_name', 'author_username',
            'author_avatar', 'content', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']
    
    def get_author_avatar(self, obj):
        return obj.author.avatar.url if obj.author.avatar else None
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class ProjectAttachmentSerializer(serializers.ModelSerializer):
    """
    Serializer for project attachments
    """
    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)
    file_size_human = serializers.ReadOnlyField()
    
    class Meta:
        model = ProjectAttachment
        fields = [
            'id', 'project', 'uploaded_by', 'uploaded_by_name',
            'file_name', 'file_path', 'file_size', 'file_size_human', 'file_type', 
            'description', 'uploaded_at'
        ]
        read_only_fields = ['id', 'uploaded_by', 'uploaded_at']
    
    def create(self, validated_data):
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)


class TaskSerializer(serializers.ModelSerializer):
    """
    Serializer for Task model
    """
    assignee_name = serializers.CharField(source='assignee.full_name', read_only=True)
    reporter_name = serializers.CharField(source='reporter.full_name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    is_overdue = serializers.ReadOnlyField()
    time_variance = serializers.ReadOnlyField()
    progress_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'task_number', 'description', 'status', 'priority', 'task_type',
            'project', 'project_name', 'assignee', 'assignee_name', 'reporter',
            'reporter_name', 'due_date', 'completed_date', 'estimated_time',
            'actual_time', 'tags', 'attachments', 'notes', 'is_overdue',
            'time_variance', 'progress_percentage', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'reporter', 'created_at', 'updated_at']


class TaskListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for task lists
    """
    assignee_name = serializers.CharField(source='assignee.full_name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    is_overdue = serializers.ReadOnlyField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'task_number', 'description', 'status', 'priority', 'task_type', 'project',
            'project_name', 'assignee', 'assignee_name', 'due_date',
            'estimated_time', 'actual_time', 'is_overdue', 'created_at'
        ]


class TaskCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating tasks
    """
    class Meta:
        model = Task
        fields = [
            'title', 'description', 'status', 'priority', 'task_type',
            'project', 'assignee', 'due_date', 'estimated_time', 'tags', 'notes'
        ]
    
    def create(self, validated_data):
        validated_data['reporter'] = self.context['request'].user
        return super().create(validated_data)


class TaskCommentSerializer(serializers.ModelSerializer):
    """
    Serializer for task comments
    """
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_avatar = serializers.SerializerMethodField()
    
    class Meta:
        model = TaskComment
        fields = [
            'id', 'task', 'author', 'author_name', 'author_username',
            'author_avatar', 'content', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']
    
    def get_author_avatar(self, obj):
        return obj.author.avatar.url if obj.author.avatar else None
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class TaskAttachmentSerializer(serializers.ModelSerializer):
    """
    Serializer for task attachments
    """
    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)
    
    class Meta:
        model = TaskAttachment
        fields = [
            'id', 'task', 'uploaded_by', 'uploaded_by_name',
            'file_name', 'file_path', 'file_size', 'file_type', 'uploaded_at'
        ]
        read_only_fields = ['id', 'uploaded_by', 'uploaded_at']
    
    def create(self, validated_data):
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)


class TimeEntrySerializer(serializers.ModelSerializer):
    """
    Serializer for time entries
    """
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    task_title = serializers.CharField(source='task.title', read_only=True)
    
    class Meta:
        model = TimeEntry
        fields = [
            'id', 'task', 'task_title', 'user', 'user_name',
            'description', 'hours', 'date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ProjectNoteSerializer(serializers.ModelSerializer):
    """
    Serializer for project notes (social media style)
    """
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_avatar = serializers.SerializerMethodField()
    author_position = serializers.CharField(source='author.position', read_only=True)
    likes_count = serializers.ReadOnlyField()
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = ProjectNote
        fields = [
            'id', 'project', 'author', 'author_name', 'author_username',
            'author_avatar', 'author_position', 'content', 'likes_count',
            'is_liked', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']
    
    def get_author_avatar(self, obj):
        return obj.author.avatar.url if obj.author.avatar else None
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)
