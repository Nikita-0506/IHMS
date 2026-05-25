from django.utils import timezone

from utils.common.history_writer import HistoryWriter


class CommitHistoryService:

    @staticmethod
    def save_commit(commit_id, file_name, previous_code, updated_code, updated_by, message=''):

        payload = {
            'timestamp': timezone.now().isoformat(),
            'commit_id': commit_id,
            'file_name': file_name,
            'previous_code': previous_code,
            'updated_code': updated_code,
            'updated_by': updated_by,
            'message': message,
        }

        return HistoryWriter.append_record('commits', 'commit_changes.jsonl', payload)
