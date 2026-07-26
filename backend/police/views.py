from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import PoliceZone, PoliceAlert
from .serializers import PoliceZoneSerializer, PoliceAlertSerializer

class PoliceZoneViewSet(viewsets.ModelViewSet):
    queryset = PoliceZone.objects.all()
    serializer_class = PoliceZoneSerializer
    permission_classes = [permissions.AllowAny]

class PoliceAlertViewSet(viewsets.ModelViewSet):
    queryset = PoliceAlert.objects.all().order_by('-sent_at')
    serializer_class = PoliceAlertSerializer
    permission_classes = [permissions.AllowAny]

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

    @action(detail=False, methods=['post'])
    def check_escalations(self, request):
        threshold_seconds = int(request.query_params.get('threshold', 30))
        cutoff = timezone.now() - timezone.timedelta(seconds=threshold_seconds)
        pending_alerts = PoliceAlert.objects.filter(
            acknowledged_at__isnull=True,
            is_escalated=False,
            sent_at__lt=cutoff
        )
        
        escalated_data = []
        for alert in pending_alerts:
            current_zone = alert.zone
            other_zones = PoliceZone.objects.exclude(id=current_zone.id)
            if not other_zones.exists():
                continue
            
            # Find closest zone
            closest_zone = min(
                other_zones,
                key=lambda z: (z.center_latitude - current_zone.center_latitude) ** 2 + 
                             (z.center_longitude - current_zone.center_longitude) ** 2
            )
            
            alert.is_escalated = True
            alert.escalated_to = closest_zone
            alert.save()
            
            escalated_info = {
                'id': alert.id,
                'mission_id': alert.mission.id,
                'original_zone': current_zone.name,
                'escalated_to_zone': closest_zone.name
            }
            escalated_data.append(escalated_info)
            
            # Broadcast over channels
            try:
                from asgiref.sync import async_to_sync
                from channels.layers import get_channel_layer
                channel_layer = get_channel_layer()
                if channel_layer:
                    async_to_sync(channel_layer.group_send)(
                        'traffic_updates',
                        {
                            'type': 'traffic_message',
                            'message': {
                                'event': 'alert_escalated',
                                'data': escalated_info
                            }
                        }
                    )
            except Exception as e:
                print("Channels broadcast failed:", e)
                
        return Response({
            'status': 'escalated_check_complete',
            'escalated_count': len(escalated_data),
            'escalated_alerts': escalated_data
        })
