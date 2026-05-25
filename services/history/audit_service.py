from django.utils import timezone

from utils.common.history_writer import HistoryWriter


class AuditService:

    @staticmethod
    def audit_event(actor, event_name, severity='info', context=None):

        payload = {
            'timestamp': timezone.now().isoformat(),
            'actor_id': str(actor.id) if actor else None,
            'actor_role': getattr(actor, 'role', None),
            'event_name': event_name,
            'severity': severity,
            'context': context or {},
        }

        return HistoryWriter.append_record('audit_logs', 'audit_events.jsonl', payload)
