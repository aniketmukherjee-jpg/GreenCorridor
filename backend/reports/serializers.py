from rest_framework import serializers
from .models import IncidentReport

class IncidentReportSerializer(serializers.ModelSerializer):
    reporter_name = serializers.CharField(source='reporter.username', read_only=True)
    
    class Meta:
        model = IncidentReport
        fields = '__all__'
        read_only_fields = ('status', 'confirmation_count', 'reporter')
