from django.db.models import Q
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from rest_framework.viewsets import ReadOnlyModelViewSet

from .models import Listing
from .serializers import ListingSerializer


class ListingPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 50


class ListingViewSet(ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = ListingSerializer
    pagination_class = ListingPagination

    def get_queryset(self):
        qs = (
            Listing.objects.filter(status=Listing.Status.PUBLISHED)
            .select_related("owner")
            .prefetch_related("images")
        )
        p = self.request.query_params

        if q := p.get("search", "").strip():
            qs = qs.filter(
                Q(title__icontains=q)
                | Q(description__icontains=q)
                | Q(city__icontains=q)
                | Q(address_or_district__icontains=q)
            )

        if city := p.get("city", "").strip():
            qs = qs.filter(city__icontains=city)

        if min_price := p.get("min_price"):
            try:
                qs = qs.filter(price__gte=min_price)
            except (TypeError, ValueError):
                pass

        if max_price := p.get("max_price"):
            try:
                qs = qs.filter(price__lte=max_price)
            except (TypeError, ValueError):
                pass

        if min_rooms := p.get("min_rooms"):
            try:
                qs = qs.filter(rooms__gte=int(min_rooms))
            except (TypeError, ValueError):
                pass

        if max_rooms := p.get("max_rooms"):
            try:
                qs = qs.filter(rooms__lte=int(max_rooms))
            except (TypeError, ValueError):
                pass

        if ht := p.get("housing_type", "").strip():
            if ht in Listing.HousingType.values:
                qs = qs.filter(housing_type=ht)

        if p.get("has_furniture") == "true":
            qs = qs.filter(has_furniture=True)
        elif p.get("has_furniture") == "false":
            qs = qs.filter(has_furniture=False)

        if p.get("has_appliances") == "true":
            qs = qs.filter(has_appliances=True)
        elif p.get("has_appliances") == "false":
            qs = qs.filter(has_appliances=False)

        return qs
