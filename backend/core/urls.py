from django.urls import path

from .views import AdminStatsView, HealthView

urlpatterns = [
    path("health/", HealthView.as_view(), name="api-health"),
    path("admin/stats/", AdminStatsView.as_view(), name="api-admin-stats"),
]
