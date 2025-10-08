from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.timezone import now
from Inventario.models import Producto, Sucursal, Promocion

# Create your models here.
class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not username:
            raise ValueError('The Username field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(username, email, password, **extra_fields)
    
class Caja(models.Model):
    nombre = models.CharField(max_length=100)
    sucursal = models.ForeignKey(Sucursal, on_delete=models.CASCADE)

    def __str__(self):
        return self.nombre

class customUser(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(max_length=255, unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=now)
    caja = models.ForeignKey(Caja, on_delete=models.SET_NULL, null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name','password']

    def __str__(self):
        return self.username

    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser
    
    class Meta:
        permissions = [
            ("view_user", "Can view user"),
            ("add_user", "Can add user"),
            ("change_user", "Can change user"),
            ("delete_user", "Can delete user"),
        ]

class Cliente(models.Model):
    nombre = models.CharField(max_length=100)
    comision = models.IntegerField(default=0)

    def __str__(self):
        return self.nombre


class MetodoPago(models.Model):
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre

class SesionCaja(models.Model):
    fecha_apertura = models.DateTimeField(auto_now_add=True)
    fecha_cierre = models.DateTimeField(null=True, blank=True)
    caja = models.ForeignKey(Caja, on_delete=models.CASCADE)
    monto_inicial = models.IntegerField(default=0)
    monto_final = models.IntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    
    def __str__(self):
        return f'SesionCaja {self.id} - {self.caja.nombre}'

class TipoEstado(models.Model):
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre

class Venta(models.Model):
    fecha = models.DateTimeField(auto_now_add=True)
    subtotal = models.IntegerField()
    iva = models.IntegerField()
    total = models.IntegerField()
    sesion_caja = models.ForeignKey(SesionCaja, on_delete=models.CASCADE)
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, null=True, blank=True)
    metodo_pago = models.ForeignKey(MetodoPago, on_delete=models.CASCADE)
    usuario = models.ForeignKey(customUser, on_delete=models.CASCADE)
    estado = models.ForeignKey(TipoEstado, on_delete=models.CASCADE,default=3)

    def save(self, *args, **kwargs):
        self.iva = round(self.total * 0.19)
        self.subtotal = self.total - self.iva
        super().save(*args, **kwargs)

    def __str__(self):
        return f'Venta {self.id} - {self.fecha}'

class DetalleVenta(models.Model):
    venta = models.ForeignKey(Venta, on_delete=models.CASCADE)
    producto = models.ForeignKey(Producto, null=True, blank=True, on_delete=models.CASCADE)
    promocion = models.ForeignKey(Promocion, null=True, blank=True, on_delete=models.CASCADE)
    cantidad = models.IntegerField()
    precio_unitario = models.IntegerField()
    total = models.IntegerField()

    def save(self, *args, **kwargs):
        self.total = self.cantidad * self.precio_unitario
        super().save(*args, **kwargs)

    def __str__(self):
        return f'DetalleVenta {self.id} - Venta {self.venta.id}'

