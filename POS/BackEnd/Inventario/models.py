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

class Categoria(models.Model):
    descripcion = models.CharField(max_length=50, null=False)

    def __str__(self):
        return self.descripcion

class Producto(models.Model):
    descripcion = models.CharField(max_length=100, null=False)
    precio = models.IntegerField(null=False)
    imagen = models.ImageField(upload_to="products/", null=True, blank=True)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, null=True, blank=True)
    stock_minimo = models.IntegerField(null=False, default=0)
    unidad_medida = models.CharField(max_length=20, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.descripcion
    

class Insumo(models.Model):
    descripcion = models.CharField(max_length=100, null=False)
    stock_minimo = models.IntegerField(null=False, default=0)
    unidad_medida = models.CharField(max_length=20, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.descripcion

class Inventario(models.Model):
    stock_actual = models.IntegerField(null=False)
    producto = models.ForeignKey('Producto', null=True, blank=True, on_delete=models.CASCADE)
    insumo = models.ForeignKey('Insumo', null=True, blank=True, on_delete=models.CASCADE)
    sucursal = models.ForeignKey('Sucursal', on_delete=models.CASCADE)

    def __str__(self):
        if self.producto:
            return f"Producto {self.producto.descripcion}"
        elif self.insumo:
            return f"Insumo {self.insumo.descripcion}"
        return f"Sin referencia"

class Promocion(models.Model):
    descripcion = models.CharField(max_length=100, null=False)
    precio = models.IntegerField(null=False)
    imagen = models.ImageField(upload_to="products/", null=True, blank=True)
    fecha_inicio = models.DateField(null=False)
    fecha_fin = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.descripcion

class PromocionProducto(models.Model):
    promocion = models.ForeignKey(Promocion, on_delete=models.CASCADE, related_name="productos")
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.IntegerField(null=False)

    def __str__(self):
        return f"{self.promocion.descripcion} - {self.producto.descripcion} (x{self.cantidad})"