import re


def validate_mobile_number(value):

	if not re.fullmatch(r'^[0-9]{10}$', str(value or '')):

		return False, 'Mobile number must contain exactly 10 digits.'

	return True, 'Valid mobile number.'


def validate_strong_password(value):

	password = str(value or '')

	if len(password) < 8:

		return False, 'Password must be at least 8 characters long.'

	if not re.search(r'[A-Z]', password):

		return False, 'Password must contain at least one uppercase letter.'

	if not re.search(r'[a-z]', password):

		return False, 'Password must contain at least one lowercase letter.'

	if not re.search(r'[0-9]', password):

		return False, 'Password must contain at least one digit.'

	if not re.search(r'[^A-Za-z0-9]', password):

		return False, 'Password must contain at least one special character.'

	return True, 'Strong password.'

