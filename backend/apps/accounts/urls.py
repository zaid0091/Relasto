from django.urls import path
from .views import (
    GoogleLoginView,
    RegisterView,
    LoginView,
    LogoutView,
    RefreshTokenView,
    ProfileView,
    ChangePasswordView,
    health_check,
    debug_blacklist,
)

app_name = 'accounts'

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('google-login/', GoogleLoginView.as_view(), name='google-login'),

    path('refresh/', RefreshTokenView.as_view(), name='refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('health/', health_check, name='health'),
    path('debug-blacklist/', debug_blacklist, name='debug-blacklist'),
]
