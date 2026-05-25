from datetime import timedelta

from django.utils import timezone


def now_utc():

	return timezone.now()


def add_minutes(minutes):

	return now_utc() + timedelta(minutes=minutes)


def add_days(days):

	return now_utc() + timedelta(days=days)


def is_expired(dt_value):

	if dt_value is None:

		return False

	return dt_value <= now_utc()

