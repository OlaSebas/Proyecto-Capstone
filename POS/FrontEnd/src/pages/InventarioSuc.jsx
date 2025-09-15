import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { RefreshCw } from "lucide-react";

export default function InventarioSuc() {
  const [focused, setFocused] = useState(false);
  const { sucursalId } = useParams();
  const [inventario, setInventario] = useState([]);
  const [hora, setHora] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL_INVENTARIO;
  const { sidebarOpen, setSidebarOpen } = useOutletContext();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInventario = async () => {
      try {
        const res = await fetch(`${apiUrl}${sucursalId}/`, {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) throw new Error("Inventario no encontrado");
        const data = await res.json();
        setInventario(Array.isArray(data) ? data : []);
      } catch (err) {
        setInventario([]);
        console.error(err);
      }
    };
    fetchInventario();
  }, [apiUrl, sucursalId]);

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
    const intervalo = setInterval(actualizarHora, 1000);
    return () => clearInterval(intervalo);
  }, []);

  const volver = () => navigate(-1);

  const recargar = () => {
    fetch(`${apiUrl}inventario/${sucursalId}/`, {
      headers: { Authorization: `Token ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setInventario(Array.isArray(data) ? data : []))
      .catch(() => setInventario([]));
  };

  const agregar = () => navigate(-1);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="flex justify-between items-center bg-white shadow px-6 py-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ☰
        </button>
        <h2 className="text-3xl font-bold text-gray-800 flex-1 text-center">
          Inventario de la sucursal
        </h2>
        <span className="text-gray-600 font-medium">{hora}</span>
      </header>

      {/* Tabla */}
      <main className="flex-1 flex flex-col overflow-auto p-6">
        {/* Botón recargar */}
        <div className="flex justify-end mb-4">
          <button
            className="px-4 py-2 rounded bg-black text-white flex items-center gap-2 focus:outline-none cursor-pointer"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onClick={recargar}
          >
            <RefreshCw size={20} className={focused ? "animate-spin" : ""} />
            Recargar
          </button>
        </div>

        {/* Tabla */}
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-6xl bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200 text-black">
            <table className="w-full border-collapse text-left text-lg">
              <thead className="bg-gray-300">
                <tr>
                  <th className="px-6 py-4 text-gray-800">Producto/Insumo</th>
                  <th className="px-6 py-4 text-gray-800">Stock actual</th>
                </tr>
              </thead>
              <tbody>
                {inventario.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No hay inventario para esta sucursal
                    </td>
                  </tr>
                ) : (
                  inventario.map((item, i) => (
                    <tr
                      key={item.id}
                      className={i % 2 === 0 ? "bg-white/90" : "bg-gray-100/90"}
                    >
                      <td className="px-6 py-4">
                        {item.producto
                          ? item.producto_descripcion
                          : item.insumo_descripcion}
                      </td>
                      <td className="px-6 py-4">{item.stock_actual}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Botón volver */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={volver}
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Volver
          </button>
          <button
            onClick={agregar}
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Agregar
          </button>
        </div>
      </main>
    </div>
  );
}
