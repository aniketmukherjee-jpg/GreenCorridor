from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import IncidentReport
from .serializers import IncidentReportSerializer

class IncidentReportViewSet(viewsets.ModelViewSet):
    queryset = IncidentReport.objects.all().order_by('-created_at')
    serializer_class = IncidentReportSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(reporter=self.request.user)
        else:
            serializer.save()

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        report_status = self.request.query_params.get('status')
        lat = self.request.query_params.get('lat')
        lng = self.request.query_params.get('lng')
        radius = self.request.query_params.get('radius', 5000) # Default 5km

        if category:
            queryset = queryset.filter(category=category)
        if report_status:
            queryset = queryset.filter(status=report_status)
        if lat and lng:
            # Simple bounding box approximation (1 degree ~ 111km)
            # radius is in meters
            delta = float(radius) / 111000.0
            lat, lng = float(lat), float(lng)
            queryset = queryset.filter(
                latitude__range=(lat - delta, lat + delta),
                longitude__range=(lng - delta, lng + delta)
            )
            
        return queryset

    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def confirm(self, request, pk=None):
        report = self.get_object()
        report.confirmation_count += 1
        
        # Auto-escalation to VERIFIED when count >= 5
        if report.confirmation_count >= 5 and report.status == IncidentReport.Status.REPORTED:
            report.status = IncidentReport.Status.VERIFIED
            
        report.save()
        return Response({
            'status': 'confirmed', 
            'count': report.confirmation_count,
            'report_status': report.status
        })
