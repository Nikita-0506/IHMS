from rest_framework import serializers
from django.utils.timezone import now

from .models import Medicine


class MedicineSerializer(serializers.ModelSerializer):

    class Meta:

        model = Medicine

        fields = (
            'id',
            'medicine_name',
            'manufacturer',
            'quantity',
            'price',
            'expiry_date',
            'created_at',
        )

        read_only_fields = (
            'id',
            'created_at',
        )

    def validate_medicine_name(self, value):

        cleaned_value = value.strip()

        if not cleaned_value:

            raise serializers.ValidationError(
                'Medicine name cannot be empty.'
            )

        return cleaned_value

    def validate_manufacturer(self, value):

        cleaned_value = value.strip()

        if not cleaned_value:

            raise serializers.ValidationError(
                'Manufacturer cannot be empty.'
            )

        return cleaned_value

    def validate_quantity(self, value):

        if value < 0:

            raise serializers.ValidationError(
                'Quantity must be zero or positive.'
            )

        return value

    def validate_price(self, value):

        if value <= 0:

            raise serializers.ValidationError(
                'Price must be greater than zero.'
            )

        return value

    def validate_expiry_date(self, value):

        if value <= now().date():

            raise serializers.ValidationError(
                'Expiry date must be in the future.'
            )

        return value