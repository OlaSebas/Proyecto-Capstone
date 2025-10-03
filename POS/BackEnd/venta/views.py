from django.shortcuts import render
from .serializers import customUserSerializer, CajaSerializer, SesionCajaSerializer, VentaSerializer, ClienteSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import customUser, SesionCaja, Caja, Venta, Cliente, DetalleVenta, SesionCaja
from rest_framework.authtoken.models import Token
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.decorators import permission_classes, authentication_classes, api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from django.views import View
from django.http import JsonResponse
from django.utils import timezone

@api_view(['POST'])
def login(request):
    user = get_object_or_404(customUser, username=request.data.get('username'))
    if not user.check_password(request.data['password']):
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)
    
    token, created = Token.objects.get_or_create(user=user)
    serializer = customUserSerializer(instance=user)
    return Response({"token": token.key, "User": serializer.data}, status=status.HTTP_200_OK)

@api_view(['POST'])
def register(request):
    serializer = customUserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        user = customUser.objects.get(username=serializer.data['username'])
        user.save()
        token = Token.objects.create(user=user)
        return Response({'token': token.key, "User": serializer.data,}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def logout(request):
    # Elimina el token actual → invalida sesión
    request.user.auth_token.delete()
    Token.objects.filter(user=request.user).delete()
    return Response({"message": "Sesión cerrada correctamente"}, status=status.HTTP_200_OK)

# Vistas para creacion, edicion de sesiones de caja y cajas
@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def sesiones_list(request):
    if request.method == 'GET':
        sesiones = SesionCaja.objects.all()
        serializer = SesionCajaSerializer(sesiones, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def sesiones_create(request):
    caja_id = request.data.get("caja")
    monto_inicial = request.data.get("monto_inicial", 0)

    try:
        caja = Caja.objects.get(id=caja_id)
    except Caja.DoesNotExist:
        return Response({"error": "Caja no encontrada"}, status=status.HTTP_404_NOT_FOUND)

    sesion = SesionCaja.objects.create(
        caja=caja,
        monto_inicial=monto_inicial,
        is_active=True
    )

    serializer = SesionCajaSerializer(sesion)
    return Response(serializer.data, status=status.HTTP_201_CREATED)



@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def sesiones_detail(request, pk):
    sesion = get_object_or_404(SesionCaja, pk=pk)

    if request.method == 'GET':
        serializer = SesionCajaSerializer(sesion)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = SesionCajaSerializer(sesion, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        sesion.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def cargarSesionActiva(request):
    try:
        active_sesion = SesionCaja.objects.filter(is_active=True).exists()
        return Response({"sesion_activa": active_sesion}, status=status.HTTP_200_OK)
    except SesionCaja.DoesNotExist:
        return Response({"error": "No se encontró."}, status=status.HTTP_404_NOT_FOUND)

#CRUD USERS 
@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def profile(request):
    serializer = customUserSerializer(instance=request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def users(request):
    if request.method == 'GET':
        try:
            users = customUser.objects.filter(is_staff=False)
            serializer = customUserSerializer(users, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except customUser.DoesNotExist:
            return Response({"error": "No se encontró."}, status=status.HTTP_404_NOT_FOUND)
    elif request.method == 'PUT':
        try:
            user = get_object_or_404(customUser, pk=request.data.get('id'))
            serializer = customUserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.set_password
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except customUser.DoesNotExist:
            return Response({"error": "No se encontró."}, status=status.HTTP_404_NOT_FOUND)
    elif request.method == 'DELETE':
        try:
            user = get_object_or_404(customUser, pk=request.data.get('id'))
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except customUser.DoesNotExist:
            return Response({"error": "No se encontró."}, status=status.HTTP_404_NOT_FOUND)
