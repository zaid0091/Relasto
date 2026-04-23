import jwt
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from apps.common.models import BlacklistedToken

User = get_user_model()


class TokenService:
    """Service for handling JWT token operations"""
    
    @staticmethod
    def generate_tokens(user):
        """Generate JWT access and refresh tokens"""
        refresh = RefreshToken.for_user(user)
        
        # Add custom claims to access token
        access_token = refresh.access_token
        access_token['email'] = user.email
        access_token['username'] = user.username
        access_token['is_agent'] = user.profile.is_agent if hasattr(user, 'profile') else False
        access_token['is_admin'] = user.is_staff
        
        return {
            'access': str(access_token),
            'refresh': str(refresh),
            'expires_in': settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()
        }
    
    @staticmethod
    def refresh_token(refresh_token):
        """Generate new access token from refresh token"""
        try:
            refresh = RefreshToken(refresh_token)
            access_token = refresh.access_token
            
            # Add custom claims
            user = User.objects.get(id=access_token['user_id'])
            access_token['email'] = user.email
            access_token['username'] = user.username
            access_token['is_agent'] = user.profile.is_agent if hasattr(user, 'profile') else False
            access_token['is_admin'] = user.is_staff
            
            return {
                'access': str(access_token),
                'expires_in': settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()
            }
        except Exception as e:
            raise ValueError(f'Invalid refresh token: {str(e)}')
    
    @staticmethod
    def blacklist_token(refresh_token):
        """Blacklist both access and refresh tokens (logout)"""
        try:
            refresh = RefreshToken(refresh_token)
            
            # Get token information
            access_token = refresh.access_token
            access_jti = access_token['jti']
            refresh_jti = refresh['jti']
            
            # Calculate expiration times
            access_expires_at = timezone.now() + settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']
            refresh_expires_at = timezone.now() + settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME']
            
            # Blacklist both tokens using our custom model
            BlacklistedToken.blacklist_token(access_jti, 'access', access_expires_at)
            BlacklistedToken.blacklist_token(refresh_jti, 'refresh', refresh_expires_at)
            
            return True
        except Exception as e:
            raise ValueError(f'Failed to blacklist token: {str(e)}')
