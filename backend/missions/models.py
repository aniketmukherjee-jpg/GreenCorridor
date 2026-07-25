from django.db import models
from django.conf import settings

class Hospital(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField()
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    contact_number = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.name

class Ambulance(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Available'
        ON_MISSION = 'ON_MISSION', 'On Mission'
        MAINTENANCE = 'MAINTENANCE', 'Maintenance'

    plate_number = models.CharField(max_length=20, unique=True)
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='ambulances')
    equipment_level = models.CharField(max_length=100, default='Basic Life Support')
    driver = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='ambulance')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)

    def __str__(self):
        return f"{self.plate_number} ({self.hospital.name})"

class EmergencyMission(models.Model):
    class Priority(models.TextChoices):
        CRITICAL = 'CRITICAL', 'Critical'
        HIGH = 'HIGH', 'High'
        MEDIUM = 'MEDIUM', 'Medium'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_missions')
    ambulance = models.ForeignKey(Ambulance, on_delete=models.SET_NULL, null=True, related_name='missions')
    pickup_latitude = models.FloatField()
    pickup_longitude = models.FloatField()
    destination_hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='incoming_missions')
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.HIGH)
    patient_condition_tag = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    
    # Simple route storage for SQLite prototype
    current_route_json = models.TextField(blank=True, help_text="JSON string of route coordinates")
    eta_minutes = models.IntegerField(null=True, blank=True)
    
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Mission {self.id} - {self.get_priority_display()} ({self.get_status_display()})"
