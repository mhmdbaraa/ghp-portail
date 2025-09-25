from django.urls import path
from rest_framework_simplejwt.views import TokenBlacklistView
from . import views

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
    path('users/statistics/', views.user_statistics, name='user_statistics'),
    path('users/recent/', views.recent_users, name='recent_users'),
    
    # Permission endpoints
    path('permissions/', views.PermissionListCreateView.as_view(), name='permission_list'),
    path('permissions/<int:pk>/', views.PermissionDetailView.as_view(), name='permission_detail'),
    path('permissions/<int:pk>/toggle/', views.toggle_permission_status, name='toggle_permission_status'),
    path('permissions/category/<str:category>/', views.permissions_by_category, name='permissions_by_category'),
    path('permissions/statistics/', views.permission_statistics, name='permission_statistics'),
    
    # Role endpoints
    path('roles/', views.RoleListCreateView.as_view(), name='role_list'),
    path('roles/<int:pk>/', views.RoleDetailView.as_view(), name='role_detail'),
    path('roles/<int:pk>/permissions/', views.role_permissions, name='role_permissions'),
    path('roles/<int:pk>/permissions/update/', views.update_role_permissions, name='update_role_permissions'),
    path('roles/<int:pk>/users/', views.role_users, name='role_users'),
    path('roles/<int:pk>/assign/', views.assign_role_to_user, name='assign_role_to_user'),
    path('roles/<int:pk>/remove/', views.remove_role_from_user, name='remove_role_from_user'),
    path('roles/statistics/', views.role_statistics, name='role_statistics'),
    path('roles/<int:pk>/clone/', views.clone_role, name='clone_role'),
]

