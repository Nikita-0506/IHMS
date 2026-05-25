import logging

from rest_framework import status


logger = logging.getLogger(__name__)


class DomainValidationError(Exception):

	default_message = 'Validation failed for requested operation.'

	def __init__(self, message=None):

		super().__init__(message or self.default_message)


class DomainNotFoundError(Exception):

	default_message = 'Requested resource was not found.'

	def __init__(self, message=None):

		super().__init__(message or self.default_message)


def map_exception_to_status(exc):

	if isinstance(exc, DomainValidationError):

		return status.HTTP_400_BAD_REQUEST

	if isinstance(exc, DomainNotFoundError):

		return status.HTTP_404_NOT_FOUND

	return status.HTTP_500_INTERNAL_SERVER_ERROR


def log_and_reraise(exc, context='Unhandled exception'):

	logger.exception('%s: %s', context, str(exc))

	raise

