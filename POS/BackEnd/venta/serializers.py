from rest_framework import serializers
from .models import customUser, SesionCaja, Caja, Venta, Cliente

class customUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = customUser
        fields = ['username', 'email', 'first_name', 'last_name', 'date_joined','is_staff', 'is_active','is_superuser']
    
class CajaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Caja
        fields = '__all__'
    
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