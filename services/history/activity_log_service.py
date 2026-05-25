from django.utils import timezone

from utils.common.history_writer import HistoryWriter


class ActivityLogService:

    @staticmethod
    def log_user_activity(user, activity_type, details=None):

        payload = {
            'timestamp': timezone.now().isoformat(),
            'user_id': str(user.id),
            'user_role': user.role,
            'activity_type': activity_type,
            'details': details or {},
        }

        return HistoryWriter.append_record('user_logs', 'user_activity.jsonl', payload)
