from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render

from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .serializers import RegisterSerializer
from .models import User

from rest_framework_simplejwt.views import TokenObtainPairView

from .jwt_serializers import (CustomTokenObtainPairSerializer)


ROLE_DASHBOARD_MODULES = {
    'admin': [
        {'name': 'Patients', 'url': '/api/patients/', 'desc': 'Manage all patient records and profiles.', 'tag': 'Core'},
        {'name': 'Doctors', 'url': '/api/doctors/', 'desc': 'Manage doctor roster and availability.', 'tag': 'Core'},
        {'name': 'Appointments', 'url': '/api/appointments/', 'desc': 'Monitor and schedule all appointments.', 'tag': 'Core'},
        {'name': 'Billing', 'url': '/api/billing/', 'desc': 'Invoice, payment, and finance workflows.', 'tag': 'Finance'},
        {'name': 'Laboratory', 'url': '/api/laboratory/', 'desc': 'Lab test operations and results.', 'tag': 'Clinical'},
        {'name': 'Pharmacy', 'url': '/api/pharmacy/', 'desc': 'Medicine inventory and dispensing.', 'tag': 'Clinical'},
        {'name': 'AI Analysis', 'url': '/api/ai-analysis/', 'desc': 'AI diagnostics and analytics pipelines.', 'tag': 'AI'},
        {'name': 'Notifications', 'url': '/api/notifications/', 'desc': 'Email/SMS/in-app communication.', 'tag': 'Ops'},
        {'name': 'Dashboard API', 'url': '/api/dashboard/', 'desc': 'Operational dashboards and KPIs.', 'tag': 'Insights'},
    ],
    'doctor': [
        {'name': 'Patients', 'url': '/api/patients/', 'desc': 'View and update assigned patient records.', 'tag': 'Core'},
        {'name': 'Appointments', 'url': '/api/appointments/', 'desc': 'Track schedule and consultation queue.', 'tag': 'Core'},
        {'name': 'Laboratory', 'url': '/api/laboratory/', 'desc': 'Review ordered tests and reports.', 'tag': 'Clinical'},
        {'name': 'AI Analysis', 'url': '/api/ai-analysis/', 'desc': 'Use AI-assisted diagnostic tools.', 'tag': 'AI'},
        {'name': 'Dashboard API', 'url': '/api/dashboard/', 'desc': 'See doctor-focused KPI summaries.', 'tag': 'Insights'},
    ],
    'patient': [
        {'name': 'Appointments', 'url': '/api/appointments/', 'desc': 'Book and track personal appointments.', 'tag': 'Core'},
        {'name': 'Billing', 'url': '/api/billing/', 'desc': 'View bills and payment status.', 'tag': 'Finance'},
        {'name': 'Laboratory', 'url': '/api/laboratory/', 'desc': 'Access personal lab reports.', 'tag': 'Clinical'},
        {'name': 'AI Analysis', 'url': '/api/ai-analysis/', 'desc': 'View AI-assisted health summaries.', 'tag': 'AI'},
        {'name': 'Notifications', 'url': '/api/notifications/', 'desc': 'Track reminders and alerts.', 'tag': 'Ops'},
    ],
    'receptionist': [
        {'name': 'Patients', 'url': '/api/patients/', 'desc': 'Register and verify incoming patients.', 'tag': 'Core'},
        {'name': 'Doctors', 'url': '/api/doctors/', 'desc': 'Review doctor slots and timings.', 'tag': 'Core'},
        {'name': 'Appointments', 'url': '/api/appointments/', 'desc': 'Create and reschedule appointments.', 'tag': 'Core'},
        {'name': 'Billing', 'url': '/api/billing/', 'desc': 'Front-desk billing operations.', 'tag': 'Finance'},
        {'name': 'Notifications', 'url': '/api/notifications/', 'desc': 'Patient communication workflows.', 'tag': 'Ops'},
    ],
    'pharmacist': [
        {'name': 'Pharmacy', 'url': '/api/pharmacy/', 'desc': 'Dispense medicines and maintain stock.', 'tag': 'Clinical'},
        {'name': 'Patients', 'url': '/api/patients/', 'desc': 'Verify patient prescriptions.', 'tag': 'Core'},
        {'name': 'Billing', 'url': '/api/billing/', 'desc': 'Support medicine billing workflow.', 'tag': 'Finance'},
        {'name': 'Notifications', 'url': '/api/notifications/', 'desc': 'Stock and refill alerts.', 'tag': 'Ops'},
    ],
    'lab_staff': [
        {'name': 'Laboratory', 'url': '/api/laboratory/', 'desc': 'Manage test samples and result entry.', 'tag': 'Clinical'},
        {'name': 'Patients', 'url': '/api/patients/', 'desc': 'Map tests to patient profiles.', 'tag': 'Core'},
        {'name': 'AI Analysis', 'url': '/api/ai-analysis/', 'desc': 'Use AI tools for result interpretation.', 'tag': 'AI'},
        {'name': 'Notifications', 'url': '/api/notifications/', 'desc': 'Publish test completion alerts.', 'tag': 'Ops'},
    ],
}

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


def web_login(request):

    if request.user.is_authenticated:
        return redirect('web-dashboard')

    next_url = request.GET.get('next') or request.POST.get('next')

    if request.method == 'POST':
        email = request.POST.get('email', '').strip().lower()
        password = request.POST.get('password', '')

        user = authenticate(request, email=email, password=password)

        if user is not None and not user.is_deleted and user.is_active:
            login(request, user)
            return redirect(next_url or 'web-dashboard')

        messages.error(request, 'Invalid credentials. Please try again.')

    return render(request, 'web/login.html', {'next_url': next_url})


@login_required
def web_dashboard(request):

    role = request.user.role
    modules = ROLE_DASHBOARD_MODULES.get(role, [])
    display_name = request.user.get_full_name().strip() or request.user.email

    context = {
        'display_name': display_name,
        'user_role': role.replace('_', ' ').title(),
        'module_count': len(modules),
        'modules': modules,
    }

    return render(request, 'web/dashboard.html', context)


@login_required
def web_logout(request):

    logout(request)
    return redirect('web-login')