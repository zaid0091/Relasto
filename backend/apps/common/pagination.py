from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardPagination(PageNumberPagination):
    """Default pagination: 20 items per page, max 100"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    page_size_query_description = 'Number of results to return per page.'
    
    def get_paginated_response(self, data):
        """Custom response format"""
        return Response({
            'status': 'success',
            'data': data,
            'pagination': {
                'total': self.page.paginator.count,
                'count': len(data),
                'page': self.page.number,
                'page_size': self.page_size,
                'total_pages': self.page.paginator.num_pages,
                'has_next': self.page.has_next(),
                'has_previous': self.page.has_previous(),
            }
        })


class LargePagination(StandardPagination):
    """For large datasets: 100 items per page, max 500"""
    page_size = 100
    max_page_size = 500
