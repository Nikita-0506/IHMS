import os
from django.core.management.base import BaseCommand
from patients.models import PatientClinicalMonitoring
from patients.clinical_tracker import generate_individual_patient_report, REPORTS_DIR


class Command(BaseCommand):
    help = 'Generate individual patient clinical monitoring reports (Tracker, Diagnoses, Medication Reconciliation, Visuals)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--patient-id',
            type=str,
            help='Specific Patient ID to generate report for (e.g. PAT-000001)'
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Generate reports for all patients in database'
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=None,
            help='Limit number of reports to generate when using --all'
        )
        parser.add_argument(
            '--unit',
            type=str,
            default=None,
            help='Filter patients by care unit (e.g. ICU, Emergency, General Ward)'
        )
        parser.add_argument(
            '--risk',
            type=str,
            default=None,
            help='Filter patients by deterioration risk (High, Moderate, Low)'
        )

    def handle(self, *args, **options):
        patient_id = options.get('patient_id')
        gen_all = options.get('all')
        limit = options.get('limit')
        unit = options.get('unit')
        risk = options.get('risk')

        if not patient_id and not gen_all:
            self.stdout.write(self.style.ERROR(
                "Please specify either --patient-id <ID> or --all\n"
                "Example: python manage.py generate_patient_reports --patient-id PAT-000018\n"
                "Example: python manage.py generate_patient_reports --all --limit 20"
            ))
            return

        if patient_id:
            patient = PatientClinicalMonitoring.objects.filter(patient_id=patient_id.strip()).first()
            if not patient:
                self.stdout.write(self.style.ERROR(f"Patient with ID '{patient_id}' not found in database."))
                return

            self.stdout.write(f"Generating clinical report for patient {patient.patient_id} ({patient.full_name})...")
            rep = generate_individual_patient_report(patient, save_to_disk=True)
            self.stdout.write(self.style.SUCCESS(
                f"[SUCCESS] Report generated for {rep['patient_id']}!\n"
                f"   HTML File: {rep['file_path']}\n"
                f"   Status: {rep['tracker']['summary']['overall_status']} ({rep['tracker']['summary']['critical_count']} Critical, {rep['tracker']['summary']['warning_count']} Warning)\n"
                f"   Identified Diagnoses: {len(rep['diagnoses'])}\n"
                f"   Medication Adjustments: +{rep['medications']['counts']['added']} Added, -{rep['medications']['counts']['reduced']} Reduced"
            ))
            return

        # Query patients
        qs = PatientClinicalMonitoring.objects.all()
        if unit:
            qs = qs.filter(care_unit__icontains=unit.strip())
        if risk:
            qs = qs.filter(deterioration_risk__iexact=risk.strip())

        total = qs.count()
        if limit:
            qs = qs[:limit]
            self.stdout.write(f"Generating reports for {limit} of {total} patients (Reports folder: {REPORTS_DIR})...")
        else:
            self.stdout.write(f"Generating reports for all {total} patients (Reports folder: {REPORTS_DIR})...")

        count = 0
        for patient in qs:
            try:
                generate_individual_patient_report(patient, save_to_disk=True)
                count += 1
                if count % 25 == 0 or count == 1:
                    self.stdout.write(f"   Processed {count} patient reports...")
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"   Error generating for {patient.patient_id}: {e}"))

        self.stdout.write(self.style.SUCCESS(
            f"[SUCCESS] Completed! Successfully generated {count} individual patient reports in:\n{REPORTS_DIR}"
        ))
