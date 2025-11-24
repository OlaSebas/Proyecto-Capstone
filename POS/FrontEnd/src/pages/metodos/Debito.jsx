import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { CreditCard, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";

export default function PagoDebito() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen } =
    useOutletContext?.() ?? { sidebarOpen: false, setSidebarOpen: () => {} };

  const [productos, setProductos] = useState([]);
  const [total, setTotal] = useState(0);
  const [nombreTitular, setNombreTitular] = useState("");
  const [numeroTarjeta, setNumeroTarjeta] = useState("");
  const [fecha, setFecha] = useState("");
  const [nroBoleta, setNroBoleta] = useState("");
  const [pagoExitoso, setPagoExitoso] = useState(false);
  const [error, setError] = useState("");
  const [hora, setHora] = useState("");

  // Reloj header
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setHora(
        now.toLocaleTimeString("es-CL", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // Carga del carrito y boleta
  useEffect(() => {
    const hoy = new Date();
    const fechaStr = hoy.toLocaleString("es-CL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    setFecha(fechaStr);
    setNroBoleta(`B-${Math.floor(100000 + Math.random() * 900000)}`);

    const carritoLocal = JSON.parse(localStorage.getItem("carrito")) || [];
    setProductos(carritoLocal);
    const subtotal = carritoLocal.reduce((sum, item) => sum + (item.total || 0), 0);
    setTotal(subtotal);
  }, []);

  // Restar inventario
  const restarInventario = async (carrito) => {
    try {
      const token = localStorage.getItem("token");

      // Obtener sucursal del usuario
      const resProfile = await fetch(`${apiUrl}api/profile/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!resProfile.ok) throw new Error("No se pudo obtener el perfil del usuario");
      const perfil = await resProfile.json();
      const sucursalId = perfil.caja?.sucursal;
      if (!sucursalId) throw new Error("El usuario no tiene sucursal asignada");

      // Obtener inventario
      const resInventario = await fetch(`${apiUrl}inventario/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!resInventario.ok) throw new Error("No se pudo obtener inventario");
      const inventarios = await resInventario.json();

      for (const item of carrito) {
        const itemsAProcesar = [];
        // Productos normales
        if (item.producto?.item) {
          if (item.producto.eq_pollo !== null) {
            itemsAProcesar.push({
              itemId: item.producto.item,
              cantidad: item.cantidad * item.producto.eq_pollo,
            });
          } else {
            itemsAProcesar.push({
              itemId: item.producto.item,
              cantidad: item.cantidad,
            });
          }
        }

        // Productos dentro de promociones
        if (item.producto && Array.isArray(item.producto.productos)) {
          item.producto.productos.forEach((p) => {
            if (p.item) {
              if (p.eq_pollo !== null) {
                itemsAProcesar.push({
                  itemId: p.item,
                  cantidad: (p.cantidad || 1) * (item.cantidad || 1) * p.eq_pollo,
                });
              } else {
                itemsAProcesar.push({
                  itemId: p.item,
                  cantidad: (p.cantidad || 1) * (item.cantidad || 1),
                });
              }
            }
          });
        }

        // Actualizar stock
        for (const ip of itemsAProcesar) {
          const inv = inventarios.find(
            (inv) => inv.item?.id === ip.itemId && inv.sucursal === sucursalId
          );
          if (!inv) {
            console.warn(`No se encontró inventario para item ${ip.itemId} en sucursal ${sucursalId}`);
            continue;
          }

          const nuevaCantidad = (inv.cantidad_vendida || 0) + ip.cantidad;

          const resUpdate = await fetch(`${apiUrl}inventario/update/${inv.id}/`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
            body: JSON.stringify({ cantidad_vendida: nuevaCantidad }),
          });

          if (!resUpdate.ok) {
            console.error(`❌ Error actualizando inventario ${inv.id}`);
          }
        }
      }
    } catch (err) {
      console.error("❌ Error al restar inventario:", err);
    }
  };

  const procesarPago = async () => {
    if (productos.length === 0) {
      setError("No hay productos para pagar.");
      return;
    }

    if (!nombreTitular.trim() || !numeroTarjeta.trim()) {
      setError("Debe ingresar el nombre y número de tarjeta.");
      return;
    }

    if (numeroTarjeta.length < 12 || numeroTarjeta.length > 19) {
      setError("El número de tarjeta debe tener entre 12 y 19 dígitos.");
      return;
    }

    await restarInventario(productos);

    // Simulación de pago exitoso
    setError("");
    setPagoExitoso(true);
    localStorage.removeItem("carrito");
    localStorage.removeItem("metodoPago");

    setTimeout(() => {
      setPagoExitoso(false);
      navigate("/Ventas");
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-white to-red-200">
      {/* HEADER que abre/cierra el sidebar */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Móvil */}
          <div className="block md:hidden py-3">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Abrir/Cerrar barra lateral"
              className="w-10 h-10 inline-flex items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              ☰
            </button>
            <div className="mt-2 flex items-center justify-center gap-2">
              <CreditCard className="text-red-500" size={22} />
              <h1 className="text-xl font-extrabold text-gray-900">Pago con Débito</h1>
            </div>
            <span className="mt-1 block text-center text-gray-600 font-medium">{hora}</span>
          </div>

          {/* Desktop/Tablet */}
          <div className="hidden md:flex items-center justify-between py-4">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Abrir/Cerrar barra lateral"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              ☰
            </button>

            <div className="flex items-center gap-3">
              <CreditCard className="text-red-500" size={26} />
              <h1 className="text-2xl font-extrabold text-gray-900">Pago con Débito</h1>
            </div>

            <span className="min-w-[120px] text-right text-gray-600 font-medium">{hora}</span>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {/* Grid: izquierda boleta/detalle, derecha acciones */}
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-6">
          {/* IZQUIERDA */}
          <section className="space-y-4">
            {/* Info Boleta */}
            <div className="bg-white/90 rounded-xl shadow border border-gray-200 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-700">
                <div className="flex justify-between sm:block">
                  <span className="font-semibold">N° Boleta:</span>
                  <span className="sm:block sm:mt-1">{nroBoleta}</span>
                </div>
                <div className="flex justify-between sm:block">
                  <span className="font-semibold">Fecha:</span>
                  <span className="sm:block sm:mt-1">{fecha}</span>
                </div>
                <div className="flex justify-between sm:block">
                  <span className="font-semibold">Método:</span>
                  <span className="sm:block sm:mt-1">Débito</span>
                </div>
              </div>
            </div>

            {/* Detalle productos */}
            <div className="bg-white/90 rounded-xl shadow border border-gray-200 overflow-hidden">
              {/* Tabla (sm+) */}
              <div className="hidden sm:block">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b border-gray-300">
                    <tr>
                      <th className="py-2 px-3 text-left text-gray-600">Producto</th>
                      <th className="py-2 px-3 text-center text-gray-600">Cant.</th>
                      <th className="py-2 px-3 text-right text-gray-600">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.length > 0 ? (
                      productos.map((item, i) => (
                        <tr key={i} className="border-b last:border-none text-gray-700">
                          <td className="py-2 px-3 break-words">
                            {item.producto?.nombre || item.producto?.descripcion || "-"}
                          </td>
                          <td className="text-center">{item.cantidad}</td>
                          <td className="text-right">
                            ${item.total?.toLocaleString() || "0"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-3 text-gray-500">
                          Carrito vacío
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Cards (móvil) */}
              <ul className="sm:hidden divide-y divide-gray-200">
                {productos.length > 0 ? (
                  productos.map((item, i) => (
                    <li key={i} className="p-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-800">
                          {item.producto?.nombre || item.producto?.descripcion || "-"}
                        </span>
                        <span className="text-gray-700">
                          ${item.total?.toLocaleString() || "0"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">Cant.: {item.cantidad}</div>
                    </li>
                  ))
                ) : (
                  <li className="p-4 text-center text-gray-500">Carrito vacío</li>
                )}
              </ul>
            </div>

            {/* TOTAL en móvil (debajo) */}
            <div className="md:hidden mt-4 flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
              <span className="font-semibold text-gray-700">Total:</span>
              <span className="text-xl font-bold text-gray-900">
                ${total.toLocaleString()}
              </span>
            </div>
          </section>

          {/* DERECHA: total + inputs + acciones (centrado y sticky) */}
          <section className="md:sticky md:top-6 md:self-start">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-5">
              {/* Total (md+) */}
              <div className="hidden md:flex items-center justify-between mb-4">
                <span className="font-semibold text-gray-700">Total:</span>
                <span className="text-2xl font-extrabold text-gray-900">
                  ${total.toLocaleString()}
                </span>
              </div>

              {/* Error visual */}
              {error && (
                <div className="mb-4 flex items-center justify-center gap-2 bg-red-100 border border-red-400 text-red-800 rounded-lg py-3 px-4 shadow-sm">
                  <AlertTriangle size={20} />
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              {/* Botón pagar */}
              <button
                onClick={procesarPago}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold shadow-md hover:scale-[1.02] hover:shadow-lg transition-transform duration-200"
              >
                <CheckCircle2 size={18} />
                Confirmar Pago
              </button>

              {/* Éxito */}
              {pagoExitoso && (
                <div className="mt-4 flex items-center justify-center gap-2 bg-green-500 text-white font-semibold rounded-lg py-3 px-4 shadow-md">
                  <CheckCircle2 size={22} />
                  <span> Pago realizado con éxito</span>
                </div>
              )}

              {/* Pie */}
              <div className="mt-6 text-center text-gray-600 text-xs">
                Gracias por su compra
                <p className="italic mt-1">¡Vuelva pronto!</p>
              </div>

              {/* Volver (idéntico estilo a los otros) */}
              <button
                onClick={() => navigate("/Carrito")}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200"
              >
                <ArrowLeft size={18} />
                Volver a métodos de pago
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
