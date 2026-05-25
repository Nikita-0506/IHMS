"""Machine learning package for IHMS inference and model registry."""

from .model_registry import get_predictor


def run_prediction(model_name, payload):

	predictor = get_predictor(model_name)

	return predictor(payload)

