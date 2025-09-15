from django.urls import path, include, re_path   
from rest_framework.routers import DefaultRouter
from .views import inventario_list, inventario_sucursal, inventario_create, inventario_update,inventario_delete, producto_list, sucursal_list, sucursal_create, sucursal_delete, sucursal_update, comuna_list,sucursal_info

urlpatterns = [
    path("", inventario_list, name="inventario_list"),
    path("<int:sucursal_id>/", inventario_sucursal, name="inventario_sucursal"),
    path("create/", inventario_create, name="inventario_create"),
    path("update/<int:inventario_id>/", inventario_update, name="inventario_update"),
    path("delete/<int:inventario_id>/", inventario_delete, name="inventario_delete"),
    path("productos/", producto_list, name="producto_list"),
    path("sucursales/", sucursal_list, name="sucursal_list"),
    path("sucursales/<int:sucursal_id>/", sucursal_info, name="sucursal_info"),
    path("sucursales/create/", sucursal_create, name="sucursal_create"),
    path("sucursales/update/<int:sucursal_id>/", sucursal_update, name="sucursal_update"),
    path("sucursales/delete/<int:sucursal_id>/", sucursal_delete, name="sucursal_delete"),
    path("comunas/", comuna_list, name="comuna_list"),
]
