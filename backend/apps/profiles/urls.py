from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProfileViewSet

router = DefaultRouter()
router.register(r'profiles', ProfileViewSet, basename='profile')

urlpatterns = [
    path('', include(router.urls)),
    path('me/', ProfileViewSet.as_view({'get': 'me'}), name='profile-me'),
    path('update_me/', ProfileViewSet.as_view({'patch': 'update_me'}), name='profile-update-me'),
    path('toggle_agent/', ProfileViewSet.as_view({'post': 'toggle_agent'}), name='toggle-agent'),
    path('search_agents/', ProfileViewSet.as_view({'get': 'search_agents'}), name='search-agents'),
]
