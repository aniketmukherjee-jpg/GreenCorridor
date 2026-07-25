from rest_framework import serializers
from .models import Hospital, Ambulance, EmergencyMission
from users.models import User

class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = '__all__'

class AmbulanceSerializer(serializers.ModelSerializer):
    driver_name = serializers.CharField(source='driver.username', read_only=True)
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)

    class Meta:
        model = Ambulance
        fields = '__all__'

class EmergencyMissionSerializer(serializers.ModelSerializer):
    ambulance_details = AmbulanceSerializer(source='ambulance', read_only=True)
    destination_hospital_name = serializers.CharField(source='destination_hospital.name', read_only=True)

    class Meta:
        model = EmergencyMission
        fields = '__all__'
        read_only_fields = ('created_by', 'status', 'started_at', 'completed_at', 'current_route_json', 'eta_minutes')
