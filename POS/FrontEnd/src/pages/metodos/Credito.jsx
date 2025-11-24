import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { CreditCard, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";

export default function PagoCredito() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  // Soporte si no existe OutletContext
  const outlet = (typeof useOutletContext === "function" ? useOutletContext() : null) || {};
  const sidebarOpen = outlet.sidebarOpen ?? false;
  const setSidebarOpen = outlet.setSidebarOpen ?? (() => {});

  const [productos, setProductos] = useState([]);
  const [totalBase, setTotalBase] = useState(0);
  const [totalFinal, setTotalFinal] = useState(0);
  const [cuotas, setCuotas] = useState(1);
  const [montoCuota, setMontoCuota] = useState(0);

  const [fecha, setFecha] = useState("");
  const [nroBoleta, setNroBoleta] = useState("");

  const [pagoExitoso, setPagoExitoso] = useState(false);
  const [error, setError] = useState("");

  // Carga inicial
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

    const carritoLocal = JSON.parse(localStorage.getItem("carrito") || "[]");
    setProductos(carritoLocal);
    const subtotal = carritoLocal.reduce((sum, it) => sum + (it.total || 0), 0);
    setTotalBase(subtotal);
    setTotalFinal(subtotal);
  }, []);

  // Recalcular cuotas
  useEffect(() => {
    let recargo = 0;
    if (cuotas === 3) recargo = 0.05;
    if (cuotas === 6) recargo = 0.1;
    if (cuotas === 12) recargo = 0.2;

    const nuevoTotal = totalBase + totalBase * recargo;
    setTotalFinal(nuevoTotal);
    setMontoCuota(Math.round((nuevoTotal || 0) / (cuotas || 1)));
  }, [cuotas, totalBase]);

  // Restar inventario
  const restarInventario = async (carrito) => {
    try {
      const token = localStorage.getItem("token");

      const resProfile = await fetch(`${apiUrl}api/profile/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!resProfile.ok) throw new Error("No se pudo obtener el perfil del usuario");
      const perfil = await resProfile.json();
      const sucursalId = perfil.caja?.sucursal;
      if (!sucursalId) throw new Error("El usuario no tiene sucursal asignada");

      const resInventario = await fetch(`${apiUrl}inventario/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!resInventario.ok) throw new Error("No se pudo obtener inventario");
      const inventarios = await resInventario.json();

      for (const item of carrito) {
        const itemsAProcesar = [];

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

        for (const ip of itemsAProcesar) {
          const inv = inventarios.find(
            (inv) => inv.item?.id === ip.itemId && inv.sucursal === sucursalId
          );
          if (!inv) continue;

          const nuevaCantidad = (inv.cantidad_vendida || 0) + (ip.cantidad || 0);

          await fetch(`${apiUrl}inventario/update/${inv.id}/`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
            body: JSON.stringify({ cantidad_vendida: nuevaCantidad }),
          });
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

    await restarInventario(productos);

    setError("");
    setPagoExitoso(true);
    localStorage.removeItem("carrito");
    localStorage.removeItem("metodoPago");

    setTimeout(() => {
      setPagoExitoso(false);
      navigate("/");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-white to-red-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {/* HEADER */}
        <header className="mb-6">
          {/* Móvil */}
          <div className="md:hidden bg-white/90 backdrop-blur rounded-xl shadow p-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Abrir/Cerrar barra lateral"
              className="w-10 h-10 inline-flex items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              ☰
            </button>
            <div className="mt-2 flex items-center justify-center gap-2">
              <CreditCard className="text-red-500" size={22} />
              <h1 className="text-xl font-extrabold text-gray-900">Pago con Crédito</h1>
            </div>
            <p className="text-gray-600 text-sm text-center">Danny Pollos</p>
          </div>

          {/* Desktop/Tablet */}
          <div className="hidden md:flex items-center justify-between bg-white/90 backdrop-blur rounded-xl shadow p-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Abrir/Cerrar barra lateral"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              ☰
            </button>
            <div className="flex items-center gap-3">
              <CreditCard className="text-red-500" size={26} />
              <h1 className="text-2xl font-extrabold text-gray-900">Pago con Crédito</h1>
            </div>
            <span className="text-gray-600">Danny Pollos</span>
          </div>
        </header>

        {/* Grid igual a Débito: 1.1fr / 0.9fr */}
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-6">
          {/* IZQUIERDA: boleta + detalle */}
          <section className="space-y-4">
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
                  <span className="sm:block sm:mt-1">Crédito</span>
                </div>
              </div>
            </div>

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
                    {productos.length ? (
                      productos.map((item, i) => (
                        <tr key={i} className="border-b last:border-0 text-gray-700">
                          <td className="py-2 px-3">
                            {item.producto?.nombre || item.producto?.descripcion || "-"}
                          </td>
                          <td className="py-2 px-3 text-center">{item.cantidad}</td>
                          <td className="py-2 px-3 text-right">
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

              {/* Cards móvil */}
              <ul className="sm:hidden divide-y divide-gray-200">
                {productos.length ? (
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

            <div className="bg-white/90 rounded-xl shadow border border-gray-200 p-4 flex items-center justify-between">
              <span className="font-semibold text-gray-700">Subtotal:</span>
              <span className="text-xl font-extrabold text-gray-900">
                ${totalBase.toLocaleString()}
              </span>
            </div>
          </section>

          {/* DERECHA: sticky, mismo orden que Débito */}
          <section className="md:sticky md:top-6 md:self-start">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-5">
              {/* Select cuotas */}
              <div className="mb-4">
                <label className="block mb-1 text-gray-700 font-medium">Seleccionar cuotas:</label>
                <select
                  value={cuotas}
                  onChange={(e) => setCuotas(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
                >
                  <option value={1}>1 cuota (sin recargo)</option>
                  <option value={3}>3 cuotas (+5%)</option>
                  <option value={6}>6 cuotas (+10%)</option>
                  <option value={12}>12 cuotas (+20%)</option>
                </select>
              </div>

              {/* Monto por cuota / total con recargo */}
              <div className="bg-gray-100 p-3 rounded-lg mb-5 text-center text-gray-700">
                <p>
                  Cada cuota:{" "}
                  <span className="font-extrabold text-red-600">
                    ${montoCuota.toLocaleString("es-CL")}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  Total con recargo: ${totalFinal.toLocaleString("es-CL")}
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 flex items-center justify-center gap-2 bg-red-100 border border-red-300 text-red-800 rounded-lg py-3 px-4 shadow-sm">
                  <AlertTriangle size={20} />
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              {/* Confirmar */}
              <button
                onClick={procesarPago}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold shadow-md hover:scale-[1.02] hover:shadow-lg transition-transform duration-200"
              >
                <CheckCircle2 size={18} />
                Confirmar Pago
              </button>

              {/* Gracias (antes del volver, como en Débito) */}
              <div className="mt-4 text-center text-gray-600 text-xs">
                Gracias por su compra
                <p className="italic mt-1">¡Vuelva pronto!</p>
              </div>

              {/* Volver */}
              <button
                onClick={() => navigate("/Carrito")}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200"
              >
                <ArrowLeft size={18} />
                Volver a métodos de pago
              </button>

              {/* Éxito */}
              {pagoExitoso && (
                <div className="mt-4 flex items-center justify-center gap-2 bg-green-500 text-white font-semibold rounded-lg py-3 px-4 shadow-md">
                  <CheckCircle2 size={22} />
                  <span>Pago realizado con éxito</span>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
