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

  const [msg, setMsg] = useState({ type: "", text: "" });

  const clienteId = 1;
  const sesionCajaId = localStorage.getItem("sesionCaja");
  const estadoPendiente = 1;

  useEffect(() => {
    const carritoGuardado = localStorage.getItem("carrito");
    if (carritoGuardado) setCarrito(JSON.parse(carritoGuardado));
  }, []);

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

  const generarVenta = async () => {
    setMsg({ type: "", text: "" });
    try {
      const token = localStorage.getItem("token");

      const productos = JSON.parse(sessionStorage.getItem("productosCache")) || [];
      const promociones = JSON.parse(sessionStorage.getItem("promocionesCache")) || [];

      const detalles = [];
      const promocionesVenta = [];

      carrito.forEach((item) => {
        const nombreItem =
          item.producto?.nombre ||
          item.producto?.descripcion ||
          item.descripcion ||
          "";

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
            precio_unitario: item.producto?.precio ?? productoCoincide.precio,
          });
        } else if (promoCoincide) {
          promocionesVenta.push({
            promocion: promoCoincide.id,
            cantidad: item.cantidad || 1,
          });
        } else {
          console.warn("No se encontró coincidencia para:", nombreItem);
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

      const response = await fetch(`${apiUrl}/api/ventas/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(ventaPayload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error("Error del backend:", error);
        throw new Error("No se pudo crear la venta");
      }

      const data = await response.json();
      setMsg({ type: "success", text: "Venta registrada con éxito ✅" });
      setTimeout(() => navigate(`/MetodoPago/${data.id}`), 300);
    } catch (error) {
      console.error("Error creando venta:", error);
      setMsg({ type: "error", text: "No se pudo crear la venta. Revisa consola para más detalles." });
    }
  };

  const volver = () => window.history.back();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-3 sm:px-6">
          {/* Móvil */}
          <div className="block md:hidden py-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Abrir/Cerrar barra lateral"
              className="w-full h-10 inline-flex items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              ☰
            </button>

            <h2 className="mt-3 text-center text-2xl font-extrabold text-gray-900">
              Carrito
            </h2>
            <span className="mt-1 block text-center text-gray-600 font-medium">
              {hora}
            </span>
          </div>

          {/* Desktop/Tablet */}
          <div className="hidden md:flex items-center justify-between py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Abrir/Cerrar barra lateral"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              ☰
            </button>

            <h2 className="flex-1 px-3 text-center text-3xl font-extrabold text-gray-900">
              Carrito
            </h2>

            <span className="min-w-[120px] text-right text-gray-600 font-medium">
              {hora}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 flex flex-col items-center">
        {/* Mensajes inline */}
        {msg.text && (
          <div
            className={`w-full max-w-6xl mb-4 rounded-lg border px-4 py-3 text-sm ${
              msg.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {msg.text}
          </div>
        )}

        <h2 className="text-xl sm:text-2xl font-bold mb-4">Carrito de Compras</h2>

        {/* Layout */}
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_18rem] gap-4 lg:gap-6">
          {/* Tabla / Lista */}
          <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
            {carrito.length === 0 ? (
              <p className="p-6 text-center text-gray-500">Tu carrito está vacío</p>
            ) : (
              <>
                {/* Tabla (sm y +) */}
                <div className="hidden sm:block overflow-auto">
                  <table className="w-full border-collapse text-left text-base">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-gray-800">Producto</th>
                        <th className="px-6 py-3 text-gray-800">Cantidad</th>
                        <th className="px-6 py-3 text-gray-800">Total</th>
                        <th className="px-6 py-3 text-gray-800">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {carrito.map((item, index) => (
                        <tr
                          key={index}
                          className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
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
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => editarProducto(index)}
                                className="px-3 py-1 rounded bg-gray-800 text-white hover:bg-gray-900"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => eliminarProducto(index)}
                                className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Cards (solo móvil) */}
                <ul className="sm:hidden divide-y divide-gray-200">
                  {carrito.map((item, index) => (
                    <li key={index} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {item.producto?.descripcion ||
                              item.producto?.nombre ||
                              item.promocion?.descripcion ||
                              "-"}
                          </h4>
                          <div className="mt-1 text-sm text-gray-600">
                            <p>Cantidad: {item.cantidad || 0}</p>
                            <p className="font-medium text-gray-800">
                              Total: ${item.total?.toLocaleString() || "0"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => editarProducto(index)}
                          className="px-3 py-2 rounded bg-gray-800 text-white hover:bg-gray-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => eliminarProducto(index)}
                          className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Subtotal / Acciones */}
          <aside className="h-fit bg-white shadow-xl rounded-lg border border-gray-200 p-5">
            <div>
              <h3 className="text-lg font-bold mb-3">Subtotal</h3>
              <p className="text-2xl font-extrabold mb-4">
                ${subtotal.toLocaleString()}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {/* ← Volver aquí */}
              <button
                onClick={volver}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                ← Volver
              </button>

              <button
                onClick={() => navigate("/producto")}
                className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-900"
              >
                Seguir Comprando
              </button>

              <button
                onClick={generarVenta}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                Pagar
              </button>
            </div>
          </aside>
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
