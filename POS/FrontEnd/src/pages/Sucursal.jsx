import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Pencil, Trash2Icon } from "lucide-react";

export default function Sucursales() {
  const [sucursales, setSucursales] = useState([]);
  const [hora, setHora] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL_INVENTARIO;
  const navigate = useNavigate();

  const handleClickSucursal = (sucursalId) => {
    navigate(`/inventarioSuc/${sucursalId}`);
  };

  const { sidebarOpen, setSidebarOpen } = useOutletContext();

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
          Sucursales
        </h2>
        <span className="text-gray-600 font-medium">{hora}</span>
      </header>

      {/* Lista de sucursales */}
      <main className="flex-1 p-6 overflow-y-auto flex flex-col items-center">
        {sucursales.length === 0 ? (
          <p className="text-gray-600 text-center">Cargando sucursales...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl w-full">
            {sucursales.map((sucursal) => (
              <div
                key={sucursal.id}
                className="bg-white border rounded-lg flex flex-col justify-between p-4 shadow hover:shadow-lg transition h-40"
              >
                {/* Sección de info: al hacer click abre inventario */}
                <div
                  onClick={() => handleClickSucursal(sucursal.id)}
                  className="flex flex-col items-center justify-center flex-1 cursor-pointer"
                >
                  <p className="font-medium text-gray-700 text-center">
                    {sucursal.descripcion}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Comuna: {sucursal.Comuna}
                  </p>
                </div>

                {/* Botón editar abajo */}
                <div className="mt-3 flex justify-center gap-2">
                  {/* Botón Editar */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // evita que dispare el click de la tarjeta
                      navigate(`/sucursalEdit/${sucursal.id}`);
                    }}
                    className="px-4 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-400 transition flex items-center"
                  >
                    <Pencil className="inline mr-1" /> Editar
                  </button>

                  {/* Botón Eliminar */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // evita que dispare el click de la tarjeta
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
                    className="px-4 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-400 transition flex items-center"
                  >
                    <Trash2Icon className="inline mr-1" /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botones alineados */}
        <div className="mt-8 w-full max-w-6xl flex justify-between">
          <button
            onClick={() => navigate("/SucursalForm")}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-500"
          >
            Agregar
          </button>
        </div>
      </main>
    </div>
  );
}
