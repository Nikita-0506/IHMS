from celery import shared_task


@shared_task
def send_appointment_notification(email):

    print(f'Sending notification to {email}')