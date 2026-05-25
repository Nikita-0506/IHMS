from rest_framework import serializers
from .models import Billing


class BillingSerializer(serializers.ModelSerializer):

    class Meta:

        model = Billing

        fields = '__all__'

        read_only_fields = (
            'id',
            'generated_at',
            'updated_at',
        )

    def validate_total_amount(self, value):

        if value <= 0:

            raise serializers.ValidationError(
                "Total amount must be greater than zero."
            )

        return value