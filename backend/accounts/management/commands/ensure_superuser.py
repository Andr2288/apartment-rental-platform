import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Create or update superuser from DJANGO_SUPERUSER_* environment variables."

    def handle(self, *args, **options):
        username = os.getenv("DJANGO_SUPERUSER_USERNAME", "").strip()
        email = os.getenv("DJANGO_SUPERUSER_EMAIL", "").strip()
        password = os.getenv("DJANGO_SUPERUSER_PASSWORD", "").strip()

        missing = []
        if not username:
            missing.append("DJANGO_SUPERUSER_USERNAME")
        if not email:
            missing.append("DJANGO_SUPERUSER_EMAIL")
        if not password:
            missing.append("DJANGO_SUPERUSER_PASSWORD")

        if missing:
            raise CommandError(f"Missing required env vars: {', '.join(missing)}")

        user_model = get_user_model()
        user, created = user_model.objects.get_or_create(
            username=username,
            defaults={
                "email": email,
                "is_staff": True,
                "is_superuser": True,
            },
        )

        changed = False
        if user.email != email:
            user.email = email
            changed = True
        if not user.is_staff:
            user.is_staff = True
            changed = True
        if not user.is_superuser:
            user.is_superuser = True
            changed = True
        if not user.check_password(password):
            user.set_password(password)
            changed = True

        if changed:
            user.save()

        if created:
            self.stdout.write(self.style.SUCCESS(f"Superuser '{username}' created."))
        elif changed:
            self.stdout.write(self.style.SUCCESS(f"Superuser '{username}' updated."))
        else:
            self.stdout.write(self.style.SUCCESS(f"Superuser '{username}' already up to date."))
