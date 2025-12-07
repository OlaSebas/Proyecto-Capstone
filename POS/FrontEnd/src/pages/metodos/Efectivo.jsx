import { useState, useEffect } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import { Wallet, Calculator, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";

export default function PagoEfectivo() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { id } = useParams();
  const navigate = useNavigate();

  // Soporte si no hay OutletContext
  const outlet = (typeof useOutletContext === "function" ? useOutletContext() : null) || {};
  const sidebarOpen = outlet.sidebarOpen ?? false;
  const setSidebarOpen = outlet.setSidebarOpen ?? (() => {});

  const [productos, setProductos] = useState([]);
  const [total, setTotal] = useState(0);
  const [montoPagado, setMontoPagado] = useState("");
  const [vuelto, setVuelto] = useState(null);
  const [nroBoleta, setNroBoleta] = useState("");
  const [fecha, setFecha] = useState("");
  const [pagoExitoso, setPagoExitoso] = useState(false);
  const [error, setError] = useState("");
  const [hora, setHora] = useState("");

  // Reloj header
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setHora(now.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // Carga boleta + carrito
  useEffect(() => {
    const hoy = new Date();
    const fechaStr = hoy.toLocaleString("es-CL", {
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
    });
    setFecha(fechaStr);
    setNroBoleta(`#${id || ""}`);

    const carritoLocal = JSON.parse(localStorage.getItem("carrito") || "[]");
    setProductos(carritoLocal);
    const subtotal = carritoLocal.reduce((sum, item) => sum + (item.total || 0), 0);
    setTotal(subtotal);
  }, []);

  // ===== Backend =====
  const actualizarVenta = async (estado, metodo_pago = null) => {
    try {
      const venta = { id, estado };
      if (metodo_pago != null) venta.metodo_pago = metodo_pago;

      const response = await fetch(`${apiUrl}api/ventas/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(venta),
      });
      if (!response.ok) throw new Error(`Error al actualizar la venta: ${JSON.stringify(venta)}`);
    } catch (error) {
      console.error("❌ Error en la actualización de la venta:", error);
    }
  };

  const restarInventario = async (carrito) => {
    try {
      const token = localStorage.getItem("token");

      // Perfil / sucursal
      const resProfile = await fetch(`${apiUrl}api/profile/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!resProfile.ok) throw new Error("No se pudo obtener el perfil del usuario");
      const perfil = await resProfile.json();
      const sucursalId = perfil.caja?.sucursal;
      if (!sucursalId) throw new Error("El usuario no tiene sucursal asignada");

      // Inventario
      const resInventario = await fetch(`${apiUrl}inventario/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!resInventario.ok) throw new Error("No se pudo obtener inventario");
      const inventarios = await resInventario.json();

      for (const item of carrito) {
        const itemsAProcesar = [];

        // Producto simple
        if (item.producto?.item) {
          if (item.producto.eq_pollo !== null) {
            itemsAProcesar.push({
              itemId: item.producto.item,
              cantidad: (item.cantidad || 0) * (item.producto.eq_pollo || 1),
            });
          } else {
            itemsAProcesar.push({
              itemId: item.producto.item,
              cantidad: item.cantidad || 0,
            });
          }
        }

        // Promos / combos
        if (item.producto && Array.isArray(item.producto.productos)) {
          item.producto.productos.forEach((p) => {
            if (!p?.item) return;
            if (p.eq_pollo !== null) {
              itemsAProcesar.push({
                itemId: p.item,
                cantidad: (p.cantidad || 1) * (item.cantidad || 1) * (p.eq_pollo || 1),
              });
            } else {
              itemsAProcesar.push({
                itemId: p.item,
                cantidad: (p.cantidad || 1) * (item.cantidad || 1),
              });
            }
          });
        }

        // Update inventario
        for (const ip of itemsAProcesar) {
          const inv = inventarios.find(
            (inv) => inv.item?.id === ip.itemId && inv.sucursal === sucursalId
          );
          if (!inv) {
            console.warn(`No se encontró inventario para item ${ip.itemId} en sucursal ${sucursalId}`);
            continue;
          }

          const resUpdate = await fetch(`${apiUrl}inventario/update/${inv.id}/`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
            body: JSON.stringify({ cantidad_vendida: ip.cantidad }),
          });

          if (!resUpdate.ok) console.error(`❌ Error actualizando inventario ${inv.id}`);
        }
      }
    } catch (err) {
      console.error("❌ Error al restar inventario:", err);
    }
  };

  const calcularVuelto = async () => {
    if (productos.length === 0) {
      setError("No hay productos para pagar.");
      await actualizarVenta(3); // ANULADO
      return;
    }
    const pagado = parseFloat(montoPagado);
    if (isNaN(pagado) || pagado < total) {
      setError("El monto pagado debe ser mayor o igual al total.");
      await actualizarVenta(3); // ANULADO
      return;
    }

    setError("");
    const vueltoCalculado = pagado - total;
    setVuelto(vueltoCalculado);
    setPagoExitoso(true);

    await restarInventario(productos);
    await actualizarVenta(2, 1); // estado 2=PAGADA, método 1=EFECTIVO (ajusta si tu backend usa otro id)

    localStorage.removeItem("carrito");
    localStorage.removeItem("metodoPago");

    setTimeout(() => {
      setPagoExitoso(false);
      navigate("/");
    }, 4000);
  };

  // ================== UI ==================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-200 via-white to-gray-400">
      {/* HEADER (igual estilo) */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Móvil */}
          <div className="block md:hidden py-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Abrir/Cerrar barra lateral"
              className="w-10 h-10 inline-flex items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              ☰
            </button>
            <div className="mt-2 flex items-center justify-center gap-2">
              <Wallet className="text-red-500" size={22} />
              <h1 className="text-xl font-extrabold text-gray-900">Pago en Efectivo — Venta #{id}</h1>
            </div>
            <span className="mt-1 block text-center text-gray-600 font-medium">{hora}</span>
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
            <div className="flex items-center gap-3">
              <Wallet className="text-red-500" size={26} />
              <h1 className="text-2xl font-extrabold text-gray-900">Pago en Efectivo — Venta #{id}</h1>
            </div>
            <span className="min-w-[120px] text-right text-gray-600 font-medium">{hora}</span>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 pb-24 sm:pb-6">
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-6">
          {/* IZQUIERDA */}
          <section className="space-y-4">
            {/* Info boleta */}
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
                  <span className="sm:block sm:mt-1">Efectivo</span>
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
                          <td className="py-2 px-3">
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
                        <td colSpan="3" className="text-center py-3 text-gray-500">Carrito vacío</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Cards (móvil) */}
              <ul className="sm:hidden divide-y divide-gray-200">
                {productos.length > 0 ? (
                  productos.map((item, i) => (
                    <li key={i} className="p-4">
                      <h4 className="font-semibold text-gray-900">
                        {item.producto?.nombre || item.producto?.descripcion || "-"}
                      </h4>
                      <div className="mt-1 text-sm text-gray-700 flex justify-between">
                        <span>Cant.: {item.cantidad}</span>
                        <span className="font-medium">
                          ${item.total?.toLocaleString() || "0"}
                        </span>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="p-4 text-center text-gray-500">Carrito vacío</li>
                )}
              </ul>
            </div>

            {/* TOTAL */}
            <div className="bg-white/90 rounded-xl shadow border border-gray-200 p-4 flex items-center justify-between">
              <span className="font-semibold text-gray-700">Total:</span>
              <span className="text-xl font-extrabold text-gray-900">
                ${total.toLocaleString()}
              </span>
            </div>
          </section>

          {/* DERECHA: sticky y mismo orden visual que el resto */}
          <section className="md:sticky md:top-6 md:self-start">
            <div className="bg-white/90 rounded-2xl shadow-xl border border-gray-200 p-5">
              {/* Input monto */}
              <div className="mb-4">
                <label className="block mb-1 text-gray-700 font-medium">Monto recibido:</label>
                <input
                  type="number"
                  value={montoPagado}
                  onChange={(e) => setMontoPagado(e.target.value)}
                  placeholder="Ej: 10000"
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 flex items-center justify-center gap-2 bg-red-100 border border-red-400 text-red-800 rounded-lg py-3 px-4 shadow-sm">
                  <AlertTriangle size={20} />
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              {/* Calcular vuelto */}
              <button
                onClick={calcularVuelto}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold shadow-md hover:scale-[1.02] hover:shadow-lg transition-transform duration-200"
              >
                <Calculator size={18} />
                Calcular Vuelto
              </button>

              {/* Resultado */}
              {vuelto !== null && (
                <div className="mt-4 bg-green-100 border border-green-400 text-green-800 rounded-lg p-4 text-center font-bold text-lg shadow-sm">
                  Vuelto: ${vuelto.toLocaleString()}
                </div>
              )}

              {/* Éxito */}
              {pagoExitoso && (
                <div className="mt-4 flex items-center justify-center gap-2 bg-green-500 text-white font-semibold rounded-lg py-3 px-4 shadow-md">
                  <CheckCircle2 size={22} />
                  <span>Pago completado con éxito</span>
                </div>
              )}

              {/* Gracias (antes del volver, como en los otros) */}
              <div className="mt-4 text-center text-gray-600 text-xs">
                Gracias por su compra
                <p className="italic mt-1">¡Vuelva pronto!</p>
              </div>

              {/* Volver */}
              <button
                onClick={() => navigate(`/MetodoPago/${id}`)}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200"
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
