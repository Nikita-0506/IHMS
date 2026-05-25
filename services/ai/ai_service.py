from ml_models import run_prediction


class AIService:

	@staticmethod
	def predict(model_name, payload):

		return run_prediction(model_name=model_name, payload=payload)

