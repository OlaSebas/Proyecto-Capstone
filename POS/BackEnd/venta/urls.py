from django.urls import path, include, re_path   
from .views import login, register, profile, logout,sesiones_detail, sesiones_list, cargarSesionActiva
from rest_framework.documentation import include_docs_urls
from rest_framework import permissions

urlpatterns = [
    re_path('login/', login, name='login'),
    re_path('register/', register, name='register'),
    re_path('profile/', profile, name='profile'),
    re_path('logout/', logout, name='logout'),
    path('docs/', include_docs_urls(title='API Documentation')),
    path('sesion_caja/', sesiones_list, name='sesion_caja'),
    path('sesion_caja/<int:pk>/', sesiones_detail, name='sesion_caja'),
    path('sesion_activa/', cargarSesionActiva, name='cargar_caja'),
]