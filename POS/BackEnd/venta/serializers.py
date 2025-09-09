from rest_framework import serializers
from .models import customUser

class customUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = customUser
        fields = ['username', 'email', 'first_name', 'last_name', 'date_joined','is_staff', 'is_active','is_superuser']