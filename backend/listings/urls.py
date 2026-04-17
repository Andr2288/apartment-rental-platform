from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AiChatView, LandlordListingViewSet, ListingViewSet

router = DefaultRouter()
router.register("listings", ListingViewSet, basename="listing")
router.register("my-listings", LandlordListingViewSet, basename="my-listing")

urlpatterns = [
    path("ai/chat/", AiChatView.as_view(), name="ai-chat"),
    path("", include(router.urls)),
]
