from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from accounts.models import Profile
from listings.models import Listing


class Command(BaseCommand):
    help = "Створює демо-користувача та кілька опублікованих оголошень (лише для розробки)."

    def handle(self, *args, **options):
        User = get_user_model()
        user, created = User.objects.get_or_create(
            username="demo_landlord",
            defaults={"email": "demo@example.com"},
        )
        if created:
            user.set_password("demo12345")
            user.save()
            self.stdout.write(self.style.WARNING('Створено demo_landlord / demo12345 — змініть пароль у продакшені.'))

        profile = getattr(user, "profile", None)
        if profile and profile.role != Profile.Role.LANDLORD:
            profile.role = Profile.Role.LANDLORD
            profile.save(update_fields=["role"])
        elif profile is None:
            Profile.objects.create(user=user, role=Profile.Role.LANDLORD)

        samples = [
            {
                "title": "2-кімнатна біля метро, меблі",
                "description": "Світла квартира, ремонт, вся техніка. Довгостроково.",
                "address_or_district": "вул. Хрещатик, 1",
                "city": "Київ",
                "price": Decimal("18000.00"),
                "rooms": 2,
                "area_sqm": Decimal("56.00"),
                "floor": 7,
                "housing_type": Listing.HousingType.APARTMENT,
                "has_furniture": True,
                "has_appliances": True,
                "contact_info": "+380501112233 (Telegram @demo)",
                "status": Listing.Status.PUBLISHED,
            },
            {
                "title": "Студія в центрі Львова",
                "description": "Компактна студія для однієї людини, тихий двір.",
                "address_or_district": "район Центр",
                "city": "Львів",
                "price": Decimal("12000.00"),
                "rooms": 1,
                "area_sqm": Decimal("28.50"),
                "floor": 3,
                "housing_type": Listing.HousingType.STUDIO,
                "has_furniture": True,
                "has_appliances": False,
                "contact_info": "demo.landlord@example.com",
                "status": Listing.Status.PUBLISHED,
            },
            {
                "title": "Будинок з ділянкою, Одеса",
                "description": "Двоповерховий будинок, парковка, сад.",
                "address_or_district": "с. Великодолинське",
                "city": "Одеса",
                "price": Decimal("35000.00"),
                "rooms": 5,
                "area_sqm": Decimal("140.00"),
                "floor": None,
                "housing_type": Listing.HousingType.HOUSE,
                "has_furniture": False,
                "has_appliances": True,
                "contact_info": "+380671234567",
                "status": Listing.Status.PUBLISHED,
            },
        ]

        n = 0
        for data in samples:
            title = data["title"]
            if Listing.objects.filter(owner=user, title=title).exists():
                continue
            Listing.objects.create(owner=user, **data)
            n += 1

        self.stdout.write(self.style.SUCCESS(f"Додано нових оголошень: {n} (пропущено дублікати за назвою)."))
