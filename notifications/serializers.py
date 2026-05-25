from rest_framework import serializers
from django.utils.timezone import now

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):

    user_email = serializers.EmailField(
        source='user.email',
        read_only=True,
    )

    class Meta:

        model = Notification

        fields = (
            'id',
            'user',
            'user_email',
            'title',
            'message',
            'notification_type',
            'priority',
            'delivery_status',
            'is_read',
            'sent_via_email',
            'sent_via_sms',
            'sent_via_push',
            'redirect_url',
            'metadata',
            'created_at',
            'updated_at',
            'expires_at',
        )

        read_only_fields = (
            'id',
            'created_at',
            'updated_at',
            'delivery_status',
            'is_read',
            'user_email',
        )

    def validate_title(self, value):

        cleaned_value = value.strip()

        if not cleaned_value:

            raise serializers.ValidationError(
                'Title cannot be empty.'
            )

        return cleaned_value

    def validate_expires_at(self, value):

        if value and value <= now():

            raise serializers.ValidationError(
                'Expiration must be in the future.'
            )

        return value