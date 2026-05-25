from http import HTTPStatus


REQUEST_ID_HEADER = 'X-Request-ID'

DEFAULT_PAGE_SIZE = 10

MAX_PAGE_SIZE = 100

ROLE_ADMIN = 'admin'

ROLE_DOCTOR = 'doctor'

ROLE_PATIENT = 'patient'

ROLE_RECEPTIONIST = 'receptionist'

ROLE_PHARMACIST = 'pharmacist'

ROLE_LAB_STAFF = 'lab_staff'

SUCCESS_CODES = {
	'ok': HTTPStatus.OK,
	'created': HTTPStatus.CREATED,
	'accepted': HTTPStatus.ACCEPTED,
}

ERROR_CODES = {
	'bad_request': HTTPStatus.BAD_REQUEST,
	'unauthorized': HTTPStatus.UNAUTHORIZED,
	'forbidden': HTTPStatus.FORBIDDEN,
	'not_found': HTTPStatus.NOT_FOUND,
	'conflict': HTTPStatus.CONFLICT,
	'server_error': HTTPStatus.INTERNAL_SERVER_ERROR,
}

