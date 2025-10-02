from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User, Permission, Role


class PermissionSerializer(serializers.ModelSerializer):
    """
    Serializer for Permission model
    """
    class Meta:
        model = Permission
        fields = [
            'id', 'name', 'codename', 'description', 'category', 
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class RoleSerializer(serializers.ModelSerializer):
    """
    Serializer for Role model
    """
    permissions = PermissionSerializer(many=True, read_only=True)
    permission_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    user_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Role
        fields = [
            'id', 'name', 'display_name', 'description', 'permissions', 'permission_ids',
            'is_active', 'is_system', 'user_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_system', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Create role with permissions"""
        permission_ids = validated_data.pop('permission_ids', [])
        role = Role.objects.create(**validated_data)
        
        if permission_ids:
            permissions = Permission.objects.filter(id__in=permission_ids)
            role.permissions.set(permissions)
        
        return role
    
    def update(self, instance, validated_data):
        """Update role with permissions"""
        permission_ids = validated_data.pop('permission_ids', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if permission_ids is not None:
            permissions = Permission.objects.filter(id__in=permission_ids)
            instance.permissions.set(permissions)
        
        return instance


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model - used for API responses
    """
    full_name = serializers.ReadOnlyField()
    permissions = serializers.SerializerMethodField()
    roles = RoleSerializer(many=True, read_only=True)
    role_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    last_login = serializers.DateTimeField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'status', 'avatar', 'phone', 'location', 'department', 
            'position', 'filiale', 'join_date', 'last_login', 'preferences', 
            'permissions', 'roles', 'role_ids', 'created_at', 'updated_at',
            'is_superuser', 'is_staff'
        ]
        read_only_fields = ['id', 'last_login', 'created_at', 'updated_at', 'is_superuser', 'is_staff']
    
    def get_permissions(self, obj):
        """Get user permissions based on role and custom roles"""
        # Get permissions from both the built-in role and custom roles
        permissions = set(obj.get_permissions())
        
        # Add permissions from custom roles
        for role in obj.roles.all():
            for permission in role.permissions.all():
                permissions.add(permission.codename)
        
        return list(permissions)
    
    def update(self, instance, validated_data):
        """Update user with roles - with superuser protection"""
        # Check if trying to modify a protected user
        if instance.is_protected_user():
            # Only allow superusers to modify other superusers
            requesting_user = self.context.get('request').user if self.context.get('request') else None
            if not requesting_user or not requesting_user.is_superuser:
                raise serializers.ValidationError(
                    "Cannot modify protected user (superuser) from frontend"
                )
        
        role_ids = validated_data.pop('role_ids', None)
        
        # Prevent changing superuser status from frontend
        if 'is_superuser' in validated_data:
            validated_data.pop('is_superuser')
        if 'is_staff' in validated_data:
            validated_data.pop('is_staff')
        
        # Support partial update for role/status only without requiring all fields
        # Keep existing values when not provided
        for key in ['username', 'email', 'first_name', 'last_name', 'status', 'department', 'position', 'phone', 'filiale', 'location', 'preferences', 'role']:
            if key not in validated_data:
                # do not overwrite existing values
                continue

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if role_ids is not None:
            roles = Role.objects.filter(id__in=role_ids)
            instance.roles.set(roles)
        
        return instance


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone', 'location', 
            'department', 'position', 'filiale'
        ]
    
    def validate_username(self, value):
        """Validate username uniqueness"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value
    
    def validate_email(self, value):
        """Validate email uniqueness"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value
    
    def validate(self, attrs):
        """Validate registration data"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        
        return attrs
    
    def create(self, validated_data):
        """Create new user"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile updates
    """
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'email', 'phone', 'location',
            'department', 'position', 'preferences'
        ]
    
    def validate_email(self, value):
        """Validate email uniqueness"""
        if self.instance and self.instance.email == value:
            return value
        
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        
        return value


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT token serializer that includes user data
    """
    username_field = 'username'
    
    def validate(self, attrs):
        """Validate credentials and return user with tokens"""
        # Support both username and email login
        username_or_email = attrs.get('username')
        password = attrs.get('password')
        
        if not username_or_email or not password:
            raise serializers.ValidationError('Username/email and password are required')
        
        # Try to authenticate with username first, then email
        user = authenticate(
            request=self.context.get('request'),
            username=username_or_email,
            password=password
        )
        
        if not user:
            # Try with email
            try:
                user_obj = User.objects.get(email=username_or_email)
                user = authenticate(
                    request=self.context.get('request'),
                    username=user_obj.username,
                    password=password
                )
            except User.DoesNotExist:
                pass
        
        if not user:
            raise serializers.ValidationError('Invalid credentials')
        
        if not user.is_active:
            raise serializers.ValidationError('User account is disabled')
        
        # Generate tokens
        refresh = self.get_token(user)
        
        return {
            'user': user,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }
        }
    
    @classmethod
    def get_token(cls, user):
        """Get JWT token for user"""
        token = super().get_token(user)
        
        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        token['permissions'] = user.get_permissions()
        
        return token


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for password change
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, attrs):
        """Validate password change data"""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        
        return attrs
    
    def validate_old_password(self, value):
        """Validate old password"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        
        return value


class RolePermissionSerializer(serializers.Serializer):
    """
    Serializer for managing role permissions
    """
    permissions = serializers.ListField(
        child=serializers.IntegerField(),
        required=True
    )
    
    def validate_permissions(self, value):
        """Validate permission IDs"""
        if not Permission.objects.filter(id__in=value).exists():
            raise serializers.ValidationError("Some permissions do not exist")
        return value
