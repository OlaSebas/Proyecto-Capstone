from rest_framework import serializers
from .models import customUser, SesionCaja, Caja, Venta, Cliente

class CajaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Caja
        fields = '__all__'

class customUserSerializer(serializers.ModelSerializer):
    caja = CajaSerializer(read_only=True)
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = customUser
        fields = ['id','username', 'email', 'first_name', 'last_name', 'date_joined','is_staff', 'is_active','is_superuser','password','caja']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = customUser(**validated_data)
        user.set_password(password)  # 🔒 aquí se encripta
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class SesionCajaSerializer(serializers.ModelSerializer):
    caja = CajaSerializer(read_only=True)
    class Meta:
        model = SesionCaja
        fields = '__all__'

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'

class VentaSerializer(serializers.ModelSerializer):
    cliente = ClienteSerializer(read_only=True)
    usuario = customUserSerializer(read_only=True)
    class Meta:
        model = Venta
        fields = '__all__'