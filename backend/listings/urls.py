from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import LandlordListingViewSet, ListingViewSet

router = DefaultRouter()
router.register("listings", ListingViewSet, basename="listing")
router.register("my-listings", LandlordListingViewSet, basename="my-listing")

urlpatterns = [
    path("", include(router.urls)),
]
