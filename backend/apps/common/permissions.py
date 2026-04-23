from rest_framework.permissions import BasePermission


class IsAuthenticated(BasePermission):
    """Check if user is authenticated"""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class IsOwner(BasePermission):
    """Base permission for ownership-based access"""
    def get_owner_id(self, obj):
        """Override in subclass"""
        raise NotImplementedError
    
    def has_object_permission(self, request, view, obj):
        owner_id = self.get_owner_id(obj)
        return owner_id == request.user.id


class IsProfileOwner(BasePermission):
    """Only user can access their own profile"""
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsPropertyOwner(BasePermission):
    """Only agent who created property can modify it"""
    def has_object_permission(self, request, view, obj):
        return obj.agent.user == request.user or request.user.is_staff


class IsReviewAuthor(BasePermission):
    """Only review author can modify it"""
    def has_object_permission(self, request, view, obj):
        return obj.reviewer == request.user or request.user.is_staff


class IsAgentForRequest(BasePermission):
    """Only assigned agent can view/modify visit request"""
    def has_object_permission(self, request, view, obj):
        return obj.agent.user == request.user or request.user.is_staff


class IsAgentUser(BasePermission):
    """Check if user is an agent"""
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'profile') and 
            request.user.profile.is_agent
        )
