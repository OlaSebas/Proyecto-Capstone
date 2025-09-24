import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { RefreshCw, Edit, Trash2 } from "lucide-react";

export default function InventarioSuc() {
  const [focused, setFocused] = useState(false);
  const { sucursalId } = useParams();
  const [inventario, setInventario] = useState([]);
  const [hora, setHora] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL_INVENTARIO;
  const { sidebarOpen, setSidebarOpen } = useOutletContext();
  const navigate = useNavigate();

  // Cargar inventario
  useEffect(() => {
    const fetchInventario = async () => {
      try {
        const res = await fetch(`${apiUrl}${sucursalId}/`, {
          headers: { Authorization: `Token ${localStorage.getItem("token")}` },
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

  // Hora
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

  // Acciones
  const volver = () => navigate(-1);
  const recargar = () => {
    fetch(`${apiUrl}${sucursalId}/`, {
      headers: { Authorization: `Token ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setInventario(Array.isArray(data) ? data : []))
      .catch(() => setInventario([]));
  };
  const agregar = () => navigate(-1);
  const editar = (id) => navigate(`/inventario/editar/${id}`);
  const eliminar = (id) => console.log("Eliminar", id);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between bg-white shadow px-4 sm:px-6 py-4 sticky top-0 z-10">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ☰
        </button>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 text-center flex-1">
          Inventario de la sucursal
        </h2>
        <span className="text-gray-600 font-medium text-sm sm:text-base">{hora}</span>
      </header>

      <main className="flex-1 p-4 sm:p-6 overflow-auto">
        {/* Botón recargar */}
        <div className="flex justify-end mb-4">
          <button
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onClick={recargar}
            className="px-4 py-2 rounded bg-black text-white flex items-center gap-2 hover:bg-gray-800"
          >
            <RefreshCw size={18} className={focused ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Recargar</span>
          </button>
        </div>

        {/* Contenedor */}
        <div className="w-full max-w-6xl mx-auto bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
          {/* Desktop: tabla */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-gray-700 border-collapse">
              <thead className="bg-gray-100 text-gray-800">
                <tr>
                  <th className="px-6 py-3">Producto/Insumo</th>
                  <th className="px-6 py-3">Stock actual</th>
                  <th className="px-6 py-3">Unidad</th>
                  <th className="px-6 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {inventario.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No hay inventario para esta sucursal
                    </td>
                  </tr>
                ) : (
                  inventario.map((item, i) => (
                    <tr key={item.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-4">
                        {item.item
                          ? item.item.descripcion
                          : item.insumo.descripcion}
                      </td>
                      <td className="px-6 py-4">{item.stock_actual}</td>
                      <td className="px-6 py-4">
                        {item.item
                          ? item.item.unidad_medida
                          : item.insumo.unidad_medida}
                      </td>
                      <td className="px-6 py-4 flex gap-3">
                        <button
                          onClick={() => editar(item.id)}
                          className="flex items-center gap-1 px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          <Edit size={16} /> Editar
                        </button>
                        <button
                          onClick={() => eliminar(item.id)}
                          className="flex items-center gap-1 px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          <Trash2 size={16} /> Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <div className="md:hidden p-4 grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center">
            {inventario.length === 0 ? (
              <p className="text-gray-500 text-center col-span-full">
                No hay inventario para esta sucursal
              </p>
            ) : (
              inventario.map((item) => (
                <div
                  key={item.id}
                  className="w-full max-w-xs border rounded-lg p-4 shadow-md bg-gray-50 flex flex-col items-center text-center"
                >
                  <p className="font-semibold text-gray-800 text-lg">
                    {item.item ? item.item.descripcion : item.insumo.descripcion}
                  </p>
                  <p className="text-sm text-gray-600">
                    Stock: <span className="font-medium">{item.stock_actual}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Unidad:{" "}
                    {item.item ? item.item.unidad_medida : item.insumo.unidad_medida}
                  </p>
                  <div className="flex w-full gap-3 mt-3">
                    <button
                      onClick={() => editar(item.id)}
                      className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-1"
                    >
                      <Edit size={16} /> Editar
                    </button>
                    <button
                      onClick={() => eliminar(item.id)}
                      className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center gap-1"
                    >
                      <Trash2 size={16} /> Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Botones footer */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between gap-4">
          <button
            onClick={volver}
            className="w-full sm:w-auto px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
          >
            Volver
          </button>
          <button
            onClick={agregar}
            className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Ingresar
          </button>
        </div>
      </main>
    </div>
  );
}
