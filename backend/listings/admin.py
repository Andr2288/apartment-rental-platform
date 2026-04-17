from django.contrib import admin

from .models import Listing, ListingImage


class ListingImageInline(admin.TabularInline):
    model = ListingImage
    extra = 0


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "city",
        "price",
        "rooms",
        "status",
        "owner",
        "created_at",
    )
    list_filter = ("status", "housing_type", "city")
    search_fields = ("title", "description", "city", "address_or_district")
    inlines = (ListingImageInline,)


@admin.register(ListingImage)
class ListingImageAdmin(admin.ModelAdmin):
    list_display = ("id", "listing", "sort_order")
