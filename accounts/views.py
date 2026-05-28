from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import ensure_csrf_cookie
from django.middleware.csrf import rotate_token
from pathlib import Path
import re
import uuid

from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .serializers import RegisterSerializer
from .models import User
from doctors.models import Doctor
from patients.models import Patient
from notifications.models import Notification

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


def _get_display_name(user):
    """Return a human-friendly display name with role-based prefix."""
    full_name = user.get_full_name().strip()
    if not full_name:
        # Try building from first/last individually
        parts = [p for p in (user.first_name.strip(), user.last_name.strip()) if p]
        full_name = ' '.join(parts)
    if full_name:
        role_prefixes = {
            'doctor': 'Dr.',
            'admin': 'Admin',
        }
        prefix = role_prefixes.get(user.role)
        if prefix and not full_name.startswith(prefix):
            return f"{prefix} {full_name}"
        return full_name
    # Fall back to username, then email
    return user.username or user.email


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
    users = User.objects.filter(is_deleted=False).select_related('doctor_profile', 'patient_profile').order_by('role', 'username', 'email')
    grouped = []

    for role_value, role_label in User.ROLE_CHOICES:
        role_users = [user for user in users if user.role == role_value]
        records = []

        for user in role_users:
            doctor_profile = getattr(user, 'doctor_profile', None)
            patient_profile = getattr(user, 'patient_profile', None)

            records.append(
                {
                    'id': str(user.id),
                    'first_name': user.first_name or '',
                    'last_name': user.last_name or '',
                    'full_name': user.get_full_name().strip() or '-',
                    'role': user.role,
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


@never_cache
@ensure_csrf_cookie
def web_csrf_failure(request, reason=''):
    # Regenerate CSRF token and return users to a safe entry page.
    rotate_token(request)
    messages.error(request, 'Your session token expired. Please try signing in again.')
    return redirect('web-login')


@never_cache
@ensure_csrf_cookie
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
            elif User.objects.filter(email=email, is_deleted=False).exists():
                messages.error(request, 'An account with this email already exists.')
            elif User.objects.filter(username=username, is_deleted=False).exists():
                messages.error(request, 'This username is already taken.')
            else:
                try:
                    deleted_email_user = User.objects.filter(email=email, is_deleted=True).first()
                    deleted_username_user = User.objects.filter(username=username, is_deleted=True).first()

                    if (
                        deleted_email_user
                        and deleted_username_user
                        and deleted_email_user.id != deleted_username_user.id
                    ):
                        messages.error(
                            request,
                            'Email and username belong to different deleted accounts. Use a different username or email.',
                        )
                        return redirect('web-login')

                    validate_password(password)

                    deleted_user = deleted_email_user or deleted_username_user

                    if deleted_user is not None:
                        deleted_user.username = username
                        deleted_user.email = email
                        deleted_user.role = role
                        deleted_user.is_deleted = False
                        deleted_user.is_active = True
                        deleted_user.is_verified = False
                        deleted_user.set_password(password)
                        deleted_user.save(
                            update_fields=[
                                'username',
                                'email',
                                'role',
                                'is_deleted',
                                'is_active',
                                'is_verified',
                                'password',
                                'updated_at',
                            ]
                        )
                    else:
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


@never_cache
@ensure_csrf_cookie
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
    display_name = _get_display_name(request.user)
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
@never_cache
@ensure_csrf_cookie
def web_user_records(request):

    if request.user.role != 'admin':
        messages.error(request, 'Only admin users can view all user records.')
        return redirect('web-dashboard')

    modules = _enrich_modules(ROLE_DASHBOARD_MODULES.get('admin', []))

    if request.method == 'POST':
        action = (request.POST.get('action') or '').strip()
        target_user_id = (request.POST.get('target_user_id') or '').strip()

        def _resolve_target_user():
            if not target_user_id:
                return None
            try:
                parsed_id = uuid.UUID(target_user_id)
            except ValueError:
                return None
            return User.objects.filter(id=parsed_id, is_deleted=False).first()

        if action in {'grant_access', 'reject_access', 'remove_user', 'change_role', 'edit_user', 'send_notification_user'}:
            target_user = _resolve_target_user()
            if target_user is None:
                messages.error(request, 'Target user not found.')
                return redirect('web-user-records')

            if action == 'grant_access':
                target_user.is_active = True
                target_user.is_verified = True
                target_user.is_deleted = False
                target_user.save(update_fields=['is_active', 'is_verified', 'is_deleted', 'updated_at'])
                messages.success(request, f'Access granted for {target_user.email}.')

            elif action == 'reject_access':
                if target_user.id == request.user.id:
                    messages.error(request, 'You cannot reject your own access.')
                    return redirect('web-user-records')
                target_user.is_active = False
                target_user.save(update_fields=['is_active', 'updated_at'])
                messages.success(request, f'Access rejected for {target_user.email}.')

            elif action == 'remove_user':
                if target_user.id == request.user.id:
                    messages.error(request, 'You cannot remove your own admin account.')
                    return redirect('web-user-records')
                target_user.is_active = False
                target_user.is_verified = False
                target_user.is_deleted = True
                target_user.save(update_fields=['is_active', 'is_verified', 'is_deleted', 'updated_at'])
                messages.success(request, f'User {target_user.email} was removed successfully.')

            elif action == 'change_role':
                new_role = (request.POST.get('new_role') or '').strip()
                allowed_roles = {value for value, _ in User.ROLE_CHOICES}
                if new_role not in allowed_roles:
                    messages.error(request, 'Invalid role selected.')
                    return redirect('web-user-records')

                target_user.role = new_role
                if new_role == 'admin':
                    target_user.is_staff = True
                    target_user.is_superuser = True
                else:
                    target_user.is_staff = False
                    target_user.is_superuser = False
                target_user.save(update_fields=['role', 'is_staff', 'is_superuser', 'updated_at'])
                messages.success(request, f'Role updated to {new_role.replace("_", " ").title()} for {target_user.email}.')

            elif action == 'edit_user':
                first_name = (request.POST.get('first_name') or '').strip()
                last_name = (request.POST.get('last_name') or '').strip()
                username = (request.POST.get('username') or '').strip()
                email = (request.POST.get('email') or '').strip().lower()
                phone_number = (request.POST.get('phone_number') or '').strip()

                if not username or not email:
                    messages.error(request, 'Username and email are required to update user details.')
                    return redirect('web-user-records')

                if User.objects.filter(username=username).exclude(id=target_user.id).exists():
                    messages.error(request, 'This username is already used by another user.')
                    return redirect('web-user-records')

                if User.objects.filter(email=email).exclude(id=target_user.id).exists():
                    messages.error(request, 'This email is already used by another user.')
                    return redirect('web-user-records')

                target_user.first_name = first_name
                target_user.last_name = last_name
                target_user.username = username
                target_user.email = email
                target_user.phone_number = phone_number or None
                target_user.save(update_fields=['first_name', 'last_name', 'username', 'email', 'phone_number', 'updated_at'])
                messages.success(request, f'User profile updated for {target_user.email}.')

            elif action == 'send_notification_user':
                title = (request.POST.get('title') or '').strip()
                body = (request.POST.get('message') or '').strip()
                notification_type = (request.POST.get('notification_type') or 'system').strip()
                priority = (request.POST.get('priority') or 'medium').strip()
                valid_types = {value for value, _ in Notification.NOTIFICATION_TYPES}
                valid_priorities = {value for value, _ in Notification.PRIORITY_LEVELS}

                if not title or not body:
                    messages.error(request, 'Notification title and message are required.')
                    return redirect('web-user-records')
                if notification_type not in valid_types:
                    notification_type = 'system'
                if priority not in valid_priorities:
                    priority = 'medium'

                Notification.objects.create(
                    user=target_user,
                    title=title,
                    message=body,
                    notification_type=notification_type,
                    priority=priority,
                    delivery_status='sent',
                )
                messages.success(request, f'Notification sent to {target_user.email}.')

            return redirect('web-user-records')

        if action == 'send_notification_bulk':
            title = (request.POST.get('title') or '').strip()
            body = (request.POST.get('message') or '').strip()
            notification_type = (request.POST.get('notification_type') or 'system').strip()
            priority = (request.POST.get('priority') or 'medium').strip()
            recipient_scope = (request.POST.get('recipient_scope') or 'selected').strip()
            selected_ids = request.POST.getlist('selected_user_ids')
            explicit_user_ids = request.POST.getlist('bulk_user_ids')
            target_department = (request.POST.get('target_department') or '').strip()

            if not title or not body:
                messages.error(request, 'Bulk notification requires title and message.')
                return redirect('web-user-records')

            valid_types = {value for value, _ in Notification.NOTIFICATION_TYPES}
            valid_priorities = {value for value, _ in Notification.PRIORITY_LEVELS}
            if notification_type not in valid_types:
                notification_type = 'system'
            if priority not in valid_priorities:
                priority = 'medium'

            def _parse_uuid_list(raw_ids):
                valid_uuids = []
                for raw_id in raw_ids:
                    try:
                        valid_uuids.append(uuid.UUID(raw_id))
                    except ValueError:
                        continue
                return valid_uuids

            if recipient_scope == 'all':
                recipients = User.objects.filter(is_deleted=False)
            elif recipient_scope == 'department':
                if not target_department:
                    recipients = User.objects.none()
                else:
                    recipients = User.objects.filter(
                        is_deleted=False,
                        doctor_profile__is_deleted=False,
                        doctor_profile__department=target_department,
                    ).distinct()
            elif recipient_scope == 'users':
                valid_uuids = _parse_uuid_list(explicit_user_ids)
                recipients = User.objects.filter(id__in=valid_uuids, is_deleted=False)
            else:
                valid_uuids = _parse_uuid_list(selected_ids)
                recipients = User.objects.filter(id__in=valid_uuids, is_deleted=False)

            payload = [
                Notification(
                    user=user,
                    title=title,
                    message=body,
                    notification_type=notification_type,
                    priority=priority,
                    delivery_status='sent',
                )
                for user in recipients
            ]

            if not payload:
                messages.error(request, 'No valid recipients found for bulk notification.')
                return redirect('web-user-records')

            Notification.objects.bulk_create(payload)
            messages.success(request, f'Notification sent to {len(payload)} user(s).')
            return redirect('web-user-records')

        messages.error(request, 'Unknown action requested.')
        return redirect('web-user-records')

    role_directory = _build_role_directory()
    total_users = sum(group['count'] for group in role_directory)
    department_choices = list(
        Doctor.objects.filter(is_deleted=False)
        .exclude(department__isnull=True)
        .exclude(department__exact='')
        .values_list('department', flat=True)
        .distinct()
        .order_by('department')
    )
    active_users = User.objects.filter(is_deleted=False).order_by('first_name', 'last_name', 'email')
    user_choices = [
        {
            'id': str(user.id),
            'label': f"{_get_display_name(user)} ({user.email})",
        }
        for user in active_users
    ]

    return render(
        request,
        'web/user_records.html',
        {
            'display_name': _get_display_name(request.user),
            'user_role': 'Admin',
            'modules': modules,
            'role_directory': role_directory,
            'total_users': total_users,
            'doctor_count': Doctor.objects.count(),
            'patient_count': Patient.objects.count(),
            'notification_type_choices': Notification.NOTIFICATION_TYPES,
            'priority_choices': Notification.PRIORITY_LEVELS,
            'role_choices': User.ROLE_CHOICES,
            'department_choices': department_choices,
            'user_choices': user_choices,
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
            'display_name': _get_display_name(request.user),
            'user_role': role.replace('_', ' ').title(),
            'docker_services': docker_services,
            'docker_enabled': bool(docker_services),
        },
    )


@login_required
def web_create_admin(request):
    if request.user.role != 'admin':
        messages.error(request, 'Only admins can create admin accounts.')
        return redirect('web-dashboard')

    role = request.user.role
    modules = _enrich_modules(ROLE_DASHBOARD_MODULES.get(role, []))

    errors = {}
    form_data = {}

    if request.method == 'POST':
        first_name = request.POST.get('first_name', '').strip()
        last_name  = request.POST.get('last_name', '').strip()
        email      = request.POST.get('email', '').strip()
        username   = request.POST.get('username', '').strip()
        password   = request.POST.get('password', '').strip()
        confirm    = request.POST.get('confirm_password', '').strip()
        phone      = request.POST.get('phone_number', '').strip()

        form_data = {
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'username': username,
            'phone_number': phone,
        }

        if not first_name:
            errors['first_name'] = 'First name is required.'
        if not last_name:
            errors['last_name'] = 'Last name is required.'
        if not email:
            errors['email'] = 'Email is required.'
        elif User.objects.filter(email=email).exists():
            errors['email'] = 'An account with this email already exists.'
        if not username:
            errors['username'] = 'Username is required.'
        elif User.objects.filter(username=username).exists():
            errors['username'] = 'This username is already taken.'
        if not password:
            errors['password'] = 'Password is required.'
        elif len(password) < 8:
            errors['password'] = 'Password must be at least 8 characters.'
        elif password != confirm:
            errors['confirm_password'] = 'Passwords do not match.'

        if not errors:
            new_admin = User(
                first_name=first_name,
                last_name=last_name,
                email=email,
                username=username,
                phone_number=phone or None,
                role='admin',
                is_staff=True,
                is_superuser=True,
                is_verified=True,
            )
            new_admin.set_password(password)
            new_admin.save()
            messages.success(request, f'Admin account for {first_name} {last_name} created successfully.')
            return redirect('web-create-admin')

    return render(request, 'web/create_admin.html', {
        'display_name': _get_display_name(request.user),
        'user_role': 'Admin',
        'modules': modules,
        'errors': errors,
        'form_data': form_data,
    })


@login_required
def web_logout(request):

    logout(request)
    return redirect('web-login')