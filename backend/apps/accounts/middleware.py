"""
Middleware to handle JWT token blacklisting
"""

from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from rest_framework_simplejwt.tokens import AccessToken
from apps.common.models import BlacklistedToken


class JWTBlacklistMiddleware(MiddlewareMixin):
    """
    Middleware to check if JWT tokens are blacklisted
    """
    
    def process_request(self, request):
        """
        Check if the JWT token is blacklisted before processing the request
        """
        # Get the Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if auth_header.startswith('Bearer '):
            token_str = auth_header[7:]
            
            try:
                # Decode the token to get the jti
                token = AccessToken(token_str)
                jti = token.get('jti')
                
                # Check if the token is blacklisted
                if jti and BlacklistedToken.is_blacklisted(jti):
                    return JsonResponse({
                        'status': 'error',
                        'error': 'Token is blacklisted',
                        'code': 'TOKEN_BLACKLISTED'
                    }, status=401)
                    
            except Exception:
                # If token is invalid, let the authentication system handle it
                pass
        
        # Continue processing the request
        return None
