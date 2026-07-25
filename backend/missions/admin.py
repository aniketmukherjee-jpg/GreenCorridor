from django.contrib import admin
from .models import Hospital, Ambulance, EmergencyMission

admin.site.register(Hospital)
admin.site.register(Ambulance)
admin.site.register(EmergencyMission)
