from django.urls import path, include, re_path   
from rest_framework.routers import DefaultRouter
from .views import inventario_list, inventario_sucursal, inventario_create, inventario_update,inventario_delete, producto_list, sucursal_list, sucursal_create, sucursal_delete, sucursal_update, comuna_list,sucursal_info
from. views import producto_create, producto_update, producto_delete, promocion_list, promocion_create, promocion_update, promocion_delete
from .views import promocion_producto_list, promocion_producto_create,promocion_producto_update, promocion_producto_delete
from .views import insumo_list,insumo_create,insumo_update,insumo_delete,categoria_list, item_create, item_list, item_update, item_delete
from .views import historial_inventario_detail, historial_inventario_list

urlpatterns = [
    path("", inventario_list, name="inventario_list"),
    path("<int:sucursal_id>/", inventario_sucursal, name="inventario_sucursal"),
    path("create/", inventario_create, name="inventario_create"),
    path("update/<int:inventario_id>/", inventario_update, name="inventario_update"),
    path("delete/<int:inventario_id>/", inventario_delete, name="inventario_delete"),
    path("productos/", producto_list, name="producto_list"),
    path("productos/create/", producto_create, name="producto_create"),
    path("productos/update/<int:producto_id>/", producto_update, name="producto_update"),
    path("productos/delete/<int:producto_id>/", producto_delete, name="producto_delete"),
    path("sucursales/", sucursal_list, name="sucursal_list"),
    path("sucursales/<int:sucursal_id>/", sucursal_info, name="sucursal_info"),
    path("sucursales/create/", sucursal_create, name="sucursal_create"),
    path("sucursales/update/<int:sucursal_id>/", sucursal_update, name="sucursal_update"),
    path("sucursales/delete/<int:sucursal_id>/", sucursal_delete, name="sucursal_delete"),
    path("comunas/", comuna_list, name="comuna_list"),
    path("promociones/", promocion_list, name="promocion_list"),
    path("promociones/create/", promocion_create, name="promocion_create"),
    path("promociones/update/<int:promocion_id>/", promocion_update, name="promocion_update"),
    path("promociones/delete/<int:promocion_id>/", promocion_delete, name="promocion_delete"),
    path("promociones_productos/", promocion_producto_list, name="promocion_producto_list"),
    path("promociones_productos/create/", promocion_producto_create, name="promocion_producto_create"),
    path("promociones_productos/update/<int:promocion_producto_id>/", promocion_producto_update, name="promocion_producto_update"),
    path("promociones_productos/delete/<int:promocion_producto_id>/", promocion_producto_delete, name="promocion_producto_delete"),
    path("insumos/", insumo_list, name="insumo_list"),
    path("insumos/create/", insumo_create, name="insumo_create"),
    path("insumos/update/<int:insumo_id>/", insumo_update, name="insumo_update"),
    path("insumos/delete/<int:insumo_id>/", insumo_delete, name="insumo_delete"),
    path("categorias/", categoria_list, name="categoria_list"),
    path("items/", item_list, name="item_list"),
    path("items/create/", item_create, name="item_create"),
    path("items/update/<int:item_id>/", item_update, name="item_update"),
    path("items/delete/<int:item_id>/", item_delete, name="item_delete"),
    path("historial_inventario/", historial_inventario_list, name="historial_inventario_list"),
    path("historial_inventario/<int:inventario_id>/", historial_inventario_detail, name="historial_inventario_detail"),
]