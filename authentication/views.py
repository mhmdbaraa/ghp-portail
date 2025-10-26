from rest_framework import status, generics, permissions, filters, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from django.core.exceptions import ObjectDoesNotExist
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import authenticate
from django.utils import timezone
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.hashers import make_password
import logging

from .models import User, UserSession, Permission, Role, DepartmentPermission
from .serializers import (
    UserSerializer, 
    UserRegistrationSerializer, 
    CustomTokenObtainPairSerializer,
    UserProfileSerializer,
    PermissionSerializer,
    RoleSerializer,
    RolePermissionSerializer,
    DepartmentPermissionSerializer,
    UserDepartmentPermissionsSerializer
)

logger = logging.getLogger(__name__)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom login view that returns user data along with tokens
    """
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            tokens = serializer.validated_data['tokens']
            
            # Update last login
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            
            # Create or update session
            self._create_user_session(request, user)
            
            # Prepare response data
            user_data = UserSerializer(user).data
            
            return Response({
                'success': True,
                'message': 'Login successful',
                'user': user_data,
                'tokens': tokens
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'message': 'Invalid credentials',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def _create_user_session(self, request, user):
        """Create or update user session"""
        try:
            ip_address = self._get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            # Update last login IP
            user.last_login_ip = ip_address
            user.save(update_fields=['last_login_ip'])
            
            # Generate a unique session key for JWT sessions
            import uuid
            session_key = f"jwt_{user.id}_{uuid.uuid4().hex[:8]}"
            
            # Create or update session record
            UserSession.objects.update_or_create(
                user=user,
                defaults={
                    'session_key': session_key,
                    'ip_address': ip_address,
                    'user_agent': user_agent,
                    'is_active': True
                }
            )
        except Exception as e:
            logger.error(f"Error creating user session: {e}")
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class CustomTokenRefreshView(TokenRefreshView):
    """
    Custom refresh token view
    """
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            return Response({
                'success': True,
                'message': 'Token refreshed successfully',
                'tokens': {
                    'access': serializer.validated_data['access'],
                    'refresh': serializer.validated_data.get('refresh')
                }
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'message': 'Invalid refresh token',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class UserRegistrationView(generics.CreateAPIView):
    """
    User registration endpoint
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            with transaction.atomic():
                user = serializer.save()
                
                # Generate tokens for the new user
                refresh = RefreshToken.for_user(user)
                tokens = {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                }
                
                # Create session
                self._create_user_session(request, user)
                
                # Prepare response data
                user_data = UserSerializer(user).data
                
                return Response({
                    'success': True,
                    'message': 'User registered successfully',
                    'user': user_data,
                    'tokens': tokens
                }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Registration failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def _create_user_session(self, request, user):
        """Create user session"""
        try:
            ip_address = self._get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            # Generate a unique session key for JWT sessions
            import uuid
            session_key = f"jwt_{user.id}_{uuid.uuid4().hex[:8]}"
            
            # Create or update session record
            UserSession.objects.update_or_create(
                user=user,
                defaults={
                    'session_key': session_key,
                    'ip_address': ip_address,
                    'user_agent': user_agent,
                    'is_active': True
                }
            )
        except Exception as e:
            logger.error(f"Error creating user session: {e}")
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    User profile view - get and update user profile
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.AllowAny]  # Temporaire pour les tests

    def get_object(self):
        return self.request.user


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """
    Logout endpoint - deactivate user sessions
    """
    try:
        # Deactivate user sessions
        UserSession.objects.filter(
            user=request.user,
            is_active=True
        ).update(is_active=False)
        
        return Response({
            'success': True,
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Error during logout: {e}")
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Logout failed'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_info_view(request):
    """
    Get current user information
    """
    user_data = UserSerializer(request.user).data
    return Response({
        'success': True,
        'user': user_data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password_view(request):
    """
    Change user password
    """
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not old_password or not new_password:
        return Response({
            'success': False,
            'message': 'Old password and new password are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not user.check_password(old_password):
        return Response({
            'success': False,
            'message': 'Old password is incorrect'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user.set_password(new_password)
    user.save()
    
    return Response({
        'success': True,
        'message': 'Password changed successfully'
    }, status=status.HTTP_200_OK)


# User Management Views
class UserListView(generics.ListCreateAPIView):
    """
    List all users or create a new user - Only superusers can access
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'status', 'department']
    search_fields = ['username', 'first_name', 'last_name', 'email']
    ordering_fields = ['username', 'first_name', 'last_name', 'created_at', 'last_login']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """All authenticated users can see all users (for project team management)"""
        return User.objects.all()
    
    def list(self, request, *args, **kwargs):
        """Check permissions before listing users"""
        # Allow all authenticated users to view user list (for project team management)
        if not request.user.is_authenticated:
            return Response({
                'success': False,
                'message': 'Authentication required.',
                'error': 'Authentication required'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        return super().list(request, *args, **kwargs)

    def get_queryset_filtered(self):
        """Get filtered queryset for superusers"""
        queryset = User.objects.all()
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status=status_filter)
        
        # Filter by role if provided
        role_filter = self.request.query_params.get('role')
        if role_filter and role_filter != 'all':
            queryset = queryset.filter(role=role_filter)
        
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Hash the password before saving
            user = serializer.save()
            if 'password' in request.data:
                user.set_password(request.data['password'])
                user.save()
            
            return Response({
                'success': True,
                'message': 'User created successfully',
                'data': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Failed to create user',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a user - Only superusers can access other users
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """Only superusers can access other users' details"""
        obj = super().get_object()
        
        # Users can always access their own details
        if obj.id == self.request.user.id:
            return obj
        
        # Only superusers can access other users' details
        if not self.request.user.is_superuser:
            return Response({
                'success': False,
                'message': 'Access denied. Only superusers can view other users.',
                'error': 'Insufficient permissions'
            }, status=status.HTTP_403_FORBIDDEN)
        
        return obj

    def update(self, request, *args, **kwargs):
        # Allow partial updates to reduce validation friction on role-only edits
        partial = True
        instance = self.get_object()
        
        # Protect superusers from modification
        if instance.is_protected_user():
            # Only allow superusers to modify other superusers
            if not request.user.is_superuser:
                return Response({
                    'success': False,
                    'message': 'Cannot modify protected user (superuser)',
                    'error': 'Protected user cannot be modified from frontend'
                }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Handle password update separately
            if 'password' in request.data:
                user.set_password(request.data['password'])
                user.save()
            
            return Response({
                'success': True,
                'message': 'User updated successfully',
                'data': UserSerializer(user).data
            })
        
        return Response({
            'success': False,
            'message': 'Failed to update user',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Protect superusers from deletion
        if instance.is_protected_user():
            return Response({
                'success': False,
                'message': 'Cannot delete protected user (superuser)',
                'error': 'Protected user cannot be deleted from frontend'
            }, status=status.HTTP_403_FORBIDDEN)
        
        self.perform_destroy(instance)
        return Response({
            'success': True,
            'message': 'User deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_user_status(request, user_id):
    """
    Toggle user status between active and inactive
    """
    try:
        user = User.objects.get(id=user_id)
        user.status = 'inactive' if user.status == 'active' else 'active'
        user.save()
        
        return Response({
            'success': True,
            'message': f'User status changed to {user.status}',
            'data': UserSerializer(user).data
        })
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_statistics(request):
    """
    Get user statistics for dashboard
    """
    total_users = User.objects.count()
    active_users = User.objects.filter(status='active').count()
    inactive_users = User.objects.filter(status='inactive').count()
    admin_users = User.objects.filter(role='admin').count()
    
    # Recent users (last 7 days)
    from datetime import timedelta
    recent_date = timezone.now() - timedelta(days=7)
    recent_users = User.objects.filter(created_at__gte=recent_date).count()
    
    return Response({
        'success': True,
        'data': {
            'total_users': total_users,
            'active_users': active_users,
            'inactive_users': inactive_users,
            'admin_users': admin_users,
            'new_users': recent_users
        }
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recent_users(request):
    """
    Get recent users for dashboard
    """
    users = User.objects.order_by('-created_at')[:5]
    serializer = UserSerializer(users, many=True)
    
    return Response({
        'success': True,
        'data': serializer.data
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_roles(request, user_id):
    """
    Get roles for a specific user
    """
    try:
        user = User.objects.get(id=user_id)
        roles = user.roles.all()
        serializer = RoleSerializer(roles, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def assign_roles_to_user(request, user_id):
    """
    Assign multiple roles to a user
    """
    try:
        user = User.objects.get(id=user_id)
        role_ids = request.data.get('role_ids', [])
        
        if not role_ids:
            return Response({
                'success': False,
                'message': 'role_ids is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        roles = Role.objects.filter(id__in=role_ids)
        user.roles.set(roles)
        
        return Response({
            'success': True,
            'message': f'Roles assigned to user {user.username}',
            'data': UserSerializer(user).data
        })
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def remove_roles_from_user(request, user_id):
    """
    Remove roles from a user
    """
    try:
        user = User.objects.get(id=user_id)
        role_ids = request.data.get('role_ids', [])
        
        if not role_ids:
            return Response({
                'success': False,
                'message': 'role_ids is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        roles = Role.objects.filter(id__in=role_ids)
        user.roles.remove(*roles)
        
        return Response({
            'success': True,
            'message': f'Roles removed from user {user.username}',
            'data': UserSerializer(user).data
        })
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)


# Role Views
class RoleListCreateView(generics.ListCreateAPIView):
    """
    List all roles or create a new role
    """
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.AllowAny]  # Temporaire pour les tests
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'is_system']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class RoleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a role
    """
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.AllowAny]  # Temporaire pour les tests
    
    def destroy(self, request, *args, **kwargs):
        """
        Prevent deletion of system roles
        """
        role = self.get_object()
        if role.is_system:
            return Response({
                'success': False,
                'message': 'System roles cannot be deleted'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return super().destroy(request, *args, **kwargs)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def role_permissions(request, pk):
    """
    Get permissions for a specific role
    """
    try:
        role = Role.objects.get(pk=pk)
        permissions = role.permissions.all()
        serializer = PermissionSerializer(permissions, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
    except Role.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Role not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def update_role_permissions(request, pk):
    """
    Update permissions for a specific role
    """
    try:
        role = Role.objects.get(pk=pk)
        serializer = RolePermissionSerializer(data=request.data)
        
        if serializer.is_valid():
            permission_ids = serializer.validated_data['permissions']
            permissions = Permission.objects.filter(id__in=permission_ids)
            role.permissions.set(permissions)
            
            return Response({
                'success': True,
                'message': 'Role permissions updated successfully'
            })
        else:
            return Response({
                'success': False,
                'message': 'Invalid data',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Role.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Role not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def role_users(request, pk):
    """
    Get users with a specific role
    """
    try:
        role = Role.objects.get(pk=pk)
        users = User.objects.filter(role=role.name)
        serializer = UserSerializer(users, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
    except Role.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Role not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def assign_role_to_user(request, pk):
    """
    Assign role to user
    """
    try:
        role = Role.objects.get(pk=pk)
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({
                'success': False,
                'message': 'user_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(id=user_id)
            user.roles.add(role)
            
            return Response({
                'success': True,
                'message': f'Role {role.name} assigned to user {user.username}',
                'data': UserSerializer(user).data
            })
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
            
    except Role.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Role not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def remove_role_from_user(request, pk):
    """
    Remove role from user
    """
    try:
        role = Role.objects.get(pk=pk)
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({
                'success': False,
                'message': 'user_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(id=user_id)
            if user.role == role.name:
                user.role = 'user'  # Default role
                user.save()
            
            return Response({
                'success': True,
                'message': f'Role {role.name} removed from user {user.username}'
            })
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
            
    except Role.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Role not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def role_statistics(request):
    """
    Get role statistics
    """
    total_roles = Role.objects.count()
    active_roles = Role.objects.filter(is_active=True).count()
    inactive_roles = total_roles - active_roles
    system_roles = Role.objects.filter(is_system=True).count()
    
    # Count users by role
    role_counts = {}
    for role in Role.objects.all():
        role_counts[role.name] = User.objects.filter(role=role.name).count()
    
    return Response({
        'success': True,
        'data': {
            'total': total_roles,
            'active': active_roles,
            'inactive': inactive_roles,
            'system': system_roles,
            'user_counts': role_counts
        }
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def clone_role(request, pk):
    """
    Clone an existing role
    """
    try:
        original_role = Role.objects.get(pk=pk)
        new_name = request.data.get('name')
        new_description = request.data.get('description', original_role.description)
        
        if not new_name:
            return Response({
                'success': False,
                'message': 'name is required for cloned role'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create new role
        new_role = Role.objects.create(
            name=new_name,
            description=new_description,
            is_active=True,
            is_system=False
        )
        
        # Copy permissions
        new_role.permissions.set(original_role.permissions.all())
        
        serializer = RoleSerializer(new_role)
        return Response({
            'success': True,
            'data': serializer.data,
            'message': f'Role cloned successfully'
        })
        
    except Role.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Role not found'
        }, status=status.HTTP_404_NOT_FOUND)


# Department Permission Views
class DepartmentPermissionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing department permissions
    """
    queryset = DepartmentPermission.objects.all().order_by('user__username', 'department')
    serializer_class = DepartmentPermissionSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    def get_queryset(self):
        """
        Filter permissions based on user
        """
        user_id = self.request.query_params.get('user_id')
        if user_id:
            return DepartmentPermission.objects.filter(user_id=user_id)
        return DepartmentPermission.objects.all()
    
    @action(detail=False, methods=['get'])
    def by_user(self, request):
        """
        Get all users with their department permissions
        """
        users = User.objects.filter(is_superuser=False).order_by('username')
        serializer = UserDepartmentPermissionsSerializer(users, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """
        Update multiple department permissions for a user
        """
        user_id = request.data.get('user_id')
        permissions = request.data.get('permissions', {})
        
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Update or create permissions for each department
        for department, perms in permissions.items():
            permission, created = DepartmentPermission.objects.get_or_create(
                user=user,
                department=department,
                defaults=perms
            )
            if not created:
                for key, value in perms.items():
                    setattr(permission, key, value)
                permission.save()
        
        # Return updated permissions
        user_permissions = DepartmentPermission.objects.filter(user=user)
        serializer = DepartmentPermissionSerializer(user_permissions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['delete'])
    def clear_user_permissions(self, request):
        """
        Clear all department permissions for a user
        """
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        DepartmentPermission.objects.filter(user=user).delete()
        return Response({'message': 'All permissions cleared for user'})