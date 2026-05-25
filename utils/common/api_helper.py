from rest_framework.response import Response


def build_success_payload(message='Success', data=None, meta=None):

	return {
		'success': True,
		'message': message,
		'data': data,
		'meta': meta or {},
	}


def build_error_payload(message='Request failed', errors=None, code='error'):

	return {
		'success': False,
		'message': message,
		'code': code,
		'errors': errors or {},
	}


def success_response(message='Success', data=None, meta=None, status_code=200):

	return Response(
		build_success_payload(message=message, data=data, meta=meta),
		status=status_code,
	)


def error_response(message='Request failed', errors=None, code='error', status_code=400):

	return Response(
		build_error_payload(message=message, errors=errors, code=code),
		status=status_code,
	)

