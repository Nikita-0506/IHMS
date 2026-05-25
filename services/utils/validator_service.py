class ValidatorService:

	@staticmethod
	def ensure_required_fields(payload, fields):

		missing = [field for field in fields if field not in payload]

		if missing:

			return False, {
				'missing_fields': missing,
			}

		return True, {}

	@staticmethod
	def ensure_role(user, allowed_roles):

		return user.role in allowed_roles

