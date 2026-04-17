from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from accounts.permissions import IsLandlord

from .models import Listing, ListingImage
from .serializers import (
    ListingImageSerializer,
    ListingImageUploadSerializer,
    ListingSerializer,
    LandlordListingWriteSerializer,
)


class ListingPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 50


class ListingViewSet(ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = ListingSerializer
    pagination_class = ListingPagination

    def get_serializer_context(self):
        return {**super().get_serializer_context(), "request": self.request}

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


class LandlordListingViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated, IsLandlord]
    pagination_class = ListingPagination

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        data = ListingSerializer(
            serializer.instance,
            context=self.get_serializer_context(),
        ).data
        return Response(data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        data = ListingSerializer(
            serializer.instance,
            context=self.get_serializer_context(),
        ).data
        return Response(data)

    def get_queryset(self):
        return (
            Listing.objects.filter(owner=self.request.user)
            .select_related("owner")
            .prefetch_related("images")
            .order_by("-created_at")
        )

    def get_serializer_class(self):
        if self.action in ("list", "retrieve"):
            return ListingSerializer
        return LandlordListingWriteSerializer

    def get_serializer_context(self):
        return {**super().get_serializer_context(), "request": self.request}

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user, status=Listing.Status.PENDING)

    def perform_update(self, serializer):
        instance = serializer.instance
        if instance.status == Listing.Status.REJECTED:
            serializer.save(status=Listing.Status.PENDING)
        else:
            serializer.save()

    @action(
        detail=True,
        methods=["post"],
        parser_classes=[MultiPartParser, FormParser],
    )
    def images(self, request, pk=None):
        listing = self.get_object()
        upload = ListingImageUploadSerializer(data=request.data)
        upload.is_valid(raise_exception=True)
        image = upload.save(listing=listing)
        out = ListingImageSerializer(image, context=self.get_serializer_context())
        return Response(out.data, status=status.HTTP_201_CREATED)

    @action(
        detail=True,
        methods=["delete"],
        url_path=r"images/(?P<image_id>[0-9]+)",
    )
    def delete_image(self, request, pk=None, image_id=None):
        listing = self.get_object()
        img = get_object_or_404(ListingImage, pk=image_id, listing=listing)
        img.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
