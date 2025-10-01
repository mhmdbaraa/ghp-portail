from rest_framework import status, generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Permission, Role
from .serializers import PermissionSerializer, RoleSerializer, RolePermissionSerializer


# Permission Management Views
class PermissionListCreateView(generics.ListCreateAPIView):
    """
    List and create permissions
    """
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_active']
    search_fields = ['name', 'codename', 'description']
    ordering_fields = ['name', 'category', 'created_at']
    ordering = ['category', 'name']

    def get_queryset(self):
        """Filter permissions by category if specified"""
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        return queryset


class PermissionRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a permission
    """
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        """Prevent deletion of system permissions"""
        permission = self.get_object()
        if permission.codename.startswith('system:'):
            return Response({
                'success': False,
                'message': 'Cannot delete system permissions'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return super().destroy(request, *args, **kwargs)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def permission_categories(request):
    """
    Get all permission categories
    """
    categories = Permission.CATEGORY_CHOICES
    return Response({
        'success': True,
        'data': [{'value': choice[0], 'label': choice[1]} for choice in categories]
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def permissions_by_category(request):
    """
    Get permissions grouped by category
    """
    categories = {}
    for permission in Permission.objects.filter(is_active=True):
        category = permission.category
        if category not in categories:
            categories[category] = {
                'name': dict(Permission.CATEGORY_CHOICES).get(category, category),
                'permissions': []
            }
        categories[category]['permissions'].append(PermissionSerializer(permission).data)
    
    return Response({
        'success': True,
        'data': categories
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def bulk_create_permissions(request):
    """
    Create multiple permissions at once
    """
    permissions_data = request.data.get('permissions', [])
    if not permissions_data:
        return Response({
            'success': False,
            'message': 'No permissions data provided'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    created_permissions = []
    errors = []
    
    for perm_data in permissions_data:
        serializer = PermissionSerializer(data=perm_data)
        if serializer.is_valid():
            permission = serializer.save()
            created_permissions.append(permission)
        else:
            errors.append({
                'data': perm_data,
                'errors': serializer.errors
            })
    
    return Response({
        'success': True,
        'data': {
            'created': PermissionSerializer(created_permissions, many=True).data,
            'errors': errors
        },
        'message': f'Created {len(created_permissions)} permissions'
    })


# Role-Permission Management
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def role_permissions(request, role_id):
    """
    Get permissions for a specific role
    """
    try:
        role = Role.objects.get(id=role_id)
        permissions = role.permissions.all()
        serializer = PermissionSerializer(permissions, many=True)
        
        return Response({
            'success': True,
            'data': {
                'role': RoleSerializer(role).data,
                'permissions': serializer.data
            }
        })
    except Role.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Role not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def assign_permissions_to_role(request, role_id):
    """
    Assign permissions to a role
    """
    try:
        role = Role.objects.get(id=role_id)
        serializer = RolePermissionSerializer(data=request.data)
        
        if serializer.is_valid():
            permission_ids = serializer.validated_data['permissions']
            permissions = Permission.objects.filter(id__in=permission_ids)
            role.permissions.set(permissions)
            
            return Response({
                'success': True,
                'data': RoleSerializer(role).data,
                'message': f'Permissions assigned to role {role.name}'
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


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_permission_to_role(request, role_id, permission_id):
    """
    Add a single permission to a role
    """
    try:
        role = Role.objects.get(id=role_id)
        permission = Permission.objects.get(id=permission_id)
        
        role.permissions.add(permission)
        
        return Response({
            'success': True,
            'data': PermissionSerializer(permission).data,
            'message': f'Permission {permission.name} added to role {role.name}'
        })
    except Role.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Role not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Permission.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Permission not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def remove_permission_from_role(request, role_id, permission_id):
    """
    Remove a permission from a role
    """
    try:
        role = Role.objects.get(id=role_id)
        permission = Permission.objects.get(id=permission_id)
        
        role.permissions.remove(permission)
        
        return Response({
            'success': True,
            'message': f'Permission {permission.name} removed from role {role.name}'
        })
    except Role.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Role not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Permission.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Permission not found'
        }, status=status.HTTP_404_NOT_FOUND)
