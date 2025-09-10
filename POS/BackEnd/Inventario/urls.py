from django.urls import path, include, re_path   
from rest_framework.routers import DefaultRouter
from .views import inventario_list, inventario_sucursal, inventario_create, inventario_update,inventario_delete

urlpatterns = [
    path("", inventario_list, name="inventario_list"),
    path("<int:sucursal_id>/", inventario_sucursal, name="inventario_sucursal"),
    path("create/", inventario_create, name="inventario_create"),
    path("update/<int:inventario_id>/", inventario_update, name="inventario_update"),
    path("delete/<int:inventario_id>/", inventario_delete, name="inventario_delete"),
]