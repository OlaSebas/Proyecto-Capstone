import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";

export default function Proveedores() {
  const { sidebarOpen, setSidebarOpen } = useOutletContext();

  const [proveedores, setProveedores] = useState([]);
  const [hora, setHora] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroProveedor, setFiltroProveedor] = useState("todos");

  // Mock (reemplaza por API cuando esté lista)
  const proveedoresMock = [
    {
      id: 1,
      proveedor: "Coca Cola",
      cantidad: 4,
      pedido: "Caja Coca 237ml",
      dia_reporte: "Martes 2 Septiembre",
    },
    {
      id: 2,
      proveedor: "Coca Cola",
      cantidad: 2,
      pedido: "Caja Fanta 237ml",
      dia_reporte: "Martes 2 Septiembre",
    },
    {
      id: 3,
      proveedor: "Nestlé",
      cantidad: 10,
      pedido: "Caja Leche Entera",
      dia_reporte: "Miércoles 3 Septiembre",
    },
  ];

  // Simula fetch (sustituye por fetch real)
  const fetchProveedores = async () => {
    try {
      // const res = await fetch(`${apiUrl}proveedores/`);
      // const data = await res.json();
      // setProveedores(data);
      setProveedores(proveedoresMock);
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
      setProveedores([]);
    }
  };

  // Hora en vivo
  useEffect(() => {
    const actualizarHora = () =>
      setHora(
        new Date().toLocaleTimeString("es-CL", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    actualizarHora();
    const t = setInterval(actualizarHora, 1000);
    return () => clearInterval(t);
  }, []);

  // Carga inicial
  useEffect(() => {
    fetchProveedores();
  }, []);

  const volver = () => window.history.back();

  // Proveedores únicos para el filtro
  const proveedoresUnicos = useMemo(() => {
    const set = new Set(proveedores.map((p) => p.proveedor));
    return ["todos", ...Array.from(set)];
  }, [proveedores]);

  // Filtrado por texto y proveedor
  const dataFiltrada = useMemo(() => {
    return proveedores
      .filter((p) =>
        filtroProveedor === "todos" ? true : p.proveedor === filtroProveedor
      )
      .filter((p) => {
        const q = busqueda.trim().toLowerCase();
        if (!q) return true;
        return (
          p.proveedor.toLowerCase().includes(q) ||
          String(p.cantidad).toLowerCase().includes(q) ||
          p.pedido.toLowerCase().includes(q) ||
          p.dia_reporte.toLowerCase().includes(q)
        );
      });
  }, [proveedores, filtroProveedor, busqueda]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-red-100 via-white to-red-200">
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
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex-1 text-center">
            Proveedores
          </h2>
          <span className="text-gray-600 font-medium text-sm md:text-base">
            {hora}
          </span>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 flex flex-col gap-4 p-4 md:p-6">
        {/* Controles: búsqueda + filtro*/}
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
          <input
            type="text"
            placeholder="Buscar por proveedor, pedido o fecha..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
          />

          <select
            value={filtroProveedor}
            onChange={(e) => setFiltroProveedor(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            {proveedoresUnicos.map((prov) => (
              <option key={prov} value={prov}>
                {prov === "todos" ? "Todos los proveedores" : prov}
              </option>
            ))}
          </select>


        </div>

        {/* Tabla (desktop) / Cards (móvil) */}
        <div className="w-full max-w-6xl mx-auto bg-white/90 backdrop-blur border border-gray-200 shadow-xl rounded-xl overflow-hidden">
          {/* Tabla sm+ */}
          <div className="hidden sm:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead className="bg-gray-200">
                  <tr className="text-gray-700">
                    <th className="px-6 py-4">Proveedor</th>
                    <th className="px-6 py-4">Cantidad</th>
                    <th className="px-6 py-4">Pedido</th>
                    <th className="px-6 py-4">Día de Reporte</th>
                  </tr>
                </thead>
                <tbody>
                  {dataFiltrada.length > 0 ? (
                    dataFiltrada.map((item, i) => (
                      <tr
                        key={item.id}
                        className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-6 py-4 text-gray-900">
                          {item.proveedor}
                        </td>
                        <td className="px-6 py-4">{item.cantidad}</td>
                        <td className="px-6 py-4">{item.pedido}</td>
                        <td className="px-6 py-4">{item.dia_reporte}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-6 text-center text-gray-500"
                      >
                        No hay proveedores registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards móvil */}
          <ul className="sm:hidden divide-y divide-gray-200">
            {dataFiltrada.length > 0 ? (
              dataFiltrada.map((item) => (
                <li key={item.id} className="p-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-gray-600">Proveedor</p>
                    <p className="font-semibold text-gray-900">
                      {item.proveedor}
                    </p>

                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-gray-100 rounded-lg px-3 py-2">
                        <p className="text-gray-600">Cantidad</p>
                        <p className="font-semibold text-gray-900">
                          {item.cantidad}
                        </p>
                      </div>
                      <div className="bg-gray-100 rounded-lg px-3 py-2">
                        <p className="text-gray-600">Fecha</p>
                        <p className="font-semibold text-gray-900">
                          {item.dia_reporte}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Pedido</p>
                      <p className="text-gray-800">{item.pedido}</p>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="p-6 text-center text-gray-500">
                No hay proveedores registrados
              </li>
            )}
          </ul>
        </div>

        {/* Botón volver */}
        <div className="w-full max-w-6xl mx-auto">
          <button
            onClick={volver}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Volver
          </button>
        </div>
      </main>
    </div>
  );
}
