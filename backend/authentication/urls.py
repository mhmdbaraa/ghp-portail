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
]

