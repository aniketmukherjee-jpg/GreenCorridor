from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PoliceZoneViewSet, PoliceAlertViewSet

router = DefaultRouter()
router.register(r'zones', PoliceZoneViewSet)
router.register(r'alerts', PoliceAlertViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
