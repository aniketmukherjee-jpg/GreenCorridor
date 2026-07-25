from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Role(models.TextChoices):
        CITIZEN = 'CITIZEN', 'Citizen'
        DRIVER = 'DRIVER', 'Ambulance Driver'
        HOSPITAL_DISPATCH = 'HOSPITAL_DISPATCH', 'Hospital Dispatcher'
        TRAFFIC_POLICE = 'TRAFFIC_POLICE', 'Traffic Police'
        MUNICIPAL_ADMIN = 'MUNICIPAL_ADMIN', 'Municipal Admin'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CITIZEN)
    phone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
