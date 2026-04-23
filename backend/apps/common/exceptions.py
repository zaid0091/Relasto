from rest_framework.exceptions import APIException
from rest_framework import status
from rest_framework.views import exception_handler
from rest_framework.response import Response
import logging

logger = logging.getLogger(__name__)


class ValidationErrorResponse(APIException):
    """Custom validation error"""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Validation error'
    default_code = 'validation_error'


class OwnershipError(APIException):
    """Ownership validation failed"""
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'You do not have permission to access this resource'
    default_code = 'ownership_error'


class BusinessLogicError(APIException):
    """Business rule violated"""
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'Business rule violation'
    default_code = 'business_logic_error'


def custom_exception_handler(exc, context):
    """Centralized exception handling"""
    
    # Log the exception
    logger.error(
        f"Exception in {context['view']}: {str(exc)}",
        exc_info=True,
        extra={'user': context['request'].user}
    )
    
    # Call default handler
    response = exception_handler(exc, context)
    
    if response is None:
        # Unhandled exception
        return Response({
            'status': 'error',
            'error': 'Internal server error',
            'code': 'INTERNAL_ERROR'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Format response
    if response.data.get('detail'):
        response.data = {
            'status': 'error',
            'error': str(response.data['detail']),
            'code': getattr(exc, 'default_code', 'ERROR')
        }
    
    return response
