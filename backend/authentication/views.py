from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from django.core.exceptions import ObjectDoesNotExist
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import authenticate
from django.utils import timezone
from django.db import transaction
import logging

from .models import User, UserSession
from .serializers import (
    UserSerializer, 
    UserRegistrationSerializer, 
    CustomTokenObtainPairSerializer,
    UserProfileSerializer
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
    permission_classes = [permissions.IsAuthenticated]

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
