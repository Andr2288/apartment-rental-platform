from django.contrib.auth import get_user_model
from django.db.models import Count
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from listings.models import Listing, ListingImage


class HealthView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"status": "ok"})


class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        User = get_user_model()
        rows = Listing.objects.values("status").annotate(count=Count("id"))
        listings_by_status = {row["status"]: row["count"] for row in rows}
        return Response(
            {
                "users_total": User.objects.count(),
                "landlords_total": User.objects.filter(profile__role="landlord").count(),
                "renters_total": User.objects.filter(profile__role="renter").count(),
                "listings_total": Listing.objects.count(),
                "listings_by_status": listings_by_status,
                "images_total": ListingImage.objects.count(),
            }
        )
