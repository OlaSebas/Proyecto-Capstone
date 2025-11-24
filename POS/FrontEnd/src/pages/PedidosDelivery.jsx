import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

export default function PedidosDelivery() {
  const { sidebarOpen, setSidebarOpen } = useOutletContext();

  const [hora, setHora] = useState("");
  const [pedidos, setPedidos] = useState([
    {
      id: 1,
      cliente: "Alon Ramirez",
      empresa: "Rappi",
      pago: "Débito",
      pedido: "1/4 pollo + papas fritas + bebida 1.5L",
      estado: "pendiente",
    },
    {
      id: 2,
      cliente: "Chiquitín Galliardo",
      empresa: "Uber Eats",
      pago: "Efectivo",
      pedido: "Bebida 1.5L",
      estado: "pendiente",
    },
  ]);

  useEffect(() => {
    const actualizarHora = () => {
      const now = new Date();
      const time = now.toLocaleTimeString("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setHora(time);
    };
    actualizarHora();
    const intervalo = setInterval(actualizarHora, 1000);
    return () => clearInterval(intervalo);
  }, []);

  const volver = () => window.history.back();

  const marcarListo = (id) => {
    setPedidos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, estado: "listo" } : p))
    );
  };

  const entregarPedido = (id) => {
    setPedidos((prev) => prev.filter((p) => p.id !== id));
  };

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
            Pedidos Delivery
          </h2>
          <span className="text-gray-600 font-medium text-sm md:text-base">
            {hora}
          </span>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 flex flex-col gap-4 p-4 md:p-6">
        {/* Tabla en desktop / Cards en móvil */}
        <div className="w-full max-w-6xl mx-auto bg-white/90 backdrop-blur border border-gray-200 shadow-xl rounded-xl overflow-hidden">
          {/* Tabla (sm+) */}
          <div className="hidden sm:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead className="bg-gray-200 sticky top-0 z-10">
                  <tr className="text-gray-700">
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Empresa</th>
                    <th className="px-6 py-4">Pago</th>
                    <th className="px-6 py-4">Pedido</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((p, i) => (
                    <tr
                      key={p.id}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 text-gray-900">{p.cliente}</td>
                      <td className="px-6 py-4">{p.empresa}</td>
                      <td className="px-6 py-4">{p.pago}</td>
                      <td className="px-6 py-4">{p.pedido}</td>
                      <td className="px-6 py-4">
                        {p.estado === "pendiente" ? (
                          <span className="px-2 py-1 rounded bg-red-100 text-red-800 border border-red-200 text-sm">
                            Pendiente
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-green-100 text-green-800 border border-green-200 text-sm">
                            Listo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {p.estado === "pendiente" ? (
                            <button
                              onClick={() => marcarListo(p.id)}
                              className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                            >
                              Marcar listo
                            </button>
                          ) : (
                            <button
                              onClick={() => entregarPedido(p.id)}
                              className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                            >
                              Entregado
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pedidos.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-6 text-center text-gray-500"
                      >
                        No hay pedidos pendientes
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards (móvil) */}
          <ul className="sm:hidden divide-y divide-gray-200">
            {pedidos.length > 0 ? (
              pedidos.map((p) => (
                <li key={p.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{p.cliente}</p>
                      <p className="text-gray-600 text-sm">{p.empresa} • {p.pago}</p>
                      <p className="mt-2 text-gray-800">{p.pedido}</p>
                      <div className="mt-2">
                        {p.estado === "pendiente" ? (
                          <span className="px-2 py-1 rounded bg-red-100 text-red-800 border border-red-200 text-xs">
                            Pendiente
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-green-100 text-green-800 border border-green-200 text-xs">
                            Listo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {p.estado === "pendiente" ? (
                      <button
                        onClick={() => marcarListo(p.id)}
                        className="px-3 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                      >
                        Marcar listo
                      </button>
                    ) : (
                      <button
                        onClick={() => entregarPedido(p.id)}
                        className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                      >
                        Entregado
                      </button>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <li className="p-6 text-center text-gray-500">
                No hay pedidos pendientes
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
