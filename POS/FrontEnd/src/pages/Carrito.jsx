import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import PreCarrito from "../components/PreCarrito";

export default function Carrito() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [carrito, setCarrito] = useState([]);
  const [hora, setHora] = useState("");
  const [productoEditar, setProductoEditar] = useState(null);
  const { sidebarOpen, setSidebarOpen } = useOutletContext();
  const navigate = useNavigate();

  // Datos base
  const clienteId = 1;
  const sesionCajaId = localStorage.getItem("sesionCaja");
  const estadoPendiente = 1;

  // Cargar carrito
  useEffect(() => {
    const carritoGuardado = localStorage.getItem("carrito");
    if (carritoGuardado) setCarrito(JSON.parse(carritoGuardado));
  }, []);

  // Reloj en vivo
  useEffect(() => {
    const actualizarHora = () => {
      const now = new Date();
      setHora(
        now.toLocaleTimeString("es-CL", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    actualizarHora();
    const intervalo = setInterval(actualizarHora, 1000);
    return () => clearInterval(intervalo);
  }, []);

  const guardarCarrito = (nuevoCarrito) => {
    setCarrito(nuevoCarrito);
    localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
  };

  const eliminarProducto = (index) => {
    const nuevoCarrito = carrito.filter((_, i) => i !== index);
    guardarCarrito(nuevoCarrito);
  };

  const editarProducto = (index) => {
    setProductoEditar({ ...carrito[index], index });
  };

  const guardarEdicion = (pedidoEditado) => {
    const nuevoCarrito = [...carrito];
    nuevoCarrito[pedidoEditado.index] = { ...pedidoEditado };
    guardarCarrito(nuevoCarrito);
    setProductoEditar(null);
  };

  const subtotal = carrito.reduce((sum, item) => sum + (item.total || 0), 0);

  // 🔹 Generar venta verificando si son productos o promociones
  const generarVenta = async () => {
    try {
      const token = localStorage.getItem("token");

      const productos = await JSON.parse(sessionStorage.getItem("productosCache"));
      const promociones = await JSON.parse(sessionStorage.getItem("promocionesCache"));

      const detalles = [];
      const promocionesVenta = [];

      carrito.forEach((item) => {
        const nombreItem =
          item.producto?.nombre ||
          item.producto?.descripcion ||
          item.descripcion ||
          "";

        // Buscar coincidencias tanto por id como por nombre
        const productoCoincide = productos.find(
          (p) => p.id === item.producto?.id || p.descripcion === nombreItem
        );
        const promoCoincide = promociones.find(
          (p) => p.id === item.producto?.id || p.descripcion === nombreItem
        );

        if (productoCoincide) {
          detalles.push({
            producto: productoCoincide.id,
            cantidad: item.cantidad,
            precio_unitario: item.producto.precio || productoCoincide.precio,
          });
        } else if (promoCoincide) {
          promocionesVenta.push({
            promocion: promoCoincide.id,
            cantidad: item.cantidad || 1,
          });
        } else {
          console.warn("⚠️ No se encontró coincidencia para:", nombreItem);
        }
      });

      const ventaPayload = {
        total: subtotal,
        sesion_caja: sesionCajaId,
        cliente: clienteId,
        metodo_pago: null,
        estado: estadoPendiente,
        detalles,
        promociones: promocionesVenta,
      };

      console.log("🧾 JSON generado:", ventaPayload);

      const response = await fetch(`${apiUrl}/api/ventas/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(ventaPayload),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("❌ Error del backend:", error);
        throw new Error("Error al crear la venta.");
      }

      const data = await response.json();
      console.log("✅ Venta creada:", data);
      alert("Venta registrada con éxito ✅");
      navigate(`/MetodoPago/${data.id}`);
    } catch (error) {
      console.error("❌ Error creando venta:", error);
      alert("No se pudo crear la venta. Ver consola para más detalles.");
    }
  };

  const volver = () => window.history.back();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="flex justify-between items-center bg-white shadow px-6 py-4 relative">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ☰
        </button>

        <h2 className="text-3xl font-bold text-gray-800 flex-1 text-center">
          Carrito
        </h2>

        <div className="flex items-center gap-4 relative">
          <span className="text-gray-600 font-medium">{hora}</span>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 p-6 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4">Carrito de Compras</h2>

        <div className="w-full max-w-6xl flex gap-6">
          {/* Tabla */}
          <div className="flex-1 bg-white shadow-xl rounded-lg overflow-auto border border-gray-200">
            {carrito.length === 0 ? (
              <p className="p-6 text-center text-gray-500">
                Tu carrito está vacío
              </p>
            ) : (
              <table className="w-full border-collapse text-left text-lg">
                <thead className="bg-gray-300">
                  <tr>
                    <th className="px-6 py-4 text-gray-800">Producto</th>
                    <th className="px-6 py-4 text-gray-800">Cantidad</th>
                    <th className="px-6 py-4 text-gray-800">Total</th>
                    <th className="px-6 py-4 text-gray-800">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.map((item, index) => (
                    <tr
                      key={index}
                      className={
                        index % 2 === 0 ? "bg-white/90" : "bg-gray-100/90"
                      }
                    >
                      <td className="px-6 py-4">
                        {item.producto?.descripcion ||
                          item.producto?.nombre ||
                          item.promocion?.descripcion ||
                          "-"}
                      </td>
                      <td className="px-6 py-4">{item.cantidad || 0}</td>
                      <td className="px-6 py-4">
                        ${item.total?.toLocaleString() || "0"}
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          onClick={() => editarProducto(index)}
                          className="px-2 py-1 bg-gray-800 text-white rounded hover:bg-gray-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => eliminarProducto(index)}
                          className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Subtotal */}
          <div className="w-72 h-[300px] bg-white shadow-xl rounded-lg border border-gray-200 flex flex-col justify-between p-6">
            <div>
              <h3 className="text-xl font-bold mb-4">Subtotal</h3>
              <p className="text-2xl font-semibold mb-6">
                ${subtotal.toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate("/producto")}
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
              >
                Seguir Comprando
              </button>
              <button
                onClick={generarVenta}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Pagar
              </button>
            </div>
          </div>
        </div>

        {/* Botón Volver */}
        <div className="mt-6 self-start">
          <button
            onClick={volver}
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Volver
          </button>
        </div>
      </main>

      {/* Modal PreCarrito */}
      {productoEditar && (
        <PreCarrito
          producto={productoEditar.producto}
          cantidadInicial={productoEditar.cantidad}
          onClose={() => setProductoEditar(null)}
          onAddToCart={(pedido) =>
            guardarEdicion({ ...pedido, index: productoEditar.index })
          }
        />
      )}
    </div>
  );
}
