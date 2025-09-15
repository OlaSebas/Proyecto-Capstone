from django.contrib import admin
from .models import Producto, Insumo, Sucursal, Region, Ciudad, Comuna, Inventario
from django import forms

class InventarioForm(forms.ModelForm):
    class Meta:
        model = Inventario
        fields = '__all__'

    def clean(self):
        cleaned_data = super().clean()
        producto = cleaned_data.get("producto")
        insumo = cleaned_data.get("insumo")

        if (producto and insumo) or (not producto and not insumo):
            raise forms.ValidationError(
                "Debe seleccionar exactamente un producto o un insumo, no ambos ni ninguno."
            )
        return cleaned_data

class InventarioAdmin(admin.ModelAdmin):
    form = InventarioForm
    list_display = ('stock_actual', 'stock_minimo', 'producto_nombre', 'insumo_nombre', 'sucursal_nombre')

    def producto_nombre(self, obj):
        return obj.producto.descripcion if obj.producto else '-'
    producto_nombre.short_description = 'Producto'

    def insumo_nombre(self, obj):
        return obj.insumo.descripcion if obj.insumo else '-'
    insumo_nombre.short_description = 'Insumo'

    def sucursal_nombre(self, obj):
        return obj.sucursal.descripcion
    sucursal_nombre.short_description = 'Sucursal'

admin.site.register(Region)
admin.site.register(Ciudad)
admin.site.register(Comuna)
admin.site.register(Sucursal)
admin.site.register(Insumo)
admin.site.register(Producto)
admin.site.register(Inventario, InventarioAdmin)

