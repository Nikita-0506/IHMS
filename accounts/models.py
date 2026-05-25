import uuid

from django.db import models
from django.contrib.auth.models import AbstractUser
from .managers import UserManager


class User(AbstractUser):

    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('doctor', 'Doctor'),
        ('patient', 'Patient'),
        ('receptionist', 'Receptionist'),
        ('pharmacist', 'Pharmacist'),
        ('lab_staff', 'Lab Staff'),
    )

    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    )

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    username = models.CharField(
        max_length=150,
        unique=True,
        blank=True,
        null=True
    )

    email = models.EmailField(
        unique=True,
        db_index=True
    )

    role = models.CharField(
        max_length=50,
        choices=ROLE_CHOICES
    )

    phone_number = models.CharField(
        max_length=15,
        blank=True,
        null=True
    )

    profile_image = models.ImageField(
        upload_to='profiles/',
        blank=True,
        null=True
    )

    gender = models.CharField(
        max_length=20,
        choices=GENDER_CHOICES,
        blank=True,
        null=True
    )

    date_of_birth = models.DateField(
        blank=True,
        null=True
    )

    address = models.TextField(
        blank=True,
        null=True
    )

    is_verified = models.BooleanField(
        default=False
    )

    is_deleted = models.BooleanField(
        default=False
    )

    last_login_ip = models.GenericIPAddressField(
        blank=True,
        null=True
    )

    last_device = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    failed_login_attempts = models.IntegerField(
        default=0
   )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    USERNAME_FIELD = 'email'

    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):

        return self.email

    class Meta:

        indexes = [

            models.Index(fields=['email']),

            models.Index(fields=['role']),
        ]


# =========================================
# USER LOGIN ACTIVITY MODEL
# =========================================

class UserLoginActivity(models.Model):

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='login_activities'
    )

    ip_address = models.GenericIPAddressField()

    device = models.CharField(
        max_length=255
    )

    browser = models.CharField(
        max_length=255
    )

    login_time = models.DateTimeField(
        auto_now_add=True
    )

    logout_time = models.DateTimeField(
        blank=True,
        null=True
    )

    class Meta:

        ordering = ['-login_time']

    def __str__(self):

        return f'{self.user.email} - {self.login_time}'