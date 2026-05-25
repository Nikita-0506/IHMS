from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from rest_framework import status

from .pagination import BillingPagination
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .permissions import IsAdminOrReceptionist
from django.db import transaction

from .models import Billing
from .serializers import BillingSerializer


class BillingDashboardAPIView(APIView):

    permission_classes = [IsAuthenticated, IsAdminOrReceptionist]

    def get(self, request):

        if request.user.role not in ['admin', 'receptionist']:

            return Response({
                "error": "Access Denied"
            }, status=status.HTTP_403_FORBIDDEN)

        return Response({
            "message": "Billing Dashboard Access Granted"
        })


class BillingListCreateAPIView(generics.ListCreateAPIView):

    queryset = Billing.objects.all()

    serializer_class = BillingSerializer

    permission_classes = [IsAuthenticated]
    
    pagination_class = BillingPagination

    filter_backends = [DjangoFilterBackend,SearchFilter,OrderingFilter]

    search_fields = ['invoice',]

    ordering_fields = ['generated_at','total_amount']

    filterset_fields = ['payment_status','payment_method','generated_at']

    # ==================================
    # Enterprise Transaction Management
    # ==================================

    @transaction.atomic
    def perform_create(self, serializer):

     serializer.save()

class BillingRetrieveUpdateDeleteAPIView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Billing.objects.all()

    serializer_class = BillingSerializer

    permission_classes = [IsAuthenticated]

    pagination_class = BillingPagination