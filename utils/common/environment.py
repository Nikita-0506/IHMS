import os


def get_env(key, default=None):

	return os.getenv(key, default)


def get_bool_env(key, default=False):

	value = os.getenv(key)

	if value is None:

		return default

	return value.strip().lower() in ['1', 'true', 'yes', 'on']


def get_int_env(key, default=0):

	value = os.getenv(key)

	if value is None:

		return default

	try:

		return int(value)

	except (TypeError, ValueError):

		return default

