from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password

from .models import User


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )

    password2 = serializers.CharField(
        write_only=True,
        required=True
    )

    class Meta:

        model = User

        extra_kwargs = {
            'email': {'validators': []},
            'username': {'validators': []},
        }

        fields = [
            'username',
            'email',
            'password',
            'password2',
            'role',
            'phone_number',
        ]

    def validate(self, attrs):

        if attrs['password'] != attrs['password2']:

            raise serializers.ValidationError({
                "password": "Passwords do not match"
            })

        active_email_user = User.objects.filter(
            email=attrs['email'],
            is_deleted=False,
        ).exists()

        active_username_user = User.objects.filter(
            username=attrs['username'],
            is_deleted=False,
        ).exists()

        if active_email_user:

            raise serializers.ValidationError({
                "email": "Email already exists"
            })

        if active_username_user:

            raise serializers.ValidationError({
               "username": "Username already exists"
            })

        deleted_email_user = User.objects.filter(
            email=attrs['email'],
            is_deleted=True,
        ).first()

        deleted_username_user = User.objects.filter(
            username=attrs['username'],
            is_deleted=True,
        ).first()

        if (
            deleted_email_user
            and deleted_username_user
            and deleted_email_user.id != deleted_username_user.id
        ):
            raise serializers.ValidationError(
                {
                    "detail": (
                        "Email and username are linked to different deleted accounts. "
                        "Please use a different username or email."
                    )
                }
            )

        return attrs

    def create(self, validated_data):

        validated_data.pop('password2')

        deleted_email_user = User.objects.filter(
            email=validated_data['email'],
            is_deleted=True,
        ).first()

        deleted_username_user = User.objects.filter(
            username=validated_data['username'],
            is_deleted=True,
        ).first()

        deleted_user = deleted_email_user or deleted_username_user

        if deleted_user is not None:
            deleted_user.username = validated_data['username']
            deleted_user.email = validated_data['email']
            deleted_user.role = validated_data['role']
            deleted_user.phone_number = validated_data.get('phone_number')
            deleted_user.is_deleted = False
            deleted_user.is_active = True
            deleted_user.is_verified = False
            deleted_user.set_password(validated_data['password'])
            deleted_user.save(
                update_fields=[
                    'username',
                    'email',
                    'role',
                    'phone_number',
                    'is_deleted',
                    'is_active',
                    'is_verified',
                    'password',
                    'updated_at',
                ]
            )
            return deleted_user

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data['role'],
            phone_number=validated_data.get('phone_number')
        )

        return user