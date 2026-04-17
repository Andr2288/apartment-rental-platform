from django.conf import settings
from django.db import models


class Profile(models.Model):
    class Role(models.TextChoices):
        RENTER = "renter", "Орендар"
        LANDLORD = "landlord", "Орендодавець"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    role = models.CharField(
        "роль",
        max_length=20,
        choices=Role.choices,
        default=Role.RENTER,
    )

    def __str__(self):
        return f"{self.user.username} ({self.get_role_display()})"
