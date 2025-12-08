from rest_framework import serializers
from .models import Region, Ciudad, Comuna, Sucursal, Insumo,Categoria, Producto, Inventario,Promocion, PromocionProducto, Item, HistorialInventario
from django.conf import settings


class ProductoSerializer(serializers.ModelSerializer):

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

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = "__all__"

class InventarioSerializer(serializers.ModelSerializer):
    # Para escribir: usamos los IDs (FK normales)
    item = serializers.PrimaryKeyRelatedField(
        queryset=Item.objects.all(),
        required=False,
        allow_null=True
    )
    insumo = serializers.PrimaryKeyRelatedField(
        queryset=Insumo.objects.all(),
        required=False,
        allow_null=True
    )

    # Para leer: mostramos descripciones
    item_descripcion = serializers.CharField(source='item.descripcion', read_only=True)
    insumo_descripcion = serializers.CharField(source='insumo.descripcion', read_only=True)
    sucursal_nombre = serializers.CharField(source='sucursal.descripcion', read_only=True)

    class Meta:
        model = Inventario
        fields = [
            'id', 'stock_actual',
            'item', 'item_descripcion',
            'insumo', 'insumo_descripcion',
            'sucursal', 'sucursal_nombre'
        ]

    def validate(self, data):
        item = data.get('item')
        insumo = data.get('insumo')

        # Exactamente uno de los dos
        if (item and insumo) or (not item and not insumo):
            raise serializers.ValidationError(
                "Debe seleccionar exactamente un item o un insumo, no ambos ni ninguno."
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
    item = serializers.IntegerField(source="producto.item.id", read_only=True)
    eq_pollo = serializers.DecimalField(source="producto.eq_pollo", max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = PromocionProducto
        fields = ["id",'promocion', "producto", "producto_descripcion", "cantidad", "item", "eq_pollo"]


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

class HistorialInventarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistorialInventario
        fields = "__all__"
