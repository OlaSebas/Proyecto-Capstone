from rest_framework import serializers
from .models import customUser

class customUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = customUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'password']