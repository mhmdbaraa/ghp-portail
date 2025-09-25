from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'projects'

router = DefaultRouter()
router.register(r'', views.ProjectViewSet, basename='project')
router.register(r'statistics', views.ProjectStatisticsView, basename='project_statistics')
router.register(r'tasks', views.TaskViewSet, basename='task')
router.register(r'task-statistics', views.TaskStatisticsView, basename='task_statistics')

urlpatterns = [
    # Specific paths first (before router catches everything)
    path('dashboard/', views.dashboard_data, name='dashboard_data'),
    path('<int:project_id>/comments/', views.ProjectCommentListCreateView.as_view({'get': 'list', 'post': 'create'}), name='project_comments'),
    path('<int:project_id>/attachments/', views.ProjectAttachmentListCreateView.as_view({'get': 'list', 'post': 'create'}), name='project_attachments'),
    path('tasks/<int:task_id>/comments/', views.TaskCommentListCreateView.as_view({'get': 'list', 'post': 'create'}), name='task_comments'),
    path('tasks/<int:task_id>/attachments/', views.TaskAttachmentListCreateView.as_view({'get': 'list', 'post': 'create'}), name='task_attachments'),
    path('tasks/<int:task_id>/time-entries/', views.TimeEntryListCreateView.as_view({'get': 'list', 'post': 'create'}), name='time_entries'),
    # Router URLs last (catches everything else)
    path('', include(router.urls)),
]
