from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Profile

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source="profile.role", read_only=True)
    role_display = serializers.CharField(source="profile.get_role_display", read_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "role", "role_display")
        read_only_fields = fields


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8, style={"input_type": "password"})
    password_confirm = serializers.CharField(write_only=True, min_length=8, style={"input_type": "password"})
    account_type = serializers.ChoiceField(choices=("seeker", "landlord"), write_only=True)

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Користувач з таким іменем уже існує.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Паролі не збігаються."})
        return attrs

    def create(self, validated_data):
        account_type = validated_data.pop("account_type")
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        role = Profile.Role.LANDLORD if account_type == "landlord" else Profile.Role.RENTER
        profile, _ = Profile.objects.get_or_create(user=user, defaults={"role": role})
        if profile.role != role:
            profile.role = role
            profile.save(update_fields=["role"])
        user.refresh_from_db()
        return user
