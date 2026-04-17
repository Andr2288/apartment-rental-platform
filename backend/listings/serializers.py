from rest_framework import serializers

from .models import Listing, ListingImage


class ListingImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ListingImage
        fields = ("id", "url", "sort_order")

    def get_url(self, obj):
        if not obj.image:
            return None
        request = self.context.get("request")
        url = obj.image.url
        if request:
            return request.build_absolute_uri(url)
        return url


class LandlordListingWriteSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Listing
        fields = (
            "id",
            "title",
            "description",
            "address_or_district",
            "city",
            "price",
            "rooms",
            "area_sqm",
            "floor",
            "housing_type",
            "has_furniture",
            "has_appliances",
            "contact_info",
        )


class ListingImageUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingImage
        fields = ("image", "sort_order")
        extra_kwargs = {"sort_order": {"required": False, "default": 0}}


class ListingBriefSerializer(serializers.ModelSerializer):
    housing_type_display = serializers.CharField(
        source="get_housing_type_display",
        read_only=True,
    )
    thumb_url = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = (
            "id",
            "title",
            "city",
            "price",
            "rooms",
            "housing_type_display",
            "thumb_url",
        )

    def get_thumb_url(self, obj):
        first = obj.images.first()
        if not first or not first.image:
            return None
        request = self.context.get("request")
        url = first.image.url
        if request:
            return request.build_absolute_uri(url)
        return url


class ListingSerializer(serializers.ModelSerializer):
    images = ListingImageSerializer(many=True, read_only=True)
    housing_type_display = serializers.CharField(source="get_housing_type_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Listing
        fields = (
            "id",
            "title",
            "description",
            "address_or_district",
            "city",
            "price",
            "rooms",
            "area_sqm",
            "floor",
            "housing_type",
            "housing_type_display",
            "has_furniture",
            "has_appliances",
            "contact_info",
            "status",
            "status_display",
            "created_at",
            "updated_at",
            "images",
        )
