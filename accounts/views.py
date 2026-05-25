from django.shortcuts import render

from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .serializers import RegisterSerializer
from .models import User

from rest_framework_simplejwt.views import TokenObtainPairView

from .jwt_serializers import (CustomTokenObtainPairSerializer)

# =========================
# Register API
# =========================

class RegisterView(generics.CreateAPIView):

    queryset = User.objects.all()

    serializer_class = RegisterSerializer

class CustomLoginView(TokenObtainPairView):

    serializer_class = ( CustomTokenObtainPairSerializer)

# =========================
# Protected Test API
# =========================

class TestAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        return Response({

            "message": "Authentication Successful",

            "user_id": request.user.id,

            "username": request.user.username,

            "email": request.user.email,

            "role": request.user.role,

            "is_verified": request.user.is_verified,
        })

# =========================
# Custom Login Page
# =========================

def custom_login_page(request):

    return render(
        request,
        'accounts/login.html'
    )