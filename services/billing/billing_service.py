# billing/services.py

from datetime import datetime
from django.utils.crypto import get_random_string

from billing.models import Billing


def generate_invoice_number():
    """
    Generate a unique enterprise-level invoice number.

    Format:
    INV-2026-000001

    Structure:
    PREFIX - YEAR - SEQUENCE
    """

    current_year = datetime.now().year

    last_billing = Billing.objects.order_by('-generated_at').first()

    if last_billing and last_billing.invoice:

        try:
            last_sequence = int(
                last_billing.invoice.split('-')[-1]
            )

            next_sequence = last_sequence + 1

        except (ValueError, IndexError):

            next_sequence = 1

    else:
        next_sequence = 1

    invoice_number = (
        f"INV-{current_year}-{next_sequence:06d}"
    )

    return invoice_number