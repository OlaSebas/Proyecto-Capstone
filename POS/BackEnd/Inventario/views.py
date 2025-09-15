from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework import status, viewsets
from .models import Inventario, Producto, Sucursal, Comuna
from .serializers import InventarioSerializer, ProductoSerializer, SucursalSerializer, ComunaSerializer



@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def inventario_list(request):
    inventario = Inventario.objects.all()
    serializer = InventarioSerializer(inventario, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def inventario_sucursal(request, sucursal_id):
    inventario = Inventario.objects.filter(sucursal_id=sucursal_id)
    if not inventario.exists():
        return Response(status=status.HTTP_404_NOT_FOUND)
    serializer = InventarioSerializer(inventario, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def inventario_create(request):
    serializer = InventarioSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def inventario_update(request, inventario_id):
    try:
        inventario = Inventario.objects.get(id=inventario_id)
    except Inventario.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = InventarioSerializer(inventario, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def inventario_delete(request, inventario_id):
    try:
        inventario = Inventario.objects.get(id=inventario_id)
    except Inventario.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    inventario.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

#PRODUCTOS VIEWS
class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    def get_serializer_context(self):
        return {"request": self.request}
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def producto_list(request):
    productos = Producto.objects.all()
    serializer = ProductoSerializer(productos, many=True, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def sucursal_list(request):
    sucursal = Sucursal.objects.all()
    serializer = SucursalSerializer(sucursal, many=True, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def sucursal_info(request, sucursal_id):
    try:
        sucursal = Sucursal.objects.get(id=sucursal_id)
    except Sucursal.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = SucursalSerializer(sucursal, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def sucursal_create(request):
    serializer = SucursalSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def sucursal_update(request, sucursal_id):
    try:
        sucursal = Sucursal.objects.get(id=sucursal_id)
    except Sucursal.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = SucursalSerializer(sucursal, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def sucursal_delete(request, sucursal_id):
    try:
        sucursal = Sucursal.objects.get(id=sucursal_id)
    except Sucursal.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    sucursal.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def comuna_list(request):
    comunas = Comuna.objects.all()
    serializer = ComunaSerializer(comunas, many=True, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)