"""
URL configuration for hospital_ai project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from accounts.views import web_login, web_admin_login, web_dashboard, web_user_records, web_module_view, web_logout, web_create_admin
from api.permissions.swagger_permission import IsSwaggerAdmin

schema_view = get_schema_view(

    openapi.Info(
        title='IHMS API',
        default_version='v1',
        description='Hospital Management System APIs',
    ),

    public=False,

    permission_classes=(IsSwaggerAdmin,),
)

urlpatterns = [

    path(
        '',
        web_login,
        name='web-login'
    ),

    path(
        'admin-login/',
        web_admin_login,
        name='web-admin-login'
    ),

    path(
        'dashboard/',
        web_dashboard,
        name='web-dashboard'
    ),

    path(
        'dashboard/users/',
        web_user_records,
        name='web-user-records'
    ),

    path(
        'dashboard/create-admin/',
        web_create_admin,
        name='web-create-admin'
    ),

    path(
        'dashboard/module/<str:module_key>/',
        web_module_view,
        name='web-module-view'
    ),

    path(
        'logout/',
        web_logout,
        name='web-logout'
    ),

    path(
        'home/',
        TemplateView.as_view(template_name='home.html'),
        name='home'
    ),

    path('admin/', admin.site.urls),

    path('api/accounts/', include('accounts.urls')),
    path('api/patients/', include('patients.urls')),
    path('api/doctors/', include('doctors.urls')),
    path('api/appointments/', include('appointments.urls')),
    path('api/billing/', include('billing.urls')),
    path('api/laboratory/', include('laboratory.urls')),
    path('api/ai-analysis/', include('ai_analysis.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/pharmacy/', include('pharmacy.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/v1/', include('api.urls.api_main_urls')),
    path( 'swagger/',schema_view.with_ui('swagger', cache_timeout=0),name='schema-swagger-ui'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
