from django.db.models.signals import post_save
from django.dispatch import receiver

from accounts.models import User
from .models import Patient


@receiver(post_save, sender=User)
def create_patient_profile(sender, instance, created, **kwargs):

    if created and instance.role == 'patient':

        Patient.objects.create(
            user=instance,
            patient_id=f"PAT-{instance.id}",
            date_of_birth='2000-01-01',
            gender='other',
            blood_group='O+',
            emergency_contact='0000000000',
            address='Standard Address',
        )