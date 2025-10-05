from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    # Notifications
    path('', views.EmailNotificationListCreateView.as_view(), name='notification-list-create'),
    path('<int:pk>/', views.EmailNotificationDetailView.as_view(), name='notification-detail'),
    path('send/', views.send_notification, name='send-notification'),
    path('send-bulk/', views.send_bulk_notifications, name='send-bulk-notifications'),
    path('stats/', views.notification_stats, name='notification-stats'),
    path('user/', views.user_notifications, name='user-notifications'),
    path('<int:notification_id>/mark-read/', views.mark_as_read, name='mark-as-read'),
    path('<int:notification_id>/delete/', views.delete_notification, name='delete-notification'),
    path('<int:notification_id>/logs/', views.notification_logs, name='notification-logs'),
    
    # Templates
    path('templates/', views.EmailTemplateListCreateView.as_view(), name='template-list-create'),
    path('templates/<int:pk>/', views.EmailTemplateDetailView.as_view(), name='template-detail'),
    
    # Notifications de projet
    path('project/created/', views.notify_project_created, name='notify-project-created'),
    
    # Test du système
    path('test/', views.test_email_system, name='test-email-system'),
]
