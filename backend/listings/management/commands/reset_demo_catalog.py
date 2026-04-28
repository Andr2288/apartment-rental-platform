import random
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import Profile
from listings.models import Listing, ListingImage

User = get_user_model()

# Стабільні посилання Unsplash (інтер’єри / житло) для демо-каталогу
DEMO_LISTING_IMAGE_URLS = (
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4b750?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
)


def _attach_demo_listing_images(listing: Listing, rng: random.Random) -> None:
    k = rng.randint(2, 3)
    picks = rng.sample(DEMO_LISTING_IMAGE_URLS, k=min(k, len(DEMO_LISTING_IMAGE_URLS)))
    ListingImage.objects.bulk_create(
        [
            ListingImage(listing=listing, external_url=url, sort_order=i)
            for i, url in enumerate(picks)
        ],
    )

DEMO_PASSWORD = "demo12345"

CITIES = [
    ("Київ", "Печерський район"),
    ("Київ", "Оболонь"),
    ("Львів", "Центр"),
    ("Одеса", "Приморський район"),
    ("Харків", "Шевченківський район"),
    ("Дніпро", "Центральний район"),
    ("Вінниця", "Замостя"),
    ("Івано-Франківськ", "Набережна"),
]

LISTING_TEMPLATES = [
    (
        "Світла квартира, ремонт",
        "Просторе планування, велика кухня. Тихий двір, поруч транспорт і магазини.",
    ),
    (
        "Компактна студія біля центру",
        "Ідеально для однієї людини. Є все необхідне для комфортного проживання.",
    ),
    (
        "Двокімнатна з балконом",
        "Сонячна сторона, панорамні вікна. Довгострокова оренда, без тварин.",
    ),
    (
        "Кімната у спільній квартирі",
        "Окрема кімната, спільна кухня та санвузол. Для студентів або спеціалістів.",
    ),
    (
        "Будинок з ділянкою",
        "Окремий вхід, парковка, зелена зона. Підходить для сім'ї.",
    ),
    (
        "1+1 у новобудові",
        "Новий ЖК, консьєрж, дитячий майданчик. Перша здача.",
    ),
    (
        "Квартира біля метро",
        "5 хв пішки до метро. Меблі та техніка за домовленістю.",
    ),
    (
        "Тиха квартира у дворі",
        "Не з вулиці, гарна шумоізоляція. Підходить для віддаленої роботи.",
    ),
]


class Command(BaseCommand):
    help = (
        "Видаляє всіх користувачів (крім superuser), оголошення та токени; "
        "створює 5 орендарів, 5 орендодавців і по 3–5 опублікованих оголошень на кожного орендодавця."
    )

    def handle(self, *args, **options):
        with transaction.atomic():
            Listing.objects.all().delete()
            deleted_summary = User.objects.filter(is_superuser=False).delete()

        total_removed = deleted_summary[0]
        self.stdout.write(
            self.style.WARNING(f"Видалено рядків у БД (користувачі та пов’язані сутності): {total_removed}")
        )

        tenants = []
        landlords = []

        with transaction.atomic():
            for i in range(1, 6):
                u = User.objects.create_user(
                    username=f"tenant{i}",
                    email=f"tenant{i}@demo.local",
                    password=DEMO_PASSWORD,
                )
                Profile.objects.filter(user=u).update(role=Profile.Role.RENTER)
                tenants.append(u.username)

            for i in range(1, 6):
                u = User.objects.create_user(
                    username=f"landlord{i}",
                    email=f"landlord{i}@demo.local",
                    password=DEMO_PASSWORD,
                )
                Profile.objects.filter(user=u).update(role=Profile.Role.LANDLORD)
                landlords.append(u)

            rng = random.Random(42)
            listing_count = 0
            for landlord in landlords:
                n = rng.randint(3, 5)
                for j in range(n):
                    city, district = rng.choice(CITIES)
                    title, desc = rng.choice(LISTING_TEMPLATES)
                    suffix = f" — {city}"
                    if len(title + suffix) > 200:
                        full_title = title
                    else:
                        full_title = title + suffix

                    rooms = rng.randint(1, 4)
                    if "студі" in title.lower():
                        rooms = 1
                    housing = rng.choice(
                        [
                            Listing.HousingType.APARTMENT,
                            Listing.HousingType.STUDIO,
                            Listing.HousingType.ROOM,
                            Listing.HousingType.HOUSE,
                        ]
                    )
                    if "студі" in title.lower():
                        housing = Listing.HousingType.STUDIO
                    if "будинок" in title.lower():
                        housing = Listing.HousingType.HOUSE
                    if "кімнат" in title.lower() and "спільн" in desc.lower():
                        housing = Listing.HousingType.ROOM

                    floor = None if housing == Listing.HousingType.HOUSE else rng.randint(1, 16)
                    price = Decimal(rng.randint(85, 320) * 100)
                    area = Decimal(rng.randint(22, 140))

                    listing = Listing.objects.create(
                        owner=landlord,
                        title=full_title[:200],
                        description=desc,
                        address_or_district=district,
                        city=city,
                        price=price,
                        rooms=rooms,
                        area_sqm=area,
                        floor=floor,
                        housing_type=housing,
                        has_furniture=rng.choice([True, False]),
                        has_appliances=rng.choice([True, False]),
                        contact_info=f"+38050{rng.randint(1000000, 9999999)} · {landlord.email}",
                        status=Listing.Status.PUBLISHED,
                    )
                    _attach_demo_listing_images(listing, rng)
                    listing_count += 1

        self.stdout.write(self.style.SUCCESS("Готово."))
        self.stdout.write(f"  Орендарі (логіни): {', '.join(tenants)}")
        self.stdout.write(f"  Орендодавці (логіни): {', '.join(u.username for u in landlords)}")
        self.stdout.write(f"  Оголошень створено: {listing_count}")
        self.stdout.write(self.style.WARNING(f"  Пароль для всіх демо-користувачів: {DEMO_PASSWORD}"))
        self.stdout.write("  Superuser не змінювався.")
