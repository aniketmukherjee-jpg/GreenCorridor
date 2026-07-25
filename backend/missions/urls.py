from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HospitalViewSet, AmbulanceViewSet, EmergencyMissionViewSet

router = DefaultRouter()
router.register(r'hospitals', HospitalViewSet)
router.register(r'ambulances', AmbulanceViewSet)
router.register(r'missions', EmergencyMissionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
