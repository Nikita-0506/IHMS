from utils.files.file_handler import validate_upload


class FileUploadService:

	@staticmethod
	def validate(file_obj):

		return validate_upload(file_obj.name, file_obj.size)

