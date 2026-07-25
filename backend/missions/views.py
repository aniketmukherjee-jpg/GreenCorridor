from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Hospital, Ambulance, EmergencyMission
from .serializers import HospitalSerializer, AmbulanceSerializer, EmergencyMissionSerializer

class HospitalViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [permissions.AllowAny]

class AmbulanceViewSet(viewsets.ModelViewSet):
    queryset = Ambulance.objects.all()
    serializer_class = AmbulanceSerializer
    permission_classes = [permissions.IsAuthenticated]

class EmergencyMissionViewSet(viewsets.ModelViewSet):
    queryset = EmergencyMission.objects.all().order_by('-created_at')
    serializer_class = EmergencyMissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        mission = self.get_object()
        mission.status = EmergencyMission.Status.ACCEPTED
        mission.save()
        return Response({'status': 'accepted'})

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        mission = self.get_object()
        mission.status = EmergencyMission.Status.IN_PROGRESS
        mission.started_at = timezone.now()
        
        if mission.ambulance:
            mission.ambulance.status = Ambulance.Status.ON_MISSION
            mission.ambulance.save()
            
        mission.save()
        return Response({'status': 'started'})

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        mission = self.get_object()
        mission.status = EmergencyMission.Status.COMPLETED
        mission.completed_at = timezone.now()
        
        if mission.ambulance:
            mission.ambulance.status = Ambulance.Status.AVAILABLE
            mission.ambulance.save()
            
        mission.save()
        return Response({'status': 'completed'})
