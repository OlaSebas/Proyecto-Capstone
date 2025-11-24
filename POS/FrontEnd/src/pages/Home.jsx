import { useState, useEffect } from "react";
import { ShoppingCart, Package, UserPlus } from "lucide-react";
import { useOutletContext, Link } from "react-router-dom";

export default function Home() {
  const { sidebarOpen, setSidebarOpen } =
    useOutletContext?.() ?? { sidebarOpen: false, setSidebarOpen: () => {} };

  const [hora, setHora] = useState("");

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
              <h1 className="text-2xl font-extrabold text-gray-900">
                Bienvenido al Sistema
              </h1>
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
              Bienvenido al Sistema
            </h1>

            <span className="min-w-[120px] text-right text-gray-600 font-medium">
              {hora}
            </span>
          </div>
        </div>
      </header>

      {/* SUBTÍTULO */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 mt-6 text-center">
        <p className="text-gray-700 text-base sm:text-lg">
          Administre las ventas, el inventario y los proveedores desde un solo lugar.
        </p>
      </div>

      {/* CONTENIDO */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* Grid responsive: 1 / 2 / 3 columnas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Ventas */}
          <Link
            to="/venta"
            className="group rounded-2xl bg-white/90 backdrop-blur border border-gray-200 shadow hover:shadow-lg transition-shadow p-6 sm:p-8 flex flex-col items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-300"
            aria-label="Ir a Ventas"
          >
            <div className="rounded-full p-4 bg-gray-100 group-hover:bg-gray-200 transition">
              <ShoppingCart className="w-12 h-12 text-gray-700" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Ventas</h3>
            <p className="mt-1 text-sm text-gray-600 text-center">
              Crea boletas, gestiona pagos y revisa el flujo en caja.
            </p>
          </Link>

          {/* Inventario */}
          <Link
            to="/inventariostock"
            className="group rounded-2xl bg-white/90 backdrop-blur border border-gray-200 shadow hover:shadow-lg transition-shadow p-6 sm:p-8 flex flex-col items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-300"
            aria-label="Ir a Inventario"
          >
            <div className="rounded-full p-4 bg-gray-100 group-hover:bg-gray-200 transition">
              <Package className="w-12 h-12 text-gray-700" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Inventario</h3>
            <p className="mt-1 text-sm text-gray-600 text-center">
              Controla stock, entradas y salidas por sucursal.
            </p>
          </Link>

          {/* Proveedores */}
          <Link
            to="/proveedor"
            className="group rounded-2xl bg-white/90 backdrop-blur border border-gray-200 shadow hover:shadow-lg transition-shadow p-6 sm:p-8 flex flex-col items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-300"
            aria-label="Ir a Proveedores"
          >
            <div className="rounded-full p-4 bg-gray-100 group-hover:bg-gray-200 transition">
              <UserPlus className="w-12 h-12 text-gray-700" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Proveedores</h3>
            <p className="mt-1 text-sm text-gray-600 text-center">
              Registra proveedores y gestiona órdenes de compra.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
