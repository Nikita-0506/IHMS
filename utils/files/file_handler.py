import os


ALLOWED_EXTENSIONS = {
	'.pdf',
	'.png',
	'.jpg',
	'.jpeg',
	'.wav',
	'.mp3',
}

MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024


def get_extension(file_name):

	_name, extension = os.path.splitext(file_name)

	return extension.lower()


def validate_upload(file_name, file_size):

	extension = get_extension(file_name)

	if extension not in ALLOWED_EXTENSIONS:

		return False, 'Unsupported file extension.'

	if file_size > MAX_UPLOAD_SIZE_BYTES:

		return False, 'File exceeds allowed size limit.'

	return True, 'Valid file upload.'

