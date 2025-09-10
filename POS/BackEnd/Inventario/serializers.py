from rest_framework import serializers
from .models import Region, Ciudad, Comuna, Sucursal, Insumo, Producto, Inventario

class InventarioSerializer(serializers.ModelSerializer):
    producto_descripcion = serializers.CharField(source='producto.descripcion', read_only=True)
    insumo_descripcion = serializers.CharField(source='insumo.descripcion', read_only=True)
    sucursal_nombre = serializers.CharField(source='sucursal.nombre', read_only=True)
    
    class Meta:
        model = Inventario
        fields = [
            'id', 'stock_actual', 'stock_minimo',
            'producto', 'producto_descripcion',
            'insumo', 'insumo_descripcion',
            'sucursal', 'sucursal_nombre'
        ]

    def validate(self, data):
        producto = data.get('producto')
        insumo = data.get('insumo')

        if (producto and insumo) or (not producto and not insumo):
            raise serializers.ValidationError(
                "Debe seleccionar exactamente un producto o un insumo, no ambos ni ninguno."
            ) 
        return data
    
    