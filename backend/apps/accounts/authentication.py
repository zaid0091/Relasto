from rest_framework_simplejwt.authentication import JWTAuthentication as BaseJWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework import exceptions
from django.contrib.auth import get_user_model
from apps.common.models import BlacklistedToken


User = get_user_model()


class JWTAuthentication(BaseJWTAuthentication):
    """
    Custom JWT authentication that validates tokens and sets user in request.
    Checks for blacklisted tokens to ensure logout works properly.
    """
    
    def get_validated_token(self, raw_token):
        """
        Validates the raw token and returns the validated token.
        """
        try:
            validated_token = super().get_validated_token(raw_token)
            
            # Check if the token is blacklisted
            jti = validated_token.get('jti')
            if jti:
                try:
                    if BlacklistedToken.is_blacklisted(jti):
                        raise InvalidToken('Token is blacklisted')
                except Exception:
                    # If blacklist check fails, continue with normal validation
                    pass
            
            return validated_token
        except InvalidToken as e:
            raise exceptions.AuthenticationFailed(str(e))
    
    def get_user(self, validated_token):
        """
        Attempts to find and return a user using the validated token.
        """
        try:
            user_id = validated_token['user_id']
            user = User.objects.get(id=user_id)
            
            if not user.is_active:
                raise exceptions.AuthenticationFailed('User account is disabled')
            
            return user
        except (KeyError, User.DoesNotExist):
            raise exceptions.AuthenticationFailed('Invalid token payload')
        except Exception as e:
            raise exceptions.AuthenticationFailed(f'Authentication failed: {str(e)}')
