from django.contrib import admin
from .models import Producto, Insumo, Sucursal, Region, Ciudad, Comuna, Inventario, Promocion, PromocionProducto, Categoria,Item
from django import forms

class InventarioForm(forms.ModelForm):
    class Meta:
        model = Inventario
        fields = '__all__'

    def clean(self):
        cleaned_data = super().clean()
        item = cleaned_data.get("item")
        insumo = cleaned_data.get("insumo")

        if (item and insumo) or (not item and not insumo):
            raise forms.ValidationError(
                "Debe seleccionar exactamente un item o un insumo, no ambos ni ninguno."
            )
        return cleaned_data

class InventarioAdmin(admin.ModelAdmin):
    form = InventarioForm
    list_display = ('nombre_item', 'sucursal_nombre')

    @admin.display(description='Item')
    def nombre_item(self, obj):
        # Si es item muestra su nombre, si es insumo muestra su nombre
        if obj.item:
            return obj.item.descripcion
        elif obj.insumo:
            return obj.insumo.descripcion
        return '-'

    
    def sucursal_nombre(self, obj):
        return obj.sucursal.descripcion
    sucursal_nombre.short_description = 'Sucursal'

admin.site.register(Region)
admin.site.register(Ciudad)
admin.site.register(Comuna)
admin.site.register(Sucursal)
admin.site.register(Insumo)
admin.site.register(Categoria)
admin.site.register(Item)
admin.site.register(Producto)
admin.site.register(Inventario, InventarioAdmin)
admin.site.register(Promocion)
admin.site.register(PromocionProducto)


