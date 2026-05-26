from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from pathlib import Path
import re

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
        {'key': 'patients', 'name': 'Patients', 'url': '/api/patients/', 'desc': 'Manage all patient records and profiles.', 'tag': 'Core'},
        {'key': 'doctors', 'name': 'Doctors', 'url': '/api/doctors/', 'desc': 'Manage doctor roster and availability.', 'tag': 'Core'},
        {'key': 'appointments', 'name': 'Appointments', 'url': '/api/appointments/', 'desc': 'Monitor and schedule all appointments.', 'tag': 'Core'},
        {'key': 'billing', 'name': 'Billing', 'url': '/api/billing/', 'desc': 'Invoice, payment, and finance workflows.', 'tag': 'Finance'},
        {'key': 'laboratory', 'name': 'Laboratory', 'url': '/api/laboratory/', 'desc': 'Lab test operations and results.', 'tag': 'Clinical'},
        {'key': 'pharmacy', 'name': 'Pharmacy', 'url': '/api/pharmacy/', 'desc': 'Medicine inventory and dispensing.', 'tag': 'Clinical'},
        {'key': 'ai-analysis', 'name': 'AI Analysis', 'url': '/api/ai-analysis/', 'desc': 'AI diagnostics and analytics pipelines.', 'tag': 'AI'},
        {'key': 'notifications', 'name': 'Notifications', 'url': '/api/notifications/', 'desc': 'Email/SMS/in-app communication.', 'tag': 'Ops'},
        {'key': 'dashboard-api', 'name': 'Dashboard API', 'url': '/api/dashboard/', 'desc': 'Operational dashboards and KPIs.', 'tag': 'Insights'},
    ],
    'doctor': [
        {'key': 'patients', 'name': 'Patients', 'url': '/api/patients/', 'desc': 'View and update assigned patient records.', 'tag': 'Core'},
        {'key': 'appointments', 'name': 'Appointments', 'url': '/api/appointments/', 'desc': 'Track schedule and consultation queue.', 'tag': 'Core'},
        {'key': 'laboratory', 'name': 'Laboratory', 'url': '/api/laboratory/', 'desc': 'Review ordered tests and reports.', 'tag': 'Clinical'},
        {'key': 'ai-analysis', 'name': 'AI Analysis', 'url': '/api/ai-analysis/', 'desc': 'Use AI-assisted diagnostic tools.', 'tag': 'AI'},
        {'key': 'dashboard-api', 'name': 'Dashboard API', 'url': '/api/dashboard/', 'desc': 'See doctor-focused KPI summaries.', 'tag': 'Insights'},
    ],
    'patient': [
        {'key': 'appointments', 'name': 'Appointments', 'url': '/api/appointments/', 'desc': 'Book and track personal appointments.', 'tag': 'Core'},
        {'key': 'billing', 'name': 'Billing', 'url': '/api/billing/', 'desc': 'View bills and payment status.', 'tag': 'Finance'},
        {'key': 'laboratory', 'name': 'Laboratory', 'url': '/api/laboratory/', 'desc': 'Access personal lab reports.', 'tag': 'Clinical'},
        {'key': 'ai-analysis', 'name': 'AI Analysis', 'url': '/api/ai-analysis/', 'desc': 'View AI-assisted health summaries.', 'tag': 'AI'},
        {'key': 'notifications', 'name': 'Notifications', 'url': '/api/notifications/', 'desc': 'Track reminders and alerts.', 'tag': 'Ops'},
    ],
    'receptionist': [
        {'key': 'patients', 'name': 'Patients', 'url': '/api/patients/', 'desc': 'Register and verify incoming patients.', 'tag': 'Core'},
        {'key': 'doctors', 'name': 'Doctors', 'url': '/api/doctors/', 'desc': 'Review doctor slots and timings.', 'tag': 'Core'},
        {'key': 'appointments', 'name': 'Appointments', 'url': '/api/appointments/', 'desc': 'Create and reschedule appointments.', 'tag': 'Core'},
        {'key': 'billing', 'name': 'Billing', 'url': '/api/billing/', 'desc': 'Front-desk billing operations.', 'tag': 'Finance'},
        {'key': 'notifications', 'name': 'Notifications', 'url': '/api/notifications/', 'desc': 'Patient communication workflows.', 'tag': 'Ops'},
    ],
    'pharmacist': [
        {'key': 'pharmacy', 'name': 'Pharmacy', 'url': '/api/pharmacy/', 'desc': 'Dispense medicines and maintain stock.', 'tag': 'Clinical'},
        {'key': 'patients', 'name': 'Patients', 'url': '/api/patients/', 'desc': 'Verify patient prescriptions.', 'tag': 'Core'},
        {'key': 'billing', 'name': 'Billing', 'url': '/api/billing/', 'desc': 'Support medicine billing workflow.', 'tag': 'Finance'},
        {'key': 'notifications', 'name': 'Notifications', 'url': '/api/notifications/', 'desc': 'Stock and refill alerts.', 'tag': 'Ops'},
    ],
    'lab_staff': [
        {'key': 'laboratory', 'name': 'Laboratory', 'url': '/api/laboratory/', 'desc': 'Manage test samples and result entry.', 'tag': 'Clinical'},
        {'key': 'patients', 'name': 'Patients', 'url': '/api/patients/', 'desc': 'Map tests to patient profiles.', 'tag': 'Core'},
        {'key': 'ai-analysis', 'name': 'AI Analysis', 'url': '/api/ai-analysis/', 'desc': 'Use AI tools for result interpretation.', 'tag': 'AI'},
        {'key': 'notifications', 'name': 'Notifications', 'url': '/api/notifications/', 'desc': 'Publish test completion alerts.', 'tag': 'Ops'},
    ],
}


MODULE_UI_META = {
    'patients': {'icon': 'PT', 'accent': 'blue'},
    'doctors': {'icon': 'DR', 'accent': 'green'},
    'appointments': {'icon': 'AP', 'accent': 'amber'},
    'billing': {'icon': 'BL', 'accent': 'pink'},
    'laboratory': {'icon': 'LB', 'accent': 'teal'},
    'pharmacy': {'icon': 'PH', 'accent': 'orange'},
    'ai-analysis': {'icon': 'AI', 'accent': 'purple'},
    'notifications': {'icon': 'NT', 'accent': 'indigo'},
    'dashboard-api': {'icon': 'DB', 'accent': 'blue'},
    'docker-services': {'icon': 'DK', 'accent': 'teal'},
}


def _get_docker_services():
    project_root = Path(__file__).resolve().parents[1]
    compose_file = project_root / 'docker-compose.yml'

    if not compose_file.exists():
        return []

    services = []
    in_services_block = False

    for raw_line in compose_file.read_text(encoding='utf-8', errors='ignore').splitlines():
        line = raw_line.rstrip()
        if not line or line.lstrip().startswith('#'):
            continue

        if re.match(r'^services:\s*$', line):
            in_services_block = True
            continue

        if in_services_block and re.match(r'^[A-Za-z0-9_-]+:\s*$', line):
            # exited indented services entries
            if raw_line.startswith(' '):
                continue
            break

        if in_services_block:
            match = re.match(r'^\s{2}([A-Za-z0-9_-]+):\s*$', line)
            if match:
                services.append(match.group(1))

    return services


def _enrich_modules(modules):
    enriched = []
    for module in modules:
        item = dict(module)
        item['route_url'] = f"/dashboard/module/{module['key']}/"
        item.update(MODULE_UI_META.get(module['key'], {'icon': 'MD', 'accent': 'blue'}))
        enriched.append(item)
    return enriched

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
    active_tab = request.POST.get('form_type', 'login')

    if request.method == 'POST':
        form_type = request.POST.get('form_type', 'login')

        if form_type == 'register':
            active_tab = 'register'
            username = request.POST.get('username', '').strip()
            email = request.POST.get('register_email', '').strip().lower()
            password = request.POST.get('register_password', '')
            password2 = request.POST.get('confirm_password', '')
            role = request.POST.get('role', 'patient')

            if not username or not email or not password:
                messages.error(request, 'All signup fields are required.')
            elif password != password2:
                messages.error(request, 'Passwords do not match.')
            elif User.objects.filter(email=email).exists():
                messages.error(request, 'An account with this email already exists.')
            elif User.objects.filter(username=username).exists():
                messages.error(request, 'This username is already taken.')
            else:
                try:
                    validate_password(password)
                    User.objects.create_user(
                        username=username,
                        email=email,
                        password=password,
                        role=role,
                    )
                    messages.success(request, 'Account created successfully. Please sign in.')
                    active_tab = 'login'
                except ValidationError as exc:
                    for msg in exc.messages:
                        messages.error(request, msg)
                except Exception:
                    messages.error(request, 'Unable to create account right now. Please try again.')
        else:
            email = request.POST.get('email', '').strip().lower()
            password = request.POST.get('password', '')

            user = authenticate(request, email=email, password=password)

            if user is not None and not user.is_deleted and user.is_active:
                login(request, user)
                return redirect(next_url or 'web-dashboard')

            messages.error(request, 'Invalid credentials. Please try again.')

    return render(
        request,
        'web/login.html',
        {
            'next_url': next_url,
            'active_tab': active_tab,
            'role_choices': User.ROLE_CHOICES,
        },
    )


@login_required
def web_dashboard(request):

    role = request.user.role
    modules = _enrich_modules(ROLE_DASHBOARD_MODULES.get(role, []))
    display_name = request.user.get_full_name().strip() or request.user.email
    docker_services = _get_docker_services()

    if docker_services and role == 'admin':
        modules.append(
            {
                'key': 'docker-services',
                'name': 'Docker Services',
                'url': '/docker-compose.yml',
                'route_url': '/dashboard/module/docker-services/',
                'desc': 'Monitor configured container services and deployment touchpoints.',
                'tag': 'Infra',
                'icon': 'DK',
                'accent': 'teal',
            }
        )

    context = {
        'display_name': display_name,
        'user_role': role.replace('_', ' ').title(),
        'module_count': len(modules),
        'modules': modules,
        'docker_enabled': bool(docker_services),
        'docker_services': docker_services,
    }

    return render(request, 'web/dashboard.html', context)


@login_required
def web_module_view(request, module_key):
    role = request.user.role
    modules = _enrich_modules(ROLE_DASHBOARD_MODULES.get(role, []))
    docker_services = _get_docker_services()

    if docker_services and role == 'admin':
        modules.append(
            {
                'key': 'docker-services',
                'name': 'Docker Services',
                'url': '/docker-compose.yml',
                'route_url': '/dashboard/module/docker-services/',
                'desc': 'Monitor configured container services and deployment touchpoints.',
                'tag': 'Infra',
                'icon': 'DK',
                'accent': 'teal',
            }
        )

    module = next((item for item in modules if item['key'] == module_key), None)
    if not module:
        messages.error(request, 'You do not have access to this module.')
        return redirect('web-dashboard')

    return render(
        request,
        'web/module_detail.html',
        {
            'module': module,
            'modules': modules,
            'display_name': request.user.get_full_name().strip() or request.user.email,
            'user_role': role.replace('_', ' ').title(),
            'docker_services': docker_services,
            'docker_enabled': bool(docker_services),
        },
    )


@login_required
def web_logout(request):

    logout(request)
    return redirect('web-login')