from django.urls import path, include, re_path   
from .views import login, register, profile, logout, VentasView
from rest_framework.documentation import include_docs_urls
from rest_framework import permissions

urlpatterns = [
    re_path('login/', login, name='login'),
    re_path('register/', register, name='register'),
    re_path('profile/', profile, name='profile'),
    re_path('logout/', logout, name='logout'),
    path('docs/', include_docs_urls(title='API Documentation')),
    path('ventas/', VentasView.as_view(), name="ventas"),
]