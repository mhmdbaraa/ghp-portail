from django.urls import path
from rest_framework_simplejwt.views import TokenBlacklistView
from . import views
from . import permission_views

app_name = 'authentication'

urlpatterns = [
    # Authentication endpoints
    path('login/', views.CustomTokenObtainPairView.as_view(), name='login'),
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('refresh/', views.CustomTokenRefreshView.as_view(), name='refresh'),
    path('logout/', views.logout_view, name='logout'),
    path('blacklist/', TokenBlacklistView.as_view(), name='blacklist'),
    
    # User profile endpoints
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('user-info/', views.user_info_view, name='user_info'),
    path('change-password/', views.change_password_view, name='change_password'),
    
    # User management endpoints
    path('users/', views.UserListView.as_view(), name='user_list'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user_detail'),
    path('users/<int:user_id>/toggle-status/', views.toggle_user_status, name='toggle_user_status'),
    path('users/<int:user_id>/roles/', views.user_roles, name='user_roles'),
    path('users/<int:user_id>/roles/assign/', views.assign_roles_to_user, name='assign_roles_to_user'),
    path('users/<int:user_id>/roles/remove/', views.remove_roles_from_user, name='remove_roles_from_user'),
    path('users/statistics/', views.user_statistics, name='user_statistics'),
    path('users/recent/', views.recent_users, name='recent_users'),
    
    # Permission endpoints
    path('permissions/', permission_views.PermissionListCreateView.as_view(), name='permission_list'),
    path('permissions/<int:pk>/', permission_views.PermissionRetrieveUpdateDestroyView.as_view(), name='permission_detail'),
    path('permissions/categories/', permission_views.permission_categories, name='permission_categories'),
    path('permissions/by-category/', permission_views.permissions_by_category, name='permissions_by_category'),
    path('permissions/bulk-create/', permission_views.bulk_create_permissions, name='bulk_create_permissions'),
    
    # Role endpoints
    path('roles/', views.RoleListCreateView.as_view(), name='role_list'),
    path('roles/<int:pk>/', views.RoleDetailView.as_view(), name='role_detail'),
    path('roles/<int:role_id>/permissions/', permission_views.role_permissions, name='role_permissions'),
    path('roles/<int:role_id>/permissions/assign/', permission_views.assign_permissions_to_role, name='assign_permissions_to_role'),
    path('roles/<int:role_id>/permissions/<int:permission_id>/add/', permission_views.add_permission_to_role, name='add_permission_to_role'),
    path('roles/<int:role_id>/permissions/<int:permission_id>/remove/', permission_views.remove_permission_from_role, name='remove_permission_from_role'),
    path('roles/<int:pk>/users/', views.role_users, name='role_users'),
    path('roles/<int:pk>/assign/', views.assign_role_to_user, name='assign_role_to_user'),
    path('roles/<int:pk>/remove/', views.remove_role_from_user, name='remove_role_from_user'),
    path('roles/statistics/', views.role_statistics, name='role_statistics'),
    path('roles/<int:pk>/clone/', views.clone_role, name='clone_role'),
    
    # Department Permission endpoints
    path('department-permissions/', views.DepartmentPermissionViewSet.as_view({'get': 'list', 'post': 'create'}), name='department_permission_list'),
    path('department-permissions/<int:pk>/', views.DepartmentPermissionViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='department_permission_detail'),
    path('department-permissions/by-user/', views.DepartmentPermissionViewSet.as_view({'get': 'by_user'}), name='department_permissions_by_user'),
    path('department-permissions/bulk-update/', views.DepartmentPermissionViewSet.as_view({'post': 'bulk_update'}), name='department_permissions_bulk_update'),
    path('department-permissions/clear-user/', views.DepartmentPermissionViewSet.as_view({'delete': 'clear_user_permissions'}), name='department_permissions_clear_user'),
]

