from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'projects'

router = DefaultRouter()
router.register(r'', views.ProjectViewSet, basename='project')
router.register(r'statistics', views.ProjectStatisticsView, basename='project_statistics')
router.register(r'task-statistics', views.TaskStatisticsView, basename='task_statistics')

urlpatterns = [
    # Task endpoints (must come before router to avoid conflicts)
    path('tasks/', views.TaskViewSet.as_view({'get': 'list', 'post': 'create'}), name='task-list'),
    path('tasks/<int:pk>/', views.TaskViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='task-detail'),
    path('tasks/<int:task_id>/comments/', views.TaskCommentListCreateView.as_view({'get': 'list', 'post': 'create'}), name='task_comments'),
    path('tasks/<int:task_id>/attachments/', views.TaskAttachmentListCreateView.as_view({'get': 'list', 'post': 'create'}), name='task_attachments'),
    path('tasks/<int:task_id>/time-entries/', views.TimeEntryListCreateView.as_view({'get': 'list', 'post': 'create'}), name='time_entries'),
    
    # Other specific paths
    path('dashboard/', views.dashboard_data, name='dashboard_data'),
    path('calendar/', views.calendar_data, name='calendar_data'),
    path('calendar/export/', views.export_calendar_excel, name='export_calendar_excel'),
    path('export/excel/', views.export_projects_excel, name='export_projects_excel'),
    path('<int:project_id>/comments/', views.ProjectCommentListCreateView.as_view({'get': 'list', 'post': 'create'}), name='project_comments'),
    path('<int:project_id>/attachments/', views.ProjectAttachmentListCreateView.as_view({'get': 'list', 'post': 'create'}), name='project_attachments'),
    path('<int:project_id>/attachments/<int:pk>/download/', views.download_attachment, name='project_attachment_download'),
    path('notes/', views.ProjectNoteViewSet.as_view({'get': 'list', 'post': 'create'}), name='project_notes'),
    path('notes/<int:pk>/', views.ProjectNoteViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='project_note_detail'),
    path('notes/<int:pk>/toggle_like/', views.ProjectNoteViewSet.as_view({'post': 'toggle_like'}), name='project_note_toggle_like'),
    
    # Router URLs (must come last)
    path('', include(router.urls)),
]
