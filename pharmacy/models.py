import uuid
from django.db import models


class Medicine(models.Model):

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    medicine_name = models.CharField(
        max_length=255
    )

    manufacturer = models.CharField(
        max_length=255
    )

    quantity = models.IntegerField()

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    expiry_date = models.DateField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return self.medicine_name