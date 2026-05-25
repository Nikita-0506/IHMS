from django.http import JsonResponse
from django.urls import include, path
from django.views import View


class APIHealthView(View):

    def get(self, request):

        return JsonResponse({
            "status": "ok",
            "service": "ihms-api-gateway",
            "version": "v1",
        })


urlpatterns = [
    path("health/", APIHealthView.as_view(), name="api-health"),
    path("auth/", include("api.urls.auth_urls")),
    path("patients/", include("api.urls.patient_urls")),
    path("doctors/", include("api.urls.doctor_urls")),
    path("appointments/", include("api.urls.appointment_urls")),
    path("billing/", include("api.urls.billing_urls")),
    path("dashboard/", include("api.urls.dashboard_urls")),
    path("laboratory/", include("api.urls.laboratory_urls")),
    path("ai-analysis/", include("api.urls.ai_analysis_urls")),
    path("pharmacy/", include("api.urls.pharmacy_urls")),
    path("notifications/", include("api.urls.notification_urls")),
    path("ai-tools/", include("api.urls.ai_tools_urls")),
    path("history/", include("api.urls.history_urls")),
]
