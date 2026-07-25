from django.db import models
from django.conf import settings
from missions.models import EmergencyMission

class PoliceZone(models.Model):
    name = models.CharField(max_length=255)
    # Using center + radius as a fallback for PostGIS Polygon
    center_latitude = models.FloatField()
    center_longitude = models.FloatField()
    radius_meters = models.IntegerField(default=5000)
    assigned_officers = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='assigned_zones')

    def __str__(self):
        return self.name

class PoliceAlert(models.Model):
    mission = models.ForeignKey(EmergencyMission, on_delete=models.CASCADE, related_name='police_alerts')
    zone = models.ForeignKey(PoliceZone, on_delete=models.CASCADE, related_name='alerts')
    sent_at = models.DateTimeField(auto_now_add=True)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    cleared_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Alert for {self.zone.name} (Mission {self.mission.id})"
