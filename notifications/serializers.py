from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import EmailNotification, EmailTemplate, EmailLog

User = get_user_model()


class EmailNotificationSerializer(serializers.ModelSerializer):
    """
    Serializer pour les notifications email
    """
    recipient_name = serializers.CharField(source='recipient.get_full_name', read_only=True)
    recipient_email = serializers.CharField(source='recipient.email', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    
    class Meta:
        model = EmailNotification
        fields = [
            'id',
            'recipient',
            'recipient_name',
            'recipient_email',
            'subject',
            'message',
            'notification_type',
            'notification_type_display',
            'priority',
            'priority_display',
            'status',
            'status_display',
            'created_at',
            'sent_at',
            'delivered_at',
            'related_object_id',
            'related_object_type',
            'send_immediately',
            'scheduled_send_time',
            'error_message',
            'retry_count',
            'max_retries',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'sent_at',
            'delivered_at',
            'error_message',
            'retry_count',
        ]


class EmailNotificationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer une notification
    """
    class Meta:
        model = EmailNotification
        fields = [
            'subject',
            'message',
            'notification_type',
            'priority',
            'send_immediately',
            'scheduled_send_time',
            'related_object_id',
            'related_object_type',
        ]


class EmailTemplateSerializer(serializers.ModelSerializer):
    """
    Serializer pour les templates email
    """
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    
    class Meta:
        model = EmailTemplate
        fields = [
            'id',
            'name',
            'subject_template',
            'body_template',
            'notification_type',
            'notification_type_display',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EmailLogSerializer(serializers.ModelSerializer):
    """
    Serializer pour les logs email
    """
    class Meta:
        model = EmailLog
        fields = [
            'id',
            'action',
            'details',
            'timestamp',
        ]
        read_only_fields = ['id', 'timestamp']


class NotificationStatsSerializer(serializers.Serializer):
    """
    Serializer pour les statistiques des notifications
    """
    total = serializers.IntegerField()
    pending = serializers.IntegerField()
    sent = serializers.IntegerField()
    failed = serializers.IntegerField()
    delivered = serializers.IntegerField()
    by_type = serializers.DictField()
    by_priority = serializers.DictField()


class BulkNotificationSerializer(serializers.Serializer):
    """
    Serializer pour l'envoi en lot
    """
    notification_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1
    )


class TestEmailSerializer(serializers.Serializer):
    """
    Serializer pour le test d'email
    """
    subject = serializers.CharField(max_length=200, required=False)
    message = serializers.CharField(required=False)
    recipient_email = serializers.EmailField(required=False)
