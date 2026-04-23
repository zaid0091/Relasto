from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from rest_framework.exceptions import AuthenticationFailed
from .utils import TokenService

User = get_user_model()


class AuthService:
    """Service for handling authentication business logic"""
    
    @staticmethod
    def register_user(email, username, password, password_confirm, is_agent=False):
        """
        Handles user registration with validation

        Args:
            email: User email
            username: User username
            password: User password
            password_confirm: Password confirmation
            is_agent: Whether user is registering as agent

        Returns:
            User instance

        Raises:
            ValidationError: If validation fails
        """
        if password != password_confirm:
            raise ValidationError('Passwords do not match')

        if User.objects.filter(email=email).exists():
            raise ValidationError('Email already registered')

        if User.objects.filter(username=username).exists():
            raise ValidationError('Username already taken')

        user = User.objects.create_user(
            email=email,
            username=username,
            password=password
        )

        if hasattr(user, 'profile'):
            user.profile.is_agent = is_agent
            user.profile.save()

        return user
    
    @staticmethod
    def authenticate_user(email, password):
        """
        Handles login authentication
        
        Args:
            email: User email
            password: User password
            
        Returns:
            User instance
            
        Raises:
            AuthenticationFailed: If credentials invalid
        """
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed('Invalid credentials')
        
        if not user.check_password(password):
            raise AuthenticationFailed('Invalid credentials')
        
        if not user.is_active:
            raise AuthenticationFailed('Account disabled')
        
        return user
    
    @staticmethod
    def login_user(email, password):
        """
        Complete login process with token generation
        
        Args:
            email: User email
            password: User password
            
        Returns:
            tuple: (user, tokens)
        """
        user = AuthService.authenticate_user(email, password)
        tokens = TokenService.generate_tokens(user)
        return user, tokens
    
    @staticmethod
    def refresh_tokens(refresh_token):
        """
        Refresh access token
        
        Args:
            refresh_token: Refresh token
            
        Returns:
            dict: New tokens
            
        Raises:
            ValueError: If refresh token invalid
        """
        return TokenService.refresh_token(refresh_token)
    
    @staticmethod
    def logout_user(refresh_token):
        """
        Logout user by blacklisting refresh token
        
        Args:
            refresh_token: Refresh token to blacklist
            
        Returns:
            bool: Success status
        """
        try:
            result = TokenService.blacklist_token(refresh_token)
            return result
        except ValueError as e:
            # Even if token is invalid, logout is successful
            return True
        except Exception as e:
            # Even if token is invalid, logout is successful
            return True
    
    @staticmethod
    def change_password(user, current_password, new_password, new_password_confirm):
        """
        Change user password
        
        Args:
            user: User instance
            current_password: Current password
            new_password: New password
            new_password_confirm: New password confirmation
            
        Returns:
            User instance
            
        Raises:
            ValidationError: If validation fails
        """
        if not user.check_password(current_password):
            raise ValidationError('Current password is incorrect')
        
        if new_password != new_password_confirm:
            raise ValidationError('New passwords do not match')
        
        user.set_password(new_password)
        user.save()
        return user
    
    @staticmethod
    def update_user_profile(user, data):
        """
        Update user profile information
        
        Args:
            user: User instance
            data: Dictionary of fields to update
            
        Returns:
            User instance
        """
        allowed_fields = ['first_name', 'last_name']
        
        for field in allowed_fields:
            if field in data:
                setattr(user, field, data[field])
        
        user.save()
        return user
