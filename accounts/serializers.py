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

        if User.objects.filter(email=attrs['email']).exists():

            raise serializers.ValidationError({
                "email": "Email already exists"
            })
        
        if User.objects.filter(username=attrs['username']).exists():

            raise serializers.ValidationError({
               "username": "Username already exists"
            })

        return attrs

    def create(self, validated_data):

        validated_data.pop('password2')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data['role'],
            phone_number=validated_data.get('phone_number')
        )

        return user