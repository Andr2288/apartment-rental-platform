from rest_framework.permissions import BasePermission

from .models import Profile


class IsLandlord(BasePermission):
    message = "Потрібна роль орендодавця."

    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False
        profile = getattr(user, "profile", None)
        return profile is not None and profile.role == Profile.Role.LANDLORD
