from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth import get_user_model
from .models import DepartmentPermission
from .serializers import DepartmentPermissionSerializer, UserDepartmentPermissionsSerializer

User = get_user_model()


class DepartmentPermissionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing department permissions
    """
    queryset = DepartmentPermission.objects.all()
    serializer_class = DepartmentPermissionSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
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
