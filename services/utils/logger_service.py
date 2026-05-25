import logging


class LoggerService:

	@staticmethod
	def get_logger(name):

		return logging.getLogger(name)

	@staticmethod
	def info(logger, message, **context):

		logger.info('%s | context=%s', message, context)

	@staticmethod
	def error(logger, message, **context):

		logger.error('%s | context=%s', message, context)

