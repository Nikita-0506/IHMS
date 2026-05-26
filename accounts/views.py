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
from doctors.models import Doctor
from patients.models import Patient

from rest_framework_simplejwt.views import TokenObtainPairView

from .jwt_serializers import (CustomTokenObtainPairSerializer)


ROLE_DASHBOARD_MODULES = {
    'admin': [
        {'key': 'user-records', 'name': 'User Records', 'url': '/dashboard/users/', 'desc': 'Central directory for all user accounts and role-linked records.', 'tag': 'Insights'},
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
    'user-records': {'icon': 'UR', 'accent': 'indigo'},
    'docker-services': {'icon': 'DK', 'accent': 'teal'},
}


DEPARTMENT_LANE_LABELS = {
    'Core': 'Administration and Admission Cell',
    'Finance': 'Billing and Revenue',
    'Clinical': 'Clinical and Laboratory',
    'Ops': 'Patient and Parent Communication',
    'Insights': 'Management and Analytics',
    'AI': 'AI Decision Support',
    'Infra': 'Infrastructure Operations',
}


ROLE_CAPABILITY_MATRIX = {
    'admin': [
        'Full access to all modules and governance controls',
        'Can grant and revoke role permissions for every department',
        'Can review high-level operational analytics and audit state',
    ],
    'doctor': [
        'Clinical access to assigned patients, appointments, and lab workflows',
        'Can manage selected patient activities based on permission scope',
        'Can consume AI support data for diagnosis assistance',
    ],
    'patient': [
        'Self-service access for appointments, bills, reports, and alerts',
        'View-only visibility into personal healthcare journey data',
        'Cannot modify restricted clinical or system governance data',
    ],
    'receptionist': [
        'Can manage front-desk registration and appointment operations',
        'Can coordinate doctor slots and patient communication touchpoints',
        'Limited finance access for assisted payment operations',
    ],
    'pharmacist': [
        'Can manage medicine dispensing and inventory-related workflows',
        'Can verify prescriptions and coordinate billing handoff',
        'Can trigger medicine refill and stock notifications',
    ],
    'lab_staff': [
        'Can manage sample processing and report publication pipelines',
        'Can access patient mappings relevant to test operations',
        'Can use approved AI tools for result interpretation support',
    ],
}


MODULE_WORKSPACE_BLUEPRINTS = {
    'patients': {
        'headline': 'Patient Lifecycle Workspace',
        'kpis': [
            {'label': 'Registration Queue', 'value': 'Active'},
            {'label': 'Verification SLA', 'value': '< 15 min'},
            {'label': 'Profile Completeness', 'value': '96%'},
        ],
        'workflows': [
            'Registration and admission checks',
            'Clinical profile and history updates',
            'Cross-module record access for care teams',
        ],
    },
    'doctors': {
        'headline': 'Doctor Administration Workspace',
        'kpis': [
            {'label': 'Roster Coverage', 'value': 'Healthy'},
            {'label': 'Shift Compliance', 'value': '98%'},
            {'label': 'Specialty Mapping', 'value': 'Up to date'},
        ],
        'workflows': [
            'Doctor onboarding and profile governance',
            'Schedule mapping and availability control',
            'Departmental coordination with appointments',
        ],
    },
    'appointments': {
        'headline': 'Admission and Appointment Control',
        'kpis': [
            {'label': 'Booking Throughput', 'value': 'High'},
            {'label': 'Wait Time Trend', 'value': 'Stable'},
            {'label': 'No-show Alerts', 'value': 'Enabled'},
        ],
        'workflows': [
            'New booking and admission triage',
            'Reschedule and cancellation handling',
            'Doctor-patient matching and reminders',
        ],
    },
    'billing': {
        'headline': 'Billing and Revenue Operations',
        'kpis': [
            {'label': 'Invoice Pipeline', 'value': 'Realtime'},
            {'label': 'Collection Status', 'value': 'Monitored'},
            {'label': 'Dispute Queue', 'value': 'Low'},
        ],
        'workflows': [
            'Invoice generation and adjustments',
            'Payment collection and reconciliation',
            'Finance reporting for management',
        ],
    },
    'laboratory': {
        'headline': 'Laboratory Command Center',
        'kpis': [
            {'label': 'Sample Turnaround', 'value': 'Tracked'},
            {'label': 'Pending Tests', 'value': 'Visible'},
            {'label': 'Result Quality Gate', 'value': 'Active'},
        ],
        'workflows': [
            'Sample intake and prioritization',
            'Test execution and quality checks',
            'Result publication to patient records',
        ],
    },
    'pharmacy': {
        'headline': 'Pharmacy and Inventory Workspace',
        'kpis': [
            {'label': 'Stock Health', 'value': 'Monitored'},
            {'label': 'Refill Automation', 'value': 'Enabled'},
            {'label': 'Dispense Accuracy', 'value': 'High'},
        ],
        'workflows': [
            'Medicine inventory lifecycle management',
            'Prescription verification and dispensing',
            'Billing and refill coordination',
        ],
    },
    'ai-analysis': {
        'headline': 'AI and Clinical Intelligence Hub',
        'kpis': [
            {'label': 'Model Assist Requests', 'value': 'Realtime'},
            {'label': 'Inference Availability', 'value': '99.9%'},
            {'label': 'Review Compliance', 'value': 'Enabled'},
        ],
        'workflows': [
            'AI-assisted clinical interpretation',
            'Guided risk scoring and recommendations',
            'Audit-safe decision support workflows',
        ],
    },
    'notifications': {
        'headline': 'Communication and Parent/Patient Alerts',
        'kpis': [
            {'label': 'Delivery Success', 'value': 'Healthy'},
            {'label': 'Reminder Cadence', 'value': 'Automated'},
            {'label': 'Escalation Route', 'value': 'Configured'},
        ],
        'workflows': [
            'Reminder and broadcast orchestration',
            'Critical alert and escalation handling',
            'Multi-channel message governance',
        ],
    },
    'dashboard-api': {
        'headline': 'Management Analytics Board',
        'kpis': [
            {'label': 'Operational Coverage', 'value': 'Enterprise'},
            {'label': 'KPI Refresh', 'value': 'Live'},
            {'label': 'Executive Views', 'value': 'Role-based'},
        ],
        'workflows': [
            'Cross-department KPI review',
            'Risk and performance monitoring',
            'Leadership reporting and action planning',
        ],
    },
    'user-records': {
        'headline': 'Unified User Directory',
        'kpis': [
            {'label': 'Identity Source', 'value': 'Accounts User'},
            {'label': 'Role Views', 'value': 'Grouped'},
            {'label': 'Profile Links', 'value': 'Mapped'},
        ],
        'workflows': [
            'Review every user account from one location',
            'Check role mapping and profile completeness',
            'Cross-verify doctor and patient linked records',
        ],
    },
    'docker-services': {
        'headline': 'Infrastructure Service Operations',
        'kpis': [
            {'label': 'Container Health', 'value': 'Observed'},
            {'label': 'Deployment State', 'value': 'Integrated'},
            {'label': 'Runtime Visibility', 'value': 'Enabled'},
        ],
        'workflows': [
            'Service topology visibility',
            'Deployment and runtime coordination',
            'Environment-level troubleshooting readiness',
        ],
    },
}


def _build_department_lanes(modules):
    lane_map = {}
    for module in modules:
        lane_name = DEPARTMENT_LANE_LABELS.get(module.get('tag', ''), 'Other Departments')
        lane_map.setdefault(lane_name, []).append(module)

    lanes = []
    for lane_name, lane_modules in lane_map.items():
        lanes.append(
            {
                'name': lane_name,
                'module_count': len(lane_modules),
                'modules': lane_modules,
            }
        )

    return sorted(lanes, key=lambda item: item['name'])


def _get_role_capabilities(role):
    return ROLE_CAPABILITY_MATRIX.get(
        role,
        [
            'Role permissions are currently restricted',
            'Contact system administrator for access mapping',
        ],
    )


def _get_module_blueprint(module_key):
    return MODULE_WORKSPACE_BLUEPRINTS.get(
        module_key,
        {
            'headline': 'Department Workspace',
            'kpis': [
                {'label': 'Access State', 'value': 'Granted'},
                {'label': 'Audit', 'value': 'Tracked'},
                {'label': 'Workflow', 'value': 'Available'},
            ],
            'workflows': [
                'Role-based operations in unified UI',
                'Controlled actions with policy-aware access',
                'Cross-module integration and traceability',
            ],
        },
    )


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
        if module['key'] == 'user-records':
            item['route_url'] = '/dashboard/users/'
        else:
            item['route_url'] = f"/dashboard/module/{module['key']}/"
        item.update(MODULE_UI_META.get(module['key'], {'icon': 'MD', 'accent': 'blue'}))
        enriched.append(item)
    return enriched


def _build_role_directory():
    users = User.objects.all().select_related('doctor_profile', 'patient_profile').order_by('role', 'username', 'email')
    grouped = []

    for role_value, role_label in User.ROLE_CHOICES:
        role_users = [user for user in users if user.role == role_value]
        records = []

        for user in role_users:
            doctor_profile = getattr(user, 'doctor_profile', None)
            patient_profile = getattr(user, 'patient_profile', None)

            records.append(
                {
                    'username': user.username or '-',
                    'email': user.email,
                    'phone_number': user.phone_number or '-',
                    'is_active': user.is_active,
                    'is_verified': user.is_verified,
                    'doctor_department': getattr(doctor_profile, 'department', '-') if doctor_profile else '-',
                    'doctor_specialization': getattr(doctor_profile, 'specialization', '-') if doctor_profile else '-',
                    'patient_id': getattr(patient_profile, 'patient_id', '-') if patient_profile else '-',
                    'patient_status': getattr(patient_profile, 'status', '-') if patient_profile else '-',
                    'created_at': user.created_at,
                }
            )

        grouped.append(
            {
                'role_key': role_value,
                'role_label': role_label,
                'count': len(records),
                'records': records,
            }
        )

    return grouped

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


def _get_public_role_choices():
    return [choice for choice in User.ROLE_CHOICES if choice[0] != 'admin']


def _authenticate_by_username_or_email(request, identifier, password):
    identifier = (identifier or '').strip()
    if not identifier or not password:
        return None

    matched_user = User.objects.filter(username__iexact=identifier).first()
    if matched_user:
        return authenticate(request, email=matched_user.email, password=password)

    return authenticate(request, email=identifier.lower(), password=password)


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
            elif role == 'admin':
                messages.error(request, 'Admin account cannot be created from public sign up.')
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
            username = request.POST.get('username', '').strip()
            password = request.POST.get('password', '')

            user = _authenticate_by_username_or_email(request, username, password)

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
            'role_choices': _get_public_role_choices(),
        },
    )


def web_admin_login(request):

    if request.user.is_authenticated and request.user.role == 'admin':
        return redirect('web-dashboard')

    next_url = request.GET.get('next') or request.POST.get('next')

    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '')

        user = _authenticate_by_username_or_email(request, username, password)

        if user is None or user.is_deleted or not user.is_active:
            messages.error(request, 'Invalid credentials. Please try again.')
        elif user.role != 'admin':
            messages.error(request, 'This portal is only for admin users.')
        else:
            login(request, user)
            return redirect(next_url or 'web-dashboard')

    return render(
        request,
        'web/admin_login.html',
        {
            'next_url': next_url,
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
        'department_lanes': _build_department_lanes(modules),
        'role_capabilities': _get_role_capabilities(role),
        'docker_enabled': bool(docker_services),
        'docker_services': docker_services,
    }

    return render(request, 'web/dashboard.html', context)


@login_required
def web_user_records(request):

    if request.user.role != 'admin':
        messages.error(request, 'Only admin users can view all user records.')
        return redirect('web-dashboard')

    modules = _enrich_modules(ROLE_DASHBOARD_MODULES.get('admin', []))
    role_directory = _build_role_directory()
    total_users = sum(group['count'] for group in role_directory)

    return render(
        request,
        'web/user_records.html',
        {
            'display_name': request.user.get_full_name().strip() or request.user.email,
            'user_role': 'Admin',
            'modules': modules,
            'role_directory': role_directory,
            'total_users': total_users,
            'doctor_count': Doctor.objects.count(),
            'patient_count': Patient.objects.count(),
        },
    )


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
            'module_blueprint': _get_module_blueprint(module_key),
            'role_capabilities': _get_role_capabilities(role),
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