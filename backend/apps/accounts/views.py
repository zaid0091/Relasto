from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.conf import settings as django_settings
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserSerializer,
    TokenRefreshSerializer,
    PasswordChangeSerializer
)
from .services import AuthService
from .utils import TokenService

User = get_user_model()


class RegisterView(APIView):
    """User registration endpoint"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """
        Register a new user
        """
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            try:
                data = serializer.validated_data
                is_agent = data.pop('is_agent', False)
                user = AuthService.register_user(
                    email=data['email'],
                    username=data['username'],
                    password=data['password'],
                    password_confirm=data['password_confirm'],
                    is_agent=is_agent
                )
                tokens = TokenService.generate_tokens(user)
                
                return Response({
                    'status': 'success',
                    'message': 'User registered successfully',
                    'data': {
                        'user': UserSerializer(user).data,
                        'tokens': tokens
                    }
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({
                    'status': 'error',
                    'error': str(e),
                    'code': 'REGISTRATION_ERROR'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'status': 'error',
            'error': serializer.errors,
            'code': 'VALIDATION_ERROR'
        }, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """User login endpoint"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """
        Login user and return tokens
        """
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user, tokens = AuthService.login_user(
                    serializer.validated_data['email'],
                    serializer.validated_data['password']
                )
                
                return Response({
                    'status': 'success',
                    'message': 'Login successful',
                    'data': {
                        'user': UserSerializer(user).data,
                        'tokens': tokens
                    }
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({
                    'status': 'error',
                    'error': str(e),
                    'code': 'LOGIN_ERROR'
                }, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response({
            'status': 'error',
            'error': serializer.errors,
            'code': 'VALIDATION_ERROR'
        }, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """User logout endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """
        Logout user by blacklisting refresh token
        """
        refresh_token = request.data.get('refresh_token')
        if not refresh_token:
            return Response({
                'status': 'error',
                'error': 'Refresh token is required',
                'code': 'MISSING_TOKEN'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            AuthService.logout_user(refresh_token)
            return Response({
                'status': 'success',
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'error': str(e),
                'code': 'LOGOUT_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)


class RefreshTokenView(APIView):
    """Token refresh endpoint"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """
        Refresh access token
        """
        serializer = TokenRefreshSerializer(data=request.data)
        if serializer.is_valid():
            try:
                tokens = AuthService.refresh_tokens(
                    serializer.validated_data['refresh_token']
                )
                
                return Response({
                    'status': 'success',
                    'message': 'Token refreshed successfully',
                    'data': {
                        'tokens': tokens
                    }
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({
                    'status': 'error',
                    'error': str(e),
                    'code': 'TOKEN_REFRESH_ERROR'
                }, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response({
            'status': 'error',
            'error': serializer.errors,
            'code': 'VALIDATION_ERROR'
        }, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    """User profile view and update"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """
        Get current user profile
        """
        serializer = UserSerializer(request.user)
        return Response({
            'status': 'success',
            'data': {
                'user': serializer.data
            }
        }, status=status.HTTP_200_OK)
    
    def patch(self, request):
        """
        Update current user profile
        """
        try:
            user = AuthService.update_user_profile(request.user, request.data)
            serializer = UserSerializer(user)
            return Response({
                'status': 'success',
                'message': 'Profile updated successfully',
                'data': {
                    'user': serializer.data
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'error': str(e),
                'code': 'PROFILE_UPDATE_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """Change password endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """
        Change user password
        """
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            try:
                serializer.save()
                return Response({
                    'status': 'success',
                    'message': 'Password changed successfully'
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({
                    'status': 'error',
                    'error': str(e),
                    'code': 'PASSWORD_CHANGE_ERROR'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'status': 'error',
            'error': serializer.errors,
            'code': 'VALIDATION_ERROR'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def health_check(request):
    """
    Health check endpoint for authenticated users
    """
    return Response({
        'status': 'success',
        'message': 'Authentication is working',
        'data': {
            'user_id': request.user.id,
            'email': request.user.email,
            'is_authenticated': True
        }
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def debug_blacklist(request):
    """
    Debug endpoint to check blacklist status
    """
    from rest_framework_simplejwt.tokens import AccessToken
    from apps.common.models import BlacklistedToken
    
    # Get the current token
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    if auth_header.startswith('Bearer '):
        token_str = auth_header[7:]
        try:
            token = AccessToken(token_str)
            jti = token['jti']
            
            # Check if token is blacklisted
            is_blacklisted = BlacklistedToken.is_blacklisted(jti)
            
            return Response({
                'status': 'success',
                'data': {
                    'jti': jti,
                    'is_blacklisted': is_blacklisted,
                    'user_id': token['user_id'],
                    'expires_at': token['exp']
                }
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'status': 'error',
        'error': 'No token found'
    }, status=status.HTTP_400_BAD_REQUEST)


class GoogleLoginView(APIView):
    """Google OAuth2 login endpoint"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('credential')
        if not token:
            return Response({
                'status': 'error',
                'error': 'Google credential is required',
                'code': 'MISSING_CREDENTIAL'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                django_settings.GOOGLE_CLIENT_ID
            )

            email = idinfo['email']
            username = idinfo.get('name', email.split('@')[0])

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': username,
                    'is_active': True,
                }
            )

            if created:
                user.set_unusable_password()
                user.save()

            tokens = TokenService.generate_tokens(user)

            return Response({
                'status': 'success',
                'message': 'Google login successful',
                'data': {
                    'user': UserSerializer(user).data,
                    'tokens': tokens
                }
            }, status=status.HTTP_200_OK)

        except ValueError:
            return Response({
                'status': 'error',
                'error': 'Invalid Google token',
                'code': 'INVALID_TOKEN'
            }, status=status.HTTP_401_UNAUTHORIZED)
