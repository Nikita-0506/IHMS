from django.utils.timezone import now
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Medicine
from .pagination import MedicinePagination
from .permissions import IsPharmacyManager, IsPharmacyReadableByRole
from .serializers import MedicineSerializer


# =========================================
# Pharmacy Dashboard API
# =========================================

class PharmacyDashboardAPIView(APIView):

    permission_classes = [IsAuthenticated, IsPharmacyReadableByRole]

    def get(self, request):

        medicines = Medicine.objects.all()

        total_medicines = medicines.count()

        low_stock_count = medicines.filter(quantity__lt=10).count()

        expiring_soon_count = medicines.filter(
            expiry_date__lte=now().date()
        ).count()

        return Response({
            "message": "Pharmacy dashboard loaded successfully",
            "total_medicines": total_medicines,
            "low_stock_count": low_stock_count,
            "expiring_soon_count": expiring_soon_count,
        }, status=status.HTTP_200_OK)


class MedicineListCreateView(generics.ListCreateAPIView):

    serializer_class = MedicineSerializer

    pagination_class = MedicinePagination

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_fields = [
        'manufacturer',
    ]

    search_fields = [
        'medicine_name',
        'manufacturer',
    ]

    ordering_fields = [
        'created_at',
        'quantity',
        'price',
        'expiry_date',
    ]

    ordering = ['medicine_name']

    def get_permissions(self):

        if self.request.method == 'POST':

            return [IsAuthenticated(), IsPharmacyManager()]

        return [IsAuthenticated(), IsPharmacyReadableByRole()]

    def get_queryset(self):

        return Medicine.objects.all().order_by('medicine_name')


class MedicineDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = MedicineSerializer

    queryset = Medicine.objects.all()

    def get_permissions(self):

        if self.request.method in ['PUT', 'PATCH', 'DELETE']:

            return [IsAuthenticated(), IsPharmacyManager()]

        return [IsAuthenticated(), IsPharmacyReadableByRole()]


class MedicineView(MedicineListCreateView):
    """Backward-compatible alias used in existing URL imports."""