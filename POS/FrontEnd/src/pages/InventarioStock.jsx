import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function InventarioStock() {
  const [stock, setStock] = useState([]);
  const { sidebarOpen, setSidebarOpen } = useOutletContext();
  const [hora, setHora] = useState("");
  const [tab, setTab] = useState("productos"); // Tab activa
  const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/";

  const fetchInventario = async () => {
    try {
      const res = await fetch(`${apiUrl}inventario/`, {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setStock(data);
    } catch (error) {
      console.error("Error al cargar inventario:", error);
    }
  };

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
    const intervaloHora = setInterval(actualizarHora, 1000);

    fetchInventario();
    const intervaloInventario = setInterval(fetchInventario, 10000);

    return () => {
      clearInterval(intervaloHora);
      clearInterval(intervaloInventario);
    };
  }, []);

  const recargar = () => fetchInventario();
  const volver = () => window.history.back();

  const productos = stock.filter((item) => item.producto !== null);
  const insumos = stock.filter((item) => item.insumo !== null);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="flex justify-between items-center bg-white shadow px-4 md:px-6 py-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ☰
        </button>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex-1 text-center">
          Inventario de stock
        </h2>
        <span className="text-gray-600 font-medium text-sm md:text-base">{hora}</span>
      </header>

      <main className="flex-1 flex flex-col overflow-auto p-4 md:p-6">
        {/* Tabs + Recargar */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 w-full">
          {/* Tabs centrados */}
          <div className="flex gap-2 justify-center flex-1 flex-wrap">
            <button
              onClick={() => setTab("productos")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${tab === "productos"
                ? "bg-red-700 text-white"
                : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
                }`}
            >
              Productos
            </button>
            <button
              onClick={() => setTab("insumos")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${tab === "insumos"
                ? "bg-red-700 text-white"
                : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
                }`}
            >
              Insumos
            </button>
          </div>

          {/* Botón recargar */}
          <button
            onClick={recargar}
            className="px-4 py-2 rounded bg-black hover:bg-gray-800 text-white text-sm sm:text-base"
          >
            🔄 Recargar
          </button>
        </div>

        {/* Contenido con animación */}
        <div className="flex-1 flex flex-col items-center gap-6 w-full">
          <AnimatePresence mode="wait">
            {tab === "productos" && (
              <motion.div
                key="productos"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-full md:max-w-6xl bg-white shadow-xl rounded-lg overflow-auto border border-gray-200"
              >
                <h3 className="text-xl font-bold bg-gray-400 text-gray-900 px-4 md:px-6 py-3">
                  Productos
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px] border-collapse text-left text-sm md:text-lg">
                    <thead className="bg-gray-300">
                      <tr>
                        <th className="px-4 py-3">Nombre producto</th>
                        <th className="px-4 py-3">Cantidad</th>
                        <th className="px-4 py-3">Sucursal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos.length > 0 ? (
                        productos.map((item, i) => (
                          <tr
                            key={item.id}
                            className={i % 2 === 0 ? "bg-white/90" : "bg-gray-100/90"}
                          >
                            <td className="px-4 py-2">{item.item_descripcion}{item.insumo_descripcion}</td>
                            <td className="px-4 py-2">{item.stock_actual}</td>
                            <td className="px-4 py-2">{item.sucursal_nombre}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="px-4 py-2 text-center text-gray-500">
                            No hay productos disponibles
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {tab === "insumos" && (
              <motion.div
                key="insumos"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-full md:max-w-6xl bg-white shadow-xl rounded-lg overflow-auto border border-gray-200"
              >
                <h3 className="text-xl font-bold bg-gray-400 text-gray-900 px-4 md:px-6 py-3">
                  Insumos
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px] border-collapse text-left text-sm md:text-lg">
                    <thead className="bg-gray-300">
                      <tr>
                        <th className="px-4 py-3">Nombre insumo</th>
                        <th className="px-4 py-3">Cantidad</th>
                        <th className="px-4 py-3">Sucursal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {insumos.length > 0 ? (
                        insumos.map((item, i) => (
                          <tr
                            key={item.id}
                            className={i % 2 === 0 ? "bg-white/90" : "bg-gray-100/90"}
                          >
                            <td className="px-4 py-2">{item.insumo_descripcion}</td>
                            <td className="px-4 py-2">{item.stock_actual}</td>
                            <td className="px-4 py-2">{item.sucursal_nombre}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="px-4 py-2 text-center text-gray-500">
                            No hay insumos disponibles
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Botón volver*/}
          <div className="mt-8 w-full flex justify-center">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              Volver
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
