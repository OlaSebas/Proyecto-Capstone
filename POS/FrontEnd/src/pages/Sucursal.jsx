import { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useOutletContext, useNavigate } from "react-router-dom";

export default function Sucursales() {
  const { sidebarOpen, setSidebarOpen } = useOutletContext();
  const [sucursales, setSucursales] = useState([]);
  const [hora, setHora] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL_INVENTARIO;
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${apiUrl}sucursales/`, {
      headers: {
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setSucursales(Array.isArray(data) ? data : []))
      .catch(() => setSucursales([]));
  }, [apiUrl]);

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

        {/* Título */}
        <h2 className="text-3xl font-bold text-gray-800 flex-1 text-center">
          Sucursales
        </h2>

        {/* Hora */}
        <span className="text-gray-600 font-medium">{hora}</span>
      </header>

      {/* Subtítulo */}
      <div className="flex justify-center mt-6 px-4">
        <p className="text-gray-700 text-lg text-center max-w-2xl">
          Administre las sucursales disponibles en el sistema
        </p>
      </div>

      {/* Cards de sucursales */}
      <main className="flex-1 p-6 overflow-y-auto flex flex-col items-center">
        {sucursales.length === 0 ? (
          <p className="text-gray-600 text-center">Cargando sucursales...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl w-full">
            {sucursales.map((sucursal) => (
              <div
                key={sucursal.id}
                onClick={() => navigate(`/inventarioSuc/${sucursal.id}`)}
                className={`bg-white border rounded-lg flex flex-col items-center justify-between shadow hover:shadow-lg transition cursor-pointer text-center ${
                  sidebarOpen ? "p-6" : "p-8"
                }`}
              >
                <p
                  className={`font-semibold text-gray-800 mb-2 transition-all ${
                    sidebarOpen ? "text-base" : "text-lg"
                  }`}
                >
                  {sucursal.descripcion}
                </p>
                <p
                  className={`text-gray-500 mb-4 transition-all ${
                    sidebarOpen ? "text-xs" : "text-sm"
                  }`}
                >
                  Comuna: {sucursal.Comuna}
                </p>

                {/* Botones */}
                <div className="flex gap-2 w-full justify-center mt-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/sucursalEdit/${sucursal.id}`);
                    }}
                    className={`flex-1 max-w-[100px] text-white rounded-lg hover:bg-blue-600 transition flex items-center justify-center ${
                      sidebarOpen
                        ? "px-2 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-900"
                        : "px-3 py-2 text-sm bg-gray-800 text-white rounded hover:bg-gray-900"
                    }`}
                  >
                    <Pencil size={sidebarOpen ? 14 : 16} /> Editar
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm(
                          `¿Seguro que quieres eliminar la sucursal ${sucursal.descripcion}?`
                        )
                      ) {
                        fetch(`${apiUrl}sucursales/delete/${sucursal.id}/`, {
                          method: "DELETE",
                          headers: {
                            Authorization: `Token ${localStorage.getItem(
                              "token"
                            )}`,
                          },
                        })
                          .then((res) => {
                            if (!res.ok)
                              throw new Error("Error al eliminar sucursal");
                            setSucursales((prev) =>
                              prev.filter((s) => s.id !== sucursal.id)
                            );
                          })
                          .catch((err) => alert(err.message));
                      }
                    }}
                    className={`flex-1 max-w-[100px] text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center ${
                      sidebarOpen
                        ? "px-2 py-1 text-xs bg-red-500"
                        : "px-3 py-2 text-sm bg-red-500"
                    }`}
                  >
                    <Trash2 size={sidebarOpen ? 14 : 16} /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botón agregar */}
        <div className="mt-8 w-full max-w-4xl flex justify-end">
          <button
            onClick={() => navigate("/SucursalForm")}
            className={`text-white rounded-lg hover:bg-gray-800 transition ${
              sidebarOpen
                ? "px-4 py-2 text-sm bg-gray-900"
                : "px-6 py-2 bg-gray-900"
            }`}
          >
            Agregar
          </button>
        </div>
      </main>
    </div>
  );
}
