import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

export default function InventarioStock() {
  const [stock, setStock] = useState([]);
  const [customUser, setCustomUser] = useState(null);
  const [hora, setHora] = useState("");
  const [tab, setTab] = useState("productos");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const { sidebarOpen, setSidebarOpen } = useOutletContext();
  const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/";

  // Usuario logueado
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${apiUrl}api/profile/`, {
          headers: { Authorization: `Token ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error("No se pudo cargar usuario");
        const data = await res.json();
        setCustomUser(data);
      } catch (err) {
        console.error("Error al cargar usuario:", err);
      }
    };
    fetchUser();
  }, [apiUrl]);

  // Reloj + Inventario con auto-refresh
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

    const fetchInventario = async () => {
      try {
        setCargando(true);
        const res = await fetch(`${apiUrl}inventario/`, {
          headers: { Authorization: `Token ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error("Error al cargar inventario");
        const data = await res.json();
        setStock(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };

    actualizarHora();
    fetchInventario();

    const intervaloHora = setInterval(actualizarHora, 1000);
    const intervaloInventario = setInterval(fetchInventario, 10000);

    return () => {
      clearInterval(intervaloHora);
      clearInterval(intervaloInventario);
    };
  }, [apiUrl]);


  const volver = () => window.history.back();

  const sucursalUsuarioId = customUser?.caja?.sucursal ?? null;

  // Filtrado por sucursal + pestaña + búsqueda
  const productos = useMemo(
    () =>
      stock.filter(
        (i) =>
          i.item &&
          i.sucursal === sucursalUsuarioId &&
          (i.item.descripcion || "")
            .toLowerCase()
            .includes(busqueda.toLowerCase())
      ),
    [stock, sucursalUsuarioId, busqueda]
  );

  const insumos = useMemo(
    () =>
      stock.filter(
        (i) =>
          i.insumo &&
          i.sucursal === sucursalUsuarioId &&
          (i.insumo.descripcion || "")
            .toLowerCase()
            .includes(busqueda.toLowerCase())
      ),
    [stock, sucursalUsuarioId, busqueda]
  );

  const encabezado = tab === "productos" ? "Productos" : "Insumos";
  const listado = tab === "productos" ? productos : insumos;

  // helper UI: clase para stock bajo (ajusta el umbral si quieres)
  const lowStockClass = (cantidad) =>
    Number(cantidad) <= 5 ? "text-red-600 font-semibold" : "text-gray-900";

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-200 via-white to-gray-300">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-20">
        <div className="flex justify-between items-center px-4 md:px-6 py-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
            aria-label="Abrir/Cerrar barra lateral"
          >
            ☰
          </button>

          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 text-center flex-1">
            Inventario de stock
          </h2>

          <span className="text-gray-600 font-medium text-sm md:text-base">
            {hora}
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-4 px-4 md:px-6 py-4">
        {/* Controles: tabs + buscador */}
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              onClick={() => setTab("productos")}
              className={`px-4 py-2 rounded-full font-semibold transition-all shadow-sm border ${
                tab === "productos"
                  ? "bg-red-600 text-white border-red-700 shadow-md"
                  : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
              }`}
            >
              Productos
            </button>
            <button
              onClick={() => setTab("insumos")}
              className={`px-4 py-2 rounded-full font-semibold transition-all shadow-sm border ${
                tab === "insumos"
                  ? "bg-red-600 text-white border-red-700 shadow-md"
                  : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
              }`}
            >
              Insumos
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 flex flex-col items-center gap-6 w-full">
          <AnimatePresence mode="wait">
            <motion.section
              key={tab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-full md:max-w-6xl bg-white/90 backdrop-blur border border-gray-200 shadow-xl rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-gray-100 border-b">
                <h3 className="text-lg md:text-xl font-bold text-gray-900">
                  {encabezado}
                </h3>
                <span className="text-sm text-gray-600">
                  Total: {listado.length}
                </span>
              </div>

              {/* Tabla (md+) */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse text-left">
                    <thead className="bg-gray-200 sticky top-0 z-10">
                      <tr className="text-gray-700">
                        <th className="px-6 py-3">Nombre</th>
                        <th className="px-6 py-3">Cantidad</th>
                        <th className="px-6 py-3">Unidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cargando ? (
                        [...Array(5)].map((_, i) => (
                          <tr key={i} className={i % 2 ? "bg-white" : "bg-gray-50"}>
                            <td className="px-6 py-3">
                              <div className="h-4 w-48 bg-gray-200 animate-pulse rounded" />
                            </td>
                            <td className="px-6 py-3">
                              <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
                            </td>
                            <td className="px-6 py-3">
                              <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                            </td>
                          </tr>
                        ))
                      ) : listado.length > 0 ? (
                        listado.map((item, i) => {
                          const nombre =
                            tab === "productos"
                              ? item.item?.descripcion
                              : item.insumo?.descripcion;
                          const unidad =
                            tab === "productos"
                              ? item.item?.unidad_medida
                              : item.insumo?.unidad_medida;
                          return (
                            <tr
                              key={item.id}
                              className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                            >
                              <td className="px-6 py-3 text-gray-900">{nombre}</td>
                              <td className={`px-6 py-3 ${lowStockClass(item.stock_actual)}`}>
                                {item.stock_actual}
                              </td>
                              <td className="px-6 py-3 text-gray-700">{unidad}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-6 py-6 text-center text-gray-500">
                            No hay {encabezado.toLowerCase()} disponibles
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cards (móvil) */}
              <div className="md:hidden p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cargando
                  ? [...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                      >
                        <div className="h-4 w-40 bg-gray-200 animate-pulse rounded mb-3" />
                        <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mb-1" />
                        <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                      </div>
                    ))
                  : listado.length > 0
                  ? listado.map((item) => {
                      const nombre =
                        tab === "productos"
                          ? item.item?.descripcion
                          : item.insumo?.descripcion;
                      const unidad =
                        tab === "productos"
                          ? item.item?.unidad_medida
                          : item.insumo?.unidad_medida;
                      return (
                        <div
                          key={item.id}
                          className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                        >
                          <p className="font-semibold text-gray-900">{nombre}</p>
                          <p className={`mt-1 ${lowStockClass(item.stock_actual)}`}>
                            Cantidad: {item.stock_actual}
                          </p>
                          <p className="text-gray-600 text-sm">Unidad: {unidad}</p>
                        </div>
                      );
                    })
                  : (
                    <p className="col-span-full text-center text-gray-500">
                      No hay {encabezado.toLowerCase()} disponibles
                    </p>
                  )}
              </div>
            </motion.section>
          </AnimatePresence>

          {/* Volver */}
          <div className="w-full flex justify-center">
            <button
              onClick={volver}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Volver
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
