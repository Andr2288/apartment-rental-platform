from urllib.parse import urlparse

from rest_framework import serializers

from .models import Listing, ListingImage


class ListingImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ListingImage
        fields = ("id", "url", "sort_order")

    def get_url(self, obj):
        ext = (obj.external_url or "").strip()
        if ext:
            return ext
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
    image_url = serializers.URLField(
        write_only=True,
        required=False,
        allow_blank=True,
        max_length=2048,
    )

    class Meta:
        model = ListingImage
        fields = ("image", "image_url", "sort_order")
        extra_kwargs = {
            "image": {"required": False, "allow_null": True},
            "sort_order": {"required": False, "default": 0},
        }

    def validate_image_url(self, value):
        if value is None:
            return value
        u = value.strip()
        if not u:
            return ""
        parsed = urlparse(u)
        if parsed.scheme not in ("http", "https"):
            raise serializers.ValidationError("Дозволені лише посилання http або https.")
        return u

    def validate(self, attrs):
        image = attrs.get("image")
        raw_url = attrs.get("image_url")
        url = raw_url.strip() if isinstance(raw_url, str) else ""
        has_file = bool(image)
        has_url = bool(url)
        if has_file and has_url:
            raise serializers.ValidationError(
                "Надайте або файл зображення, або посилання — не обидва одночасно.",
            )
        if not has_file and not has_url:
            raise serializers.ValidationError(
                "Надайте файл зображення або посилання (https://…).",
            )
        if has_url:
            attrs["image_url"] = url
        elif "image_url" in attrs:
            attrs.pop("image_url", None)
        return attrs

    def create(self, validated_data):
        url = validated_data.pop("image_url", None)
        if url:
            validated_data["external_url"] = url
            validated_data["image"] = None
        else:
            validated_data["external_url"] = ""
        return super().create(validated_data)


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
        if not first:
            return None
        ext = (first.external_url or "").strip()
        if ext:
            return ext
        if not first.image:
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
