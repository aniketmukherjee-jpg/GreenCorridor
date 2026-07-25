from django.db import models
from django.conf import settings

class IncidentReport(models.Model):
    class Category(models.TextChoices):
        POTHOLE = 'POTHOLE', 'Pothole'
        ACCIDENT = 'ACCIDENT', 'Accident'
        WATERLOGGING = 'WATERLOGGING', 'Waterlogging'
        CLOSURE = 'CLOSURE', 'Road Closure'
        TRAFFIC = 'TRAFFIC', 'Heavy Traffic'
        OTHER = 'OTHER', 'Other'

    class Severity(models.TextChoices):
        LOW = 'LOW', 'Low'
        MED = 'MED', 'Medium'
        HIGH = 'HIGH', 'High'

    class Status(models.TextChoices):
        REPORTED = 'REPORTED', 'Reported'
        VERIFIED = 'VERIFIED', 'Verified'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        RESOLVED = 'RESOLVED', 'Resolved'
        CLOSED = 'CLOSED', 'Closed'

    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    category = models.CharField(max_length=20, choices=Category.choices)
    description = models.TextField(blank=True)
    photo = models.ImageField(upload_to='reports/', blank=True, null=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    severity = models.CharField(max_length=10, choices=Severity.choices, default=Severity.MED)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.REPORTED)
    confirmation_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_category_display()} - {self.get_status_display()} ({self.id})"
