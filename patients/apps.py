from django.apps import AppConfig


class PatientsConfig(AppConfig):

    default_auto_field = 'django.db.models.BigAutoField'

    name = 'patients'

    verbose_name = 'Patient Management'

    def ready(self):

        # Register Django signals
        from . import signals