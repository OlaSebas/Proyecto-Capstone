from rest_framework import serializers
from .models import Region, Ciudad, Comuna, Sucursal, Insumo,Categoria, Producto, Inventario,Promocion, PromocionProducto
from django.conf import settings


class ProductoSerializer(serializers.ModelSerializer):
    imagen = serializers.SerializerMethodField()

    class Meta:
        model = Producto
        fields = "__all__"

    def get_imagen(self, obj):
        if obj.imagen:
            # Usamos el dominio definido en settings
            return f"{settings.SITE_DOMAIN}{obj.imagen.url}"
        return None
    
class InsumoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Insumo
        fields = "__all__"

class InventarioSerializer(serializers.ModelSerializer):
    producto = ProductoSerializer(read_only=True)
    insumo = InsumoSerializer(read_only=True)
    producto_descripcion = serializers.CharField(source='producto.descripcion', read_only=True)
    insumo_descripcion = serializers.CharField(source='insumo.descripcion', read_only=True)
    sucursal_nombre = serializers.CharField(source='sucursal.descripcion', read_only=True)
    
    class Meta:
        model = Inventario
        fields = [
            'id', 'stock_actual',
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
    
class SucursalSerializer(serializers.ModelSerializer):


    Comuna = serializers.CharField(source='comuna.descripcion', read_only=True)

    class Meta:
        model = Sucursal
        fields = "__all__"

class ComunaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comuna
        fields = "__all__"

class PromocionProductoSerializer(serializers.ModelSerializer):
    # Mostrar la descripción del producto en lugar de solo su ID
    producto_descripcion = serializers.CharField(source="producto.descripcion", read_only=True)

    class Meta:
        model = PromocionProducto
        fields = ["id",'promocion', "producto", "producto_descripcion", "cantidad"]


class PromocionSerializer(serializers.ModelSerializer):
    # Usamos el related_name="productos" para incluir los productos de la promoción
    productos = PromocionProductoSerializer(many=True, read_only=True)

    class Meta:
        model = Promocion
        fields = ["id", "descripcion", "precio", "imagen", "fecha_inicio", "fecha_fin", "productos"]

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = "__all__"