# accounts/urls.py

from django.urls import path, re_path

from rest_framework import permissions

from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
    TokenBlacklistView,
)

from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from .views import (

    RegisterView,
    TestAPIView,
    custom_login_page,
    CustomLoginView,
)

# ==========================================
# Swagger Configuration
# ==========================================

schema_view = get_schema_view(

    openapi.Info(

        title="Intelligent Hospital Management System API",

        default_version='v1',

        description="""
        Enterprise-Level Intelligent Hospital Management System APIs

        Features:
        - JWT Authentication
        - Role-Based Access Control
        - Patient Management
        - Doctor Management
        - Billing APIs
        - Laboratory APIs
        - AI Analysis APIs
        - Notification APIs
        - Dashboard Analytics
        """,

        terms_of_service="https://www.google.com/policies/terms/",

        contact=openapi.Contact(
            email="support@ihms.com"
        ),

        license=openapi.License(
            name="IHMS License"
        ),
    ),

    public=True,

    permission_classes=[
        permissions.AllowAny
    ],
)

# ==========================================
# URL Patterns
# ==========================================

urlpatterns = [

    # ======================================
    # Authentication APIs
    # ======================================

    path(
        'register/',
        RegisterView.as_view(),
        name='register'
    ),

    path(
        'login/',
        CustomLoginView.as_view(),
        name='token_obtain_pair'
    ),

    path(
        'refresh/',
        TokenRefreshView.as_view(),
        name='token_refresh'
    ),

    path(
        'verify-token/',
        TokenVerifyView.as_view(),
        name='token_verify'
    ),

    path(
        'logout/',
        TokenBlacklistView.as_view(),
        name='token_blacklist'
    ),

    # ======================================
    # Protected Test API
    # ======================================

    path(
        'test/',
        TestAPIView.as_view(),
        name='test'
    ),

    # ======================================
    # Custom Login Template
    # ======================================

    path(
        'custom-login/',
        custom_login_page,
        name='custom-login'
    ),

    # ======================================
    # Swagger Documentation
    # ======================================

    re_path(

        r'^swagger(?P<format>\.json|\.yaml)$',

        schema_view.without_ui(
            cache_timeout=0
        ),

        name='schema-json'
    ),

    path(

        'swagger/',

        schema_view.with_ui(
            'swagger',
            cache_timeout=0
        ),

        name='schema-swagger-ui'
    ),

    # ======================================
    # Redoc Documentation
    # ======================================

    path(

        'redoc/',

        schema_view.with_ui(
            'redoc',
            cache_timeout=0
        ),

        name='schema-redoc'
    ),
]