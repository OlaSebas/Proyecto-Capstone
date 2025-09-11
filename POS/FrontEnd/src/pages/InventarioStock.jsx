import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

export default function InventarioStock() {
  const [stock] = useState([
    { id: 1, nombre: "Pollos", cantidad: 49 },
    { id: 2, nombre: "Carbón (sacos)", cantidad: 10 },
    { id: 3, nombre: "Potes de salsa", cantidad: 700 },
  ]);

  const { sidebarOpen, setSidebarOpen } = useOutletContext();

  const [hora, setHora] = useState("");

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

  const recargar = () => {
    console.log("Recargando inventario...");
  };

  const volver = () => {
    window.history.back();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header con título centrado y hora */}
      <header className="flex justify-between items-center bg-white shadow px-6 py-4">
        {/* Botón ☰ */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ☰
        </button>

        {/* Título centrado */}
        <h2 className="text-3xl font-bold text-gray-800 flex-1 text-center">
          Inventario de stock
        </h2>

        {/* Hora */}
        <span className="text-gray-600 font-medium">{hora}</span>
      </header>

      {/* Contenido */}
      <main className="flex-1 flex flex-col overflow-auto p-6">
        {/* Botón recargar arriba de la tabla */}
        <div className="flex justify-end mb-4">
          <button
            onClick={recargar}
            className="px-4 py-2 rounded bg-black hover:bg-gray-800 text-white flex items-center gap-2"
            aria-label="Recargar"
          >
            🔄 Recargar
          </button>
        </div>

        {/* Tabla centrada */}
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-6xl bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200 text-black">
            <table className="w-full border-collapse text-left text-lg">
              <thead className="bg-gray-300">
                <tr>
                  <th className="px-6 py-4 text-gray-800">Nombre producto</th>
                  <th className="px-6 py-4 text-gray-800">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((item, i) => (
                  <tr
                    key={item.id}
                    className={i % 2 === 0 ? "bg-white/90" : "bg-gray-100/90"}
                  >
                    <td className="px-6 py-4">{item.nombre}</td>
                    <td className="px-6 py-4">{item.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Botón volver */}
        <div className="mt-6 flex justify-start">
          <button
            onClick={volver}
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Volver
          </button>
        </div>
      </main>
    </div>
  );
}
