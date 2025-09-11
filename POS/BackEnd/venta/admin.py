from django.contrib import admin
from .models import customUser, Cliente, Venta, DetalleVenta, SesionCaja, Caja, MetodoPago, TipoEstado
# Register your models here.
admin.site.register(customUser)
admin.site.register(Cliente)
admin.site.register(Venta)
admin.site.register(DetalleVenta)
admin.site.register(SesionCaja)
admin.site.register(Caja)
admin.site.register(MetodoPago)
admin.site.register(TipoEstado)