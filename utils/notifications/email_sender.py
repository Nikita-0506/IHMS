import logging

from django.core.mail import send_mail
from django.conf import settings


logger = logging.getLogger(__name__)


def send_platform_email(subject, message, recipients):

	try:

		sent_count = send_mail(
			subject=subject,
			message=message,
			from_email=settings.EMAIL_HOST_USER,
			recipient_list=recipients,
			fail_silently=False,
		)

		return {
			'success': True,
			'sent_count': sent_count,
		}

	except Exception as exc:

		logger.exception('Email sending failed: %s', str(exc))

		return {
			'success': False,
			'error': str(exc),
		}

