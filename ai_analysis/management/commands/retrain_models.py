from django.core.management.base import BaseCommand, CommandError

from ml_models.disease_prediction.train_model import train_disease_model
from ml_models.mental_health.train_model import train_mental_health_model
from ml_models.voice_analysis.train_model import train_voice_model


class Command(BaseCommand):
    help = 'Retrain IHMS ML models from configured datasets.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--model',
            choices=['all', 'disease_prediction', 'mental_health', 'voice_analysis'],
            default='all',
            help='Select one model or retrain all models.',
        )

    def handle(self, *args, **options):
        selected_model = options['model']

        trainers = {
            'disease_prediction': train_disease_model,
            'mental_health': train_mental_health_model,
            'voice_analysis': train_voice_model,
        }

        targets = trainers.items() if selected_model == 'all' else [(selected_model, trainers[selected_model])]

        self.stdout.write(self.style.NOTICE('Starting model retraining...'))

        for model_name, trainer in targets:
            try:
                result = trainer()
            except Exception as exc:
                raise CommandError(f'Retraining failed for {model_name}: {exc}') from exc

            self.stdout.write(
                self.style.SUCCESS(
                    f"{model_name}: accuracy={result.get('accuracy')} rows={result.get('rows')}"
                )
            )

        self.stdout.write(self.style.SUCCESS('Retraining completed successfully.'))
