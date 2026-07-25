from django.core.management.base import BaseCommand
from users.models import User
from reports.models import IncidentReport
from missions.models import Hospital, Ambulance, EmergencyMission
from police.models import PoliceZone, PoliceAlert
from django.utils import timezone

class Command(BaseCommand):
    help = 'Seeds the database with mock data for GreenCorridor Demo'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')
        
        # 1. Create Users
        admin, _ = User.objects.get_or_create(username='admin', defaults={'role': User.Role.MUNICIPAL_ADMIN, 'is_staff': True, 'is_superuser': True})
        if _: admin.set_password('admin123'); admin.save()
        
        driver1, _ = User.objects.get_or_create(username='driver1', defaults={'role': User.Role.DRIVER})
        if _: driver1.set_password('driver123'); driver1.save()

        police1, _ = User.objects.get_or_create(username='police1', defaults={'role': User.Role.TRAFFIC_POLICE})
        if _: police1.set_password('police123'); police1.save()
        
        # 2. Create Reports (Matches mockReports)
        IncidentReport.objects.update_or_create(
            id=1,
            defaults={
                'category': IncidentReport.Category.POTHOLE,
                'severity': IncidentReport.Severity.HIGH,
                'status': IncidentReport.Status.VERIFIED,
                'description': 'Large pothole near the bus stop, causing vehicles to swerve.',
                'latitude': 12.9716, 'longitude': 77.5946
            }
        )
        IncidentReport.objects.update_or_create(
            id=2,
            defaults={
                'category': IncidentReport.Category.ACCIDENT,
                'severity': IncidentReport.Severity.HIGH,
                'status': IncidentReport.Status.REPORTED,
                'description': 'Two-vehicle collision, partial lane blockage.',
                'latitude': 12.9750, 'longitude': 77.6010
            }
        )
        IncidentReport.objects.update_or_create(
            id=3,
            defaults={
                'category': IncidentReport.Category.WATERLOGGING,
                'severity': IncidentReport.Severity.MED,
                'status': IncidentReport.Status.IN_PROGRESS,
                'description': "Ankle-deep water after last night's rain, slow traffic.",
                'latitude': 12.9698, 'longitude': 77.5900
            }
        )

        # 3. Create Hospitals & Ambulances
        h1, _ = Hospital.objects.update_or_create(id=1, defaults={'name': 'Victoria Hospital', 'latitude': 12.9634, 'longitude': 77.5755, 'address': 'Fort Rd, Bengaluru'})
        h2, _ = Hospital.objects.update_or_create(id=2, defaults={'name': "St. John's Medical Center", 'latitude': 12.9592, 'longitude': 77.6441, 'address': 'Koramangala, Bengaluru'})
        h3, _ = Hospital.objects.update_or_create(id=3, defaults={'name': "Manipal Hospital", 'latitude': 12.9512, 'longitude': 77.6411, 'address': 'HAL Old Airport Rd'})

        amb1, _ = Ambulance.objects.update_or_create(id=1, defaults={'plate_number': 'KA-01-AB-2041', 'hospital': h1, 'driver': driver1, 'status': Ambulance.Status.ON_MISSION, 'equipment_level': 'ALS'})
        amb2, _ = Ambulance.objects.update_or_create(id=2, defaults={'plate_number': 'KA-05-CD-1178', 'hospital': h2, 'status': Ambulance.Status.AVAILABLE, 'equipment_level': 'BLS'})
        amb3, _ = Ambulance.objects.update_or_create(id=3, defaults={'plate_number': 'KA-03-EF-0882', 'hospital': h3, 'status': Ambulance.Status.AVAILABLE, 'equipment_level': 'ALS'})

        # 4. Create Missions (Matches mockMissions)
        m1, _ = EmergencyMission.objects.update_or_create(
            id=101,
            defaults={
                'priority': EmergencyMission.Priority.CRITICAL,
                'status': EmergencyMission.Status.IN_PROGRESS,
                'pickup_latitude': 12.9750, 'pickup_longitude': 77.5900,
                'destination_hospital': h1,
                'ambulance': amb1,
                'patient_condition_tag': 'cardiac',
                'eta_minutes': 4,
                'created_by': admin
            }
        )
        EmergencyMission.objects.update_or_create(
            id=102,
            defaults={
                'priority': EmergencyMission.Priority.HIGH,
                'status': EmergencyMission.Status.PENDING,
                'pickup_latitude': 12.9350, 'pickup_longitude': 77.6100,
                'destination_hospital': h2,
                'ambulance': amb2,
                'patient_condition_tag': 'trauma',
                'created_by': admin
            }
        )
        EmergencyMission.objects.update_or_create(
            id=103,
            defaults={
                'priority': EmergencyMission.Priority.MEDIUM,
                'status': EmergencyMission.Status.COMPLETED,
                'pickup_latitude': 12.9550, 'pickup_longitude': 77.6200,
                'destination_hospital': h3,
                'ambulance': amb3,
                'patient_condition_tag': 'maternity',
                'eta_minutes': 0,
                'created_by': admin
            }
        )

        # 5. Create Police Zones and Alerts (Matches mockPoliceAlerts)
        zone1, _ = PoliceZone.objects.update_or_create(
            id=1,
            defaults={'name': 'MG Road Zone', 'center_latitude': 12.9716, 'center_longitude': 77.5946, 'radius_meters': 3000}
        )
        if _: zone1.assigned_officers.add(police1)
        
        zone2, _ = PoliceZone.objects.update_or_create(
            id=2,
            defaults={'name': 'Brigade Road Zone', 'center_latitude': 12.9616, 'center_longitude': 77.5846, 'radius_meters': 3000}
        )
        if _: zone2.assigned_officers.add(police1)

        PoliceAlert.objects.update_or_create(
            id=301,
            defaults={
                'mission': m1, 'zone': zone1,
                'status': PoliceAlert.Status.ACTIVE
            }
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded database.'))
