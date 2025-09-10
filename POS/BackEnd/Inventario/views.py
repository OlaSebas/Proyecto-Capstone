from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework import status
from .models import Inventario
from .serializers import InventarioSerializer

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def inventario_list(request):
    inventario = Inventario.objects.select_related('producto', 'insumo', 'sucursal')
    serializer = InventarioSerializer(inventario, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
