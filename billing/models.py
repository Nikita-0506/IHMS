import uuid

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.utils import timezone

from patients.models import Patient
from appointments.models import Appointment


class Billing(models.Model):

    # =========================================
    # Payment Status Choices
    # =========================================

    class PaymentStatus(models.TextChoices):

        GENERATED = 'generated', 'Generated'

        PROCESSING = 'processing', 'Processing'

        PAID = 'paid', 'Paid'

        OVERDUE = 'overdue', 'Overdue'

        REFUNDED = 'refunded', 'Refunded'

        DISPUTED = 'disputed', 'Disputed'

        PENDING = 'pending', 'Pending'

    # =========================================
    # Payment Method Choices
    # =========================================

    class PaymentMethod(models.TextChoices):

        CASH = 'cash', 'Cash'

        CARD = 'card', 'Card'

        UPI = 'upi', 'UPI'

        INSURANCE = 'insurance', 'Insurance'

    # =========================================
    # Primary Information
    # =========================================

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    invoice = models.CharField(
        max_length=100,
        unique=True,
        blank=True
    )

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='billings'
    )

    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.CASCADE,
        related_name='billings',
        null=True,
        blank=True
    )

    # =========================================
    # Billing Details
    # =========================================

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )

    payment_status = models.CharField(
        max_length=50,
        choices=PaymentStatus.choices,
        default=PaymentStatus.GENERATED
    )

    payment_method = models.CharField(
        max_length=50,
        choices=PaymentMethod.choices
    )

    # =========================================
    # Insurance Workflow
    # =========================================

    claim_id = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    provider_name = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    claim_status = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    approval_status = models.BooleanField(
        default=False
    )

    # =========================================
    # Additional Notes
    # =========================================

    notes = models.TextField(
        blank=True,
        null=True
    )

    # =========================================
    # Audit Fields
    # =========================================

    generated_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    is_deleted = models.BooleanField(
        default=False
    )

    deleted_at = models.DateTimeField(
        blank=True,
        null=True
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='billing_created'
    )

    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='billing_updated'
    )

    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='billing_deleted'
    )

    # =========================================
    # Auto Invoice Generator
    # =========================================

    def save(self, *args, **kwargs):

        if not self.invoice:

            current_year = timezone.now().year

            last_bill = Billing.objects.order_by(
                '-generated_at'
            ).only('invoice').first()

            if last_bill and last_bill.invoice:

                try:

                    last_number = int(
                        last_bill.invoice.split('-')[-1]
                    )

                except Exception:

                    last_number = 0

            else:

                last_number = 0

            new_number = last_number + 1

            self.invoice = (
                f"INV-{current_year}-{new_number:04d}"
            )

        super().save(*args, **kwargs)

    # =========================================
    # Soft Delete Method
    # =========================================

    def soft_delete(self, user=None):

        self.is_deleted = True

        self.deleted_at = timezone.now()

        self.deleted_by = user

        self.save()

    # =========================================
    # Meta Configuration
    # =========================================

    class Meta:

        ordering = ['-generated_at']

        indexes = [

            models.Index(fields=['invoice']),

            models.Index(fields=['payment_status']),

            models.Index(fields=['generated_at']),

            models.Index(fields=['is_deleted']),
        ]

        constraints = [

            models.CheckConstraint(
                check=models.Q(total_amount__gte=0),
                name='billing_total_amount_positive'
            )
        ]

        verbose_name = 'Billing'

        verbose_name_plural = 'Billings'

    # =========================================
    # String Representation
    # =========================================

    def __str__(self):

        return f"{self.invoice} - {self.patient}"