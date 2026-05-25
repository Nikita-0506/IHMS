from notifications.models import Notification


class NotificationService:

	@staticmethod
	def create_notification(user, title, message, notification_type='system', priority='medium', metadata=None):

		return Notification.objects.create(
			user=user,
			title=title,
			message=message,
			notification_type=notification_type,
			priority=priority,
			metadata=metadata,
			delivery_status='sent',
		)

	@staticmethod
	def unread_count_for_user(user):

		return Notification.objects.filter(
			user=user,
			is_read=False,
		).count()

