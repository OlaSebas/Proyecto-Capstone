from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework import status, viewsets
from .models import Inventario, Producto, Sucursal, Comuna, Promocion, PromocionProducto,Insumo,Categoria
from .serializers import CategoriaSerializer,InventarioSerializer, ProductoSerializer, SucursalSerializer, ComunaSerializer, PromocionSerializer, PromocionProductoSerializer,InsumoSerializer



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

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def producto_create(request):
    serializer = ProductoSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@authentication_classes([TokenAuthentication]) 
@permission_classes([IsAuthenticated])
def producto_update(request, producto_id):
    try:
        producto = Producto.objects.get(id=producto_id)
    except Producto.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = ProductoSerializer(producto, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def producto_delete(request, producto_id):
    try:
        producto = Producto.objects.get(id=producto_id)
    except Producto.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    producto.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

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

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def promocion_list(request):
    promociones = Promocion.objects.all()
    serializer = PromocionSerializer(promociones, many=True, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def promocion_create(request):
    productos_data = request.data.pop("productos", [])
    serializer = PromocionSerializer(data=request.data)
    if serializer.is_valid():
        promocion = serializer.save()

        # Crear los PromocionProducto asociados
        for prod in productos_data:
            PromocionProducto.objects.create(
                promocion=promocion,
                producto_id=prod["producto"],
                cantidad=prod["cantidad"]
            )

        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def promocion_update(request, promocion_id):
    try:
        promocion = Promocion.objects.get(id=promocion_id)
    except Promocion.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = PromocionSerializer(promocion, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def promocion_delete(request, promocion_id):
    try:
        promocion = Promocion.objects.get(id=promocion_id)
    except Promocion.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    promocion.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def promocion_producto_list(request):
    promocion_productos = PromocionProducto.objects.all()
    serializer = PromocionProductoSerializer(promocion_productos, many=True, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def promocion_producto_create(request):
    serializer = PromocionProductoSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def promocion_producto_update(request, promocion_producto_id):
    try:
        promocion_producto = PromocionProducto.objects.get(id=promocion_producto_id)
    except PromocionProducto.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = PromocionProductoSerializer(promocion_producto, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def promocion_producto_delete(request, promocion_producto_id):
    try:
        promocion_producto = PromocionProducto.objects.get(id=promocion_producto_id)
    except PromocionProducto.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    promocion_producto.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def insumo_list(request):
    insumos = Insumo.objects.all()
    serializer = InsumoSerializer(insumos, many=True, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def insumo_create(request):
    serializer = InsumoSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def insumo_update(request, insumo_id):
    try:
        insumo = Insumo.objects.get(id=insumo_id)
    except Insumo.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = InsumoSerializer(insumo, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def insumo_delete(request, insumo_id):
    try:
        insumo = Insumo.objects.get(id=insumo_id)
    except Insumo.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    insumo.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def categoria_list(request):
    categorias = Categoria.objects.all()
    serializer = CategoriaSerializer(categorias, many=True, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)