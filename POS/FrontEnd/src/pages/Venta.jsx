import { useEffect, useState } from "react";
import { Plus, List, Clock } from "lucide-react";
import { useOutletContext, Link } from "react-router-dom";

export default function Ventas() {
  const [hora, setHora] = useState("");
  const [cajaAbierta, setCajaAbierta] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  const { sidebarOpen, setSidebarOpen } =
    useOutletContext?.() ?? { sidebarOpen: false, setSidebarOpen: () => {} };

  // Consultar si hay sesión de caja activa
  useEffect(() => {
    fetch(`${apiUrl}api/sesion_activa/`, {
      headers: { Authorization: `Token ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setCajaAbierta(
          data?.sesion_activa === true || (Array.isArray(data) && data.length > 0)
        );
      })
      .catch((err) => {
        console.error("Error cargando sesión activa:", err);
        setCajaAbierta(false);
      });
  }, [apiUrl]);

  // Reloj
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

  // Cerrar caja (mantengo tu lógica)
  const cerrarCaja = async () => {
    const montoCierre = prompt("Ingrese monto de cierre:");
    if (!montoCierre) return alert("Debe ingresar un monto para cerrar la caja.");

    try {
      const res = await fetch(
        `${apiUrl}api/sesion_caja/${localStorage.getItem("sesionCaja")}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            fecha_cierre: new Date().toISOString(),
            monto_final: montoCierre,
            is_active: false,
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Error cerrando caja:", errData);
        alert("Error cerrando caja");
      } else {
        alert("Caja cerrada exitosamente");
        setCajaAbierta(false);
        sessionStorage.clear();
        localStorage.removeItem("token");
        localStorage.removeItem("sesionCaja");
        handleLogout();
      }
    } catch (err) {
      console.error("Error en la petición de cerrar caja:", err);
      alert("Error cerrando caja");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/Login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-white to-red-200">
      {/* HEADER (móvil apilado / desktop alineado) */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-3 sm:px-6">
          {/* Móvil */}
          <div className="block md:hidden py-3">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Abrir/Cerrar barra lateral"
              className="w-full h-10 inline-flex items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              ☰
            </button>

            <div className="mt-3 text-center">
              <h1 className="text-2xl font-extrabold text-gray-900">Ventas</h1>
              <p className="mt-1 text-gray-600 font-medium">{hora}</p>
            </div>
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

            <h1 className="flex-1 px-3 text-center text-3xl font-extrabold text-gray-900">
              Ventas
            </h1>

            <span className="min-w-[120px] text-right text-gray-600 font-medium">
              {hora}
            </span>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* Grid de acciones: 1 / 2 / 3 columnas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Pedido nuevo */}
          <Link
            to="/producto"
            className="group rounded-2xl bg-white/90 backdrop-blur border border-gray-200 shadow hover:shadow-lg transition-shadow p-6 sm:p-8 flex flex-col items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-300"
            aria-label="Pedido nuevo"
          >
            <div className="rounded-full p-4 bg-gray-100 group-hover:bg-gray-200 transition">
              <Plus className="w-12 h-12 text-gray-700" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Pedido nuevo</h3>
            <p className="mt-1 text-sm text-gray-600 text-center">
              Crea una venta rápida desde el catálogo.
            </p>
          </Link>

          {/* Pedido delivery */}
          <Link
            to="/PedidosDelivery"
            className="group rounded-2xl bg-white/90 backdrop-blur border border-gray-200 shadow hover:shadow-lg transition-shadow p-6 sm:p-8 flex flex-col items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-300"
            aria-label="Pedido delivery"
          >
            <div className="rounded-full p-4 bg-gray-100 group-hover:bg-gray-200 transition">
              <List className="w-12 h-12 text-gray-700" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Pedido delivery</h3>
            <p className="mt-1 text-sm text-gray-600 text-center">
              Administra pedidos para despacho.
            </p>
          </Link>

          {/* Abrir/Cerrar caja */}
          <button
            onClick={cajaAbierta ? cerrarCaja : handleLogout}
            className="group rounded-2xl bg-white/90 backdrop-blur border border-gray-200 shadow hover:shadow-lg transition-shadow p-6 sm:p-8 flex flex-col items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-300"
            aria-label={cajaAbierta ? "Cerrar caja" : "Abrir caja"}
          >
            <div className="rounded-full p-4 bg-gray-100 group-hover:bg-gray-200 transition">
              <Clock className="w-12 h-12 text-gray-700" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              {cajaAbierta ? "Cerrar caja" : "Abrir caja"}
            </h3>
            <p className="mt-1 text-sm text-gray-600 text-center">
              {cajaAbierta
                ? "Finaliza la sesión de caja actual."
                : "Inicia sesión de caja para comenzar a vender."}
            </p>
          </button>
        </div>

        {/* Botón Volver (gris oscuro casi negro) */}
        <div className="mt-10 w-full flex justify-center">
          <Link
            to="/home"
            className="px-6 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Volver
          </Link>
        </div>
      </main>
    </div>
  );
}
