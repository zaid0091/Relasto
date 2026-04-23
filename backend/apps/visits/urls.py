from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VisitRequestViewSet

router = DefaultRouter()
router.register(r'visit-requests', VisitRequestViewSet, basename='visitrequest')

urlpatterns = [
    path('', include(router.urls)),
    path('my_requests/', VisitRequestViewSet.as_view({'get': 'my_requests'}), name='my-requests'),
    path('agent_requests/', VisitRequestViewSet.as_view({'get': 'agent_requests'}), name='agent-requests'),
    path('property_requests/', VisitRequestViewSet.as_view({'get': 'property_requests'}), name='property-requests'),
    path('summary/', VisitRequestViewSet.as_view({'get': 'summary'}), name='summary'),
]
