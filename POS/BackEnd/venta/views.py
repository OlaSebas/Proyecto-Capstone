from django.shortcuts import render
from .serializers import customUserSerializer, CajaSerializer, SesionCajaSerializer, VentaSerializer, ClienteSerializer, DetalleVentaSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import customUser, SesionCaja, Caja, Venta, Cliente, DetalleVenta, SesionCaja, Producto, Promocion
from rest_framework.authtoken.models import Token
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.decorators import permission_classes, authentication_classes, api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from django.views import View
from django.http import JsonResponse

@api_view(['POST'])
def login(request):
    user = get_object_or_404(customUser, username=request.data.get('username'))
    if not user.check_password(request.data['password']):
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)
    
    token, created = Token.objects.get_or_create(user=user)
    serializer = customUserSerializer(instance=user)
    return Response({"token": token.key, "User": serializer.data}, status=status.HTTP_200_OK)

"""@api_view(['POST'])
def register(request):
    serializer = customUserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        user = customUser.objects.get(username=serializer.data['username'])
        user.set_password(serializer.data['password'])
        user.save()
        token = Token.objects.create(user=user)
        return Response({'token': token.key, "User": serializer.data,}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)"""

@api_view(['POST'])
def register(request):
    username = request.data.get("username")
    email = request.data.get("email")

    # Responder con estado 409 y mensaje claro si ya existe username o email
    if username and customUser.objects.filter(username=username).exists():
        return Response(
            {"message": "El nombre de usuario ya existe."},
            status=status.HTTP_409_CONFLICT,
        )
    if email and customUser.objects.filter(email=email).exists():
        return Response(
            {"message": "El correo ya existe."},
            status=status.HTTP_409_CONFLICT,
        )

    serializer = customUserSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()  # YA crea el usuario con password encriptado
        token = Token.objects.create(user=user)

        return Response(
            {"token": token.key, "User": customUserSerializer(user).data},
            status=status.HTTP_201_CREATED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def logout(request):
    # Elimina el token actual → invalida sesión
    request.user.auth_token.delete()
    Token.objects.filter(user=request.user).delete()
    return Response({"message": "Sesión cerrada correctamente"}, status=status.HTTP_200_OK)

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
# Vistas para creacion, edicion de sesiones de caja y cajas
@api_view(['GET', 'POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def sesiones_list(request):
    if request.method == 'GET':
        sesiones = SesionCaja.objects.all()
        serializer = SesionCajaSerializer(sesiones, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        serializer = SesionCajaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
            if request.user.is_superuser:
                # Superuser ve TODOS los usuarios (incluyendo otros superusers)
                users = customUser.objects.all()
            elif request.user.is_staff:
                # Admin solo ve usuarios normales
                users = customUser.objects.filter(is_staff=False, is_superuser=False)
            else:
                # Usuario normal no puede acceder
                return Response(
                    {"error": "No tienes permiso para acceder a esta lista."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = customUserSerializer(users, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except customUser.DoesNotExist:
            return Response({"error": "No se encontró."}, status=status.HTTP_404_NOT_FOUND)
    
    elif request.method == 'PUT':
        try:
            user = get_object_or_404(customUser, pk=request.data.get('id'))
            
            # Verificar permisos para editar
            if request.user.is_superuser:
                # Superuser puede editar a TODOS (sin restricciones)
                pass
            elif request.user.is_staff:
                # Admin solo puede editar usuarios normales
                if user.is_staff or user.is_superuser:
                    return Response(
                        {"error": "No tienes permiso para editar a este usuario."},
                        status=status.HTTP_403_FORBIDDEN
                    )
            else:
                # Usuario normal no puede editar
                return Response(
                    {"error": "No tienes permiso para editar usuarios."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = customUserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except customUser.DoesNotExist:
            return Response({"error": "No se encontró."}, status=status.HTTP_404_NOT_FOUND)
    
    elif request.method == 'DELETE':
        try:
            user = get_object_or_404(customUser, pk=request.data.get('id'))
            
            # Verificar permisos para eliminar
            if request.user.is_superuser:
                # Superuser puede eliminar a TODOS (sin restricciones)
                pass
            elif request.user.is_staff:
                # Admin solo puede eliminar usuarios normales
                if user.is_staff or user.is_superuser:
                    return Response(
                        {"error": "No tienes permiso para eliminar a este usuario."},
                        status=status.HTTP_403_FORBIDDEN
                    )
            else:
                # Usuario normal no puede eliminar
                return Response(
                    {"error": "No tienes permiso para eliminar usuarios."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except customUser.DoesNotExist:
            return Response({"error": "No se encontró."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def ventas_list(request):
    try:
        ventas = Venta.objects.all().order_by('-fecha')
        serializer = VentaSerializer(ventas, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST','PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def venta(request):
    if request.method == 'POST':
        try:
            print("📦 Datos recibidos:", request.data)
            # 1️⃣ Crear la venta principal
            serializer = VentaSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            venta = serializer.save(usuario=request.user)

            # 2️⃣ Crear detalles normales
            # Detalles normales
            for item in request.data.get('detalles', []):
                detalle_data = {
                    "venta": venta.id,
                    "producto": item["producto"],
                    "cantidad": item["cantidad"],
                    "precio_unitario": item["precio_unitario"],
                }
                detalle_serializer = DetalleVentaSerializer(data=detalle_data)
                if detalle_serializer.is_valid():
                    detalle_serializer.save()
                else:
                    return Response({"error_detalle": detalle_serializer.errors}, status=400)
            
            # Detalles de promociones
            for promo_item in request.data.get('promociones', []):
                promocion_obj = Promocion.objects.get(pk=promo_item['promocion'])
                detalle_data = {
                    "venta": venta.id,
                    "promocion": promocion_obj.id,
                    "cantidad": promo_item.get("cantidad", 1),
                    "precio_unitario": promocion_obj.precio,
                }
                detalle_serializer = DetalleVentaSerializer(data=detalle_data)
                if detalle_serializer.is_valid():
                    detalle_serializer.save()
                else:
                    return Response({"error_detalle_promocion": detalle_serializer.errors}, status=400)
            # 4️⃣ Retornar venta con todos los detalles
            return Response(VentaSerializer(venta).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    if request.method == 'PUT':
        try:
            venta = get_object_or_404(Venta, pk=request.data.get('id'))
            serializer = VentaSerializer(venta, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
