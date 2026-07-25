from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import PoliceZone, PoliceAlert
from .serializers import PoliceZoneSerializer, PoliceAlertSerializer

class PoliceZoneViewSet(viewsets.ModelViewSet):
    queryset = PoliceZone.objects.all()
    serializer_class = PoliceZoneSerializer
    permission_classes = [permissions.IsAuthenticated]

class PoliceAlertViewSet(viewsets.ModelViewSet):
    queryset = PoliceAlert.objects.all().order_by('-sent_at')
    serializer_class = PoliceAlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        zone_id = self.request.query_params.get('zone')
        if zone_id:
            queryset = queryset.filter(zone_id=zone_id)
        return queryset

    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        alert = self.get_object()
        alert.acknowledged_at = timezone.now()
        alert.save()
        return Response({'status': 'acknowledged'})

    @action(detail=True, methods=['post'])
    def clear(self, request, pk=None):
        alert = self.get_object()
        alert.cleared_at = timezone.now()
        alert.save()
        return Response({'status': 'cleared'})
