from django.conf import settings
from django.db import models


class Listing(models.Model):
    class HousingType(models.TextChoices):
        APARTMENT = "apartment", "Квартира"
        HOUSE = "house", "Будинок"
        ROOM = "room", "Кімната"
        STUDIO = "studio", "Студія"

    class Status(models.TextChoices):
        DRAFT = "draft", "Чернетка"
        PENDING = "pending", "На модерації"
        PUBLISHED = "published", "Опубліковано"
        REJECTED = "rejected", "Відхилено"

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="listings",
    )
    title = models.CharField("назва", max_length=200)
    description = models.TextField("опис")
    address_or_district = models.CharField("адреса або район", max_length=300)
    city = models.CharField("місто", max_length=120)
    price = models.DecimalField("ціна", max_digits=12, decimal_places=2)
    rooms = models.PositiveSmallIntegerField("кількість кімнат")
    area_sqm = models.DecimalField("площа, м²", max_digits=8, decimal_places=2)
    floor = models.IntegerField("поверх", null=True, blank=True)
    housing_type = models.CharField(
        "тип житла",
        max_length=20,
        choices=HousingType.choices,
        default=HousingType.APARTMENT,
    )
    has_furniture = models.BooleanField("наявність меблів", default=False)
    has_appliances = models.BooleanField("наявність техніки", default=False)
    contact_info = models.CharField("контактна інформація", max_length=500)
    status = models.CharField(
        "статус оголошення",
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "-created_at"]),
            models.Index(fields=["city"]),
        ]

    def __str__(self):
        return self.title


class ListingImage(models.Model):
    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        related_name="images",
    )
    image = models.ImageField("фото", upload_to="listings/%Y/%m/", blank=True, null=True)
    external_url = models.URLField(
        "посилання на фото",
        max_length=2048,
        blank=True,
    )
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        if self.external_url:
            return f"{self.listing_id}: {self.external_url[:80]}"
        return f"{self.listing_id}: {self.image.name if self.image else ''}"
