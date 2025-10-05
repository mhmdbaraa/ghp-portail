from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from django.core.paginator import Paginator
from .models import EmailNotification, EmailTemplate, EmailLog
from .services import EmailNotificationService, ProjectNotificationService
from .serializers import (
    EmailNotificationSerializer, 
    EmailTemplateSerializer,
    EmailLogSerializer,
    NotificationStatsSerializer
)
from django.db.models import Count
from datetime import timedelta


class EmailNotificationListCreateView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer les notifications email
    """
    serializer_class = EmailNotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = EmailNotification.objects.filter(recipient=user)
        
        # Filtres
        status_filter = self.request.query_params.get('status')
        notification_type = self.request.query_params.get('type')
        priority = self.request.query_params.get('priority')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
        if priority:
            queryset = queryset.filter(priority=priority)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(recipient=self.request.user)


class EmailNotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour les détails d'une notification
    """
    serializer_class = EmailNotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return EmailNotification.objects.filter(recipient=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_notification(request):
    """
    Envoyer une notification immédiatement
    """
    notification_id = request.data.get('notification_id')
    
    if not notification_id:
        return Response(
            {'error': 'notification_id requis'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        notification = EmailNotification.objects.get(
            id=notification_id,
            recipient=request.user
        )
        
        service = EmailNotificationService()
        success = service.send_notification(notification.id)
        
        if success:
            return Response({'message': 'Notification envoyée avec succès'})
        else:
            return Response(
                {'error': 'Échec de l\'envoi de la notification'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except EmailNotification.DoesNotExist:
        return Response(
            {'error': 'Notification introuvable'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_bulk_notifications(request):
    """
    Envoyer plusieurs notifications en lot
    """
    notification_ids = request.data.get('notification_ids', [])
    
    if not notification_ids:
        return Response(
            {'error': 'notification_ids requis'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    service = EmailNotificationService()
    results = service.send_bulk_notifications(notification_ids)
    
    return Response(results)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_stats(request):
    """
    Obtenir les statistiques des notifications
    """
    service = EmailNotificationService()
    stats = service.get_notification_stats()
    
    # Ajouter des statistiques spécifiques à l'utilisateur
    user_stats = {
        'user_total': EmailNotification.objects.filter(recipient=request.user).count(),
        'user_pending': EmailNotification.objects.filter(
            recipient=request.user, 
            status='pending'
        ).count(),
        'user_sent': EmailNotification.objects.filter(
            recipient=request.user, 
            status='sent'
        ).count(),
        'user_failed': EmailNotification.objects.filter(
            recipient=request.user, 
            status='failed'
        ).count(),
    }
    
    stats.update(user_stats)
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_notifications(request):
    """
    Obtenir les notifications de l'utilisateur avec pagination
    """
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 20))
    
    queryset = EmailNotification.objects.filter(recipient=request.user)
    
    # Filtres
    status_filter = request.query_params.get('status')
    notification_type = request.query_params.get('type')
    priority = request.query_params.get('priority')
    
    if status_filter:
        queryset = queryset.filter(status=status_filter)
    if notification_type:
        queryset = queryset.filter(notification_type=notification_type)
    if priority:
        queryset = queryset.filter(priority=priority)
    
    queryset = queryset.order_by('-created_at')
    
    paginator = Paginator(queryset, page_size)
    page_obj = paginator.get_page(page)
    
    serializer = EmailNotificationSerializer(page_obj.object_list, many=True)
    
    return Response({
        'results': serializer.data,
        'count': paginator.count,
        'num_pages': paginator.num_pages,
        'current_page': page,
        'has_next': page_obj.has_next(),
        'has_previous': page_obj.has_previous(),
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_as_read(request, notification_id):
    """
    Marquer une notification comme lue
    """
    try:
        notification = EmailNotification.objects.get(
            id=notification_id,
            recipient=request.user
        )
        
        # Pour les notifications email, on peut marquer comme "livré"
        if notification.status == 'sent':
            notification.mark_as_delivered()
            return Response({'message': 'Notification marquée comme lue'})
        else:
            return Response(
                {'error': 'Notification pas encore envoyée'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except EmailNotification.DoesNotExist:
        return Response(
            {'error': 'Notification introuvable'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_notification(request, notification_id):
    """
    Supprimer une notification
    """
    try:
        notification = EmailNotification.objects.get(
            id=notification_id,
            recipient=request.user
        )
        notification.delete()
        return Response({'message': 'Notification supprimée'})
        
    except EmailNotification.DoesNotExist:
        return Response(
            {'error': 'Notification introuvable'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# Vues pour les templates
class EmailTemplateListCreateView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer les templates email
    """
    queryset = EmailTemplate.objects.all()
    serializer_class = EmailTemplateSerializer
    permission_classes = [IsAuthenticated]


class EmailTemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour les détails d'un template
    """
    queryset = EmailTemplate.objects.all()
    serializer_class = EmailTemplateSerializer
    permission_classes = [IsAuthenticated]


# Vues pour les logs
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_logs(request, notification_id):
    """
    Obtenir les logs d'une notification
    """
    try:
        notification = EmailNotification.objects.get(
            id=notification_id,
            recipient=request.user
        )
        
        logs = EmailLog.objects.filter(notification=notification).order_by('-timestamp')
        serializer = EmailLogSerializer(logs, many=True)
        
        return Response(serializer.data)
        
    except EmailNotification.DoesNotExist:
        return Response(
            {'error': 'Notification introuvable'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# Vues pour les notifications de projet
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notify_project_created(request):
    """
    Notifier la création d'un projet
    """
    project_id = request.data.get('project_id')
    project_name = request.data.get('project_name')
    project_description = request.data.get('project_description', '')
    
    if not project_id or not project_name:
        return Response(
            {'error': 'project_id et project_name requis'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    service = ProjectNotificationService()
    
    # Simuler un objet projet pour la notification
    class MockProject:
        def __init__(self, id, name, description, members):
            self.id = id
            self.name = name
            self.description = description
            self.members = members
            self.created_at = timezone.now()
    
    # Récupérer les membres du projet (ici on utilise l'utilisateur actuel)
    members = [request.user]
    
    project = MockProject(project_id, project_name, project_description, members)
    
    service.notify_project_created(project, request.user)
    
    return Response({'message': 'Notifications de création de projet envoyées'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def test_email_system(request):
    """
    Tester le système d'email
    """
    try:
        service = EmailNotificationService()
        
        # Créer une notification de test
        notification = service.create_notification(
            recipient=request.user,
            subject="Test du système d'email - GHP Portail",
            message="""
            Ceci est un email de test pour vérifier le bon fonctionnement du système de notification.
            
            Si vous recevez cet email, cela signifie que la configuration email fonctionne correctement.
            
            Détails du test:
            - Date: {date}
            - Utilisateur: {user}
            - Système: GHP Portail
            
            Cordialement,
            L'équipe GHP Portail
            """.format(
                date=timezone.now().strftime('%d/%m/%Y %H:%M'),
                user=request.user.get_full_name() or request.user.username
            ),
            notification_type='system_alert',
            priority='low'
        )
        
        return Response({
            'message': 'Email de test créé et envoyé',
            'notification_id': notification.id
        })
        
    except Exception as e:
        return Response(
            {'error': f'Erreur lors du test: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )