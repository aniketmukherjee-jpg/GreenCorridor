from rest_framework import serializers
from .models import PoliceZone, PoliceAlert

class PoliceZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = PoliceZone
        fields = '__all__'

class PoliceAlertSerializer(serializers.ModelSerializer):
    zone_name = serializers.CharField(source='zone.name', read_only=True)
    escalated_to_name = serializers.CharField(source='escalated_to.name', read_only=True, allow_null=True)

    class Meta:
        model = PoliceAlert
        fields = '__all__'
