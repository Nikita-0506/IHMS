# billing/selectors.py

from django.db.models import Sum, Count, Q
from django.utils.timezone import now
from datetime import timedelta

from .models import Billing


# ==========================================
# Get All Active Billings
# ==========================================

def get_active_billings():

    return Billing.objects.filter(
        is_deleted=False
    ).select_related(
        'patient',
        'appointment'
    )


# ==========================================
# Get Billing By Invoice
# ==========================================

def get_billing_by_invoice(invoice):

    return Billing.objects.filter(
        invoice=invoice,
        is_deleted=False
    ).first()


# ==========================================
# Get Pending Payments
# ==========================================

def get_pending_billings():

    return Billing.objects.filter(
        payment_status='pending',
        is_deleted=False
    )


# ==========================================
# Get Paid Billings
# ==========================================

def get_paid_billings():

    return Billing.objects.filter(
        payment_status='paid',
        is_deleted=False
    )


# ==========================================
# Get Refunded Billings
# ==========================================

def get_refunded_billings():

    return Billing.objects.filter(
        payment_status='refunded',
        is_deleted=False
    )


# ==========================================
# Get Overdue Billings
# ==========================================

def get_overdue_billings():

    return Billing.objects.filter(
        payment_status='overdue',
        is_deleted=False
    )


# ==========================================
# Get Total Revenue
# ==========================================

def get_total_revenue():

    revenue = Billing.objects.filter(
        payment_status='paid',
        is_deleted=False
    ).aggregate(
        total=Sum('total_amount')
    )

    return revenue['total'] or 0


# ==========================================
# Get Today's Revenue
# ==========================================

def get_today_revenue():

    today = now().date()

    revenue = Billing.objects.filter(
        generated_at__date=today,
        payment_status='paid',
        is_deleted=False
    ).aggregate(
        total=Sum('total_amount')
    )

    return revenue['total'] or 0


# ==========================================
# Get Monthly Revenue
# ==========================================

def get_monthly_revenue():

    current_month = now().month
    current_year = now().year

    revenue = Billing.objects.filter(
        generated_at__month=current_month,
        generated_at__year=current_year,
        payment_status='paid',
        is_deleted=False
    ).aggregate(
        total=Sum('total_amount')
    )

    return revenue['total'] or 0


# ==========================================
# Get Billing Dashboard Analytics
# ==========================================

def get_billing_dashboard_analytics():

    return {

        "total_billings": Billing.objects.filter(
            is_deleted=False
        ).count(),

        "paid_billings": Billing.objects.filter(
            payment_status='paid',
            is_deleted=False
        ).count(),

        "pending_billings": Billing.objects.filter(
            payment_status='pending',
            is_deleted=False
        ).count(),

        "refunded_billings": Billing.objects.filter(
            payment_status='refunded',
            is_deleted=False
        ).count(),

        "total_revenue": get_total_revenue(),

        "today_revenue": get_today_revenue(),

        "monthly_revenue": get_monthly_revenue(),
    }


# ==========================================
# Get Billing Statistics By Payment Method
# ==========================================

def get_payment_method_statistics():

    return Billing.objects.filter(
        is_deleted=False
    ).values(
        'payment_method'
    ).annotate(
        total_transactions=Count('id'),
        total_amount=Sum('total_amount')
    )


# ==========================================
# Search Billing Records
# ==========================================

def search_billings(search_query):

    return Billing.objects.filter(
        Q(invoice__icontains=search_query) |
        Q(patient__patient_id__icontains=search_query),
        is_deleted=False
    )


# ==========================================
# Get Recent Billing Records
# ==========================================

def get_recent_billings(days=7):

    last_days = now() - timedelta(days=days)

    return Billing.objects.filter(
        generated_at__gte=last_days,
        is_deleted=False
    ).order_by('-generated_at')