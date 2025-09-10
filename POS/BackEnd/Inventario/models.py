from django.db import models
#from ..venta.models import customUser
# Create your models here.
class Region(models.Model):
    descripcion = models.CharField(max_length=50, null=False)
    
    def __str__(self):
        return self.descripcion
    
class Ciudad(models.Model):
    descripcion = models.CharField(max_length=50, null=False)
    Region = models.ForeignKey(Region, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.descripcion
    
class Comuna(models.Model):
    descripcion = models.CharField(max_length=50, null=False)
    Ciudad = models.ForeignKey(Ciudad, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.descripcion

class Sucursal(models.Model):
    descripcion = models.CharField(max_length=50, null=False)
    direccion = models.CharField(max_length=100, null=False)
    comuna = models.ForeignKey(Comuna, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.descripcion

class Producto(models.Model):
    descripcion = models.CharField(max_length=100, null=False)
    precio = models.IntegerField(null=False)
    imagen = models.ImageField(upload_to="products/", null=True, blank=True)

    def __str__(self):
        return self.descripcion

class Insumo(models.Model):
    descripcion = models.CharField(max_length=100, null=False)
    
    def __str__(self):
        return self.descripcion

class Inventario(models.Model):
    stock_actual = models.IntegerField(null=False)
    stock_minimo = models.IntegerField(null=False)
    producto = models.ForeignKey('Producto', null=True, blank=True, on_delete=models.CASCADE)
    insumo = models.ForeignKey('Insumo', null=True, blank=True, on_delete=models.CASCADE)
    sucursal = models.ForeignKey('Sucursal', on_delete=models.CASCADE)

    def __str__(self):
        if self.producto:
            return f"Producto {self.producto.descripcion} - Stock: {self.stock_actual}"
        elif self.insumo:
            return f"Insumo {self.insumo.descripcion} - Stock: {self.stock_actual}"
        return f"Sin referencia - Stock: {self.stock_actual}"