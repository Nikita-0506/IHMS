import json
from pathlib import Path
from django.conf import settings


class HistoryWriter:

    @staticmethod
    def _history_path(category, file_name):

        base = Path(settings.BASE_DIR) / 'history' / category
        base.mkdir(parents=True, exist_ok=True)
        return base / file_name

    @classmethod
    def append_record(cls, category, file_name, payload):

        history_file = cls._history_path(category, file_name)

        with history_file.open('a', encoding='utf-8') as stream:
            stream.write(json.dumps(payload, ensure_ascii=True) + '\n')

        return str(history_file)
