from django.shortcuts import render
from .serializers import customUserSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import customUser
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

@api_view(['POST'])
def register(request):
    serializer = customUserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        user = customUser.objects.get(username=serializer.data['username'])
        user.set_password(serializer.data['password'])
        user.save()

        token = Token.objects.create(user=user)
        return Response({'token': token.key, "User": serializer.data,}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def profile(request):
    serializer = customUserSerializer(instance=request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)
    #return Response("you are authenticated with {}".format(request.user.username), status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def logout(request):
    # Elimina el token actual → invalida sesión
    request.user.auth_token.delete()
    return Response({"message": "Sesión cerrada correctamente"}, status=status.HTTP_200_OK)

class VentasView(View):
    def get(self, request):
        data = {
            "acciones": [
                {"id": 1, "nombre": "Pedido nuevo", "icono": "plus"},
                {"id": 2, "nombre": "Pedido delivery", "icono": "list"},
                {"id": 3, "nombre": "Cerrar caja", "icono": "clock"}
            ]
        }
        return JsonResponse(data)