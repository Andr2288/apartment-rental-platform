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
    readonly_fields = ("created_at", "updated_at")
    inlines = (ListingImageInline,)
    actions = ("moderation_publish", "moderation_reject", "moderation_pending")

    @admin.action(description="Опублікувати вибрані (модерація)")
    def moderation_publish(self, request, queryset):
        queryset.update(status=Listing.Status.PUBLISHED)

    @admin.action(description="Відхилити вибрані")
    def moderation_reject(self, request, queryset):
        queryset.update(status=Listing.Status.REJECTED)

    @admin.action(description="Повернути на модерацію")
    def moderation_pending(self, request, queryset):
        queryset.update(status=Listing.Status.PENDING)


@admin.register(ListingImage)
class ListingImageAdmin(admin.ModelAdmin):
    list_display = ("id", "listing", "sort_order", "external_url")
