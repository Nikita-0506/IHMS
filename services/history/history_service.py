from django.utils import timezone

from utils.common.history_writer import HistoryWriter


class HistoryService:

    @staticmethod
    def save_report_history(report_type, entity_id, metadata):

        payload = {
            'timestamp': timezone.now().isoformat(),
            'report_type': report_type,
            'entity_id': str(entity_id),
            'metadata': metadata,
        }
        return HistoryWriter.append_record('reports', f'{report_type}.jsonl', payload)

    @staticmethod
    def save_ai_history(model_name, patient_id, prediction):

        payload = {
            'timestamp': timezone.now().isoformat(),
            'model_name': model_name,
            'patient_id': str(patient_id),
            'prediction': prediction,
        }
        return HistoryWriter.append_record('ai_analysis', f'{model_name}.jsonl', payload)
