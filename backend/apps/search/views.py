from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q

from apps.properties.models import Property
from apps.properties.serializers import PropertySerializer
from apps.profiles.models import Profile
from apps.profiles.serializers import AgentSearchSerializer


class SearchViewSet(viewsets.ViewSet):
    """Universal search API for properties and agents"""
    
    permission_classes = [AllowAny]
    
    def list(self, request):
        """Universal search across properties and agents"""
        query = request.query_params.get('q', '').strip()
        
        if not query:
            return Response(
                {
                    "status": "success",
                    "data": {
                        "properties": [],
                        "agents": [],
                        "total_results": 0,
                        "query": query
                    }
                },
                status=status.HTTP_200_OK
            )
        
        # Search properties
        properties = Property.objects.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query) |
            Q(address__icontains=query) |
            Q(city__icontains=query) |
            Q(state__icontains=query)
        ).order_by('-created_at')[:10]  # Limit to 10 results
        
        # Search agents
        agents = Profile.objects.filter(
            is_agent=True
        ).filter(
            Q(user__first_name__icontains=query) |
            Q(user__last_name__icontains=query) |
            Q(user__username__icontains=query) |
            Q(bio__icontains=query) |
            Q(city__icontains=query) |
            Q(state__icontains=query)
        ).order_by('-average_rating', '-created_at')[:10]  # Limit to 10 results
        
        # Serialize results
        property_serializer = PropertySerializer(properties, many=True)
        agent_serializer = AgentSearchSerializer(agents, many=True)
        
        return Response(
            {
                "status": "success",
                "data": {
                    "properties": property_serializer.data,
                    "agents": agent_serializer.data,
                    "total_results": len(properties) + len(agents),
                    "query": query
                }
            },
            status=status.HTTP_200_OK
        )
