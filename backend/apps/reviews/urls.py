from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReviewViewSet

router = DefaultRouter()
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    path('', include(router.urls)),
    path('my_reviews/', ReviewViewSet.as_view({'get': 'my_reviews'}), name='my-reviews'),
    path('agent_summary/', ReviewViewSet.as_view({'get': 'agent_summary'}), name='agent-summary'),
    path('can_review/', ReviewViewSet.as_view({'get': 'can_review'}), name='can-review'),
]
