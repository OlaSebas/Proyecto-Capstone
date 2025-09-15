import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";

export default function Sucursales() {
  const [sucursales, setSucursales] = useState([]);
  const [hora, setHora] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const handleClickSucursal = (sucursalId) => {
    navigate(`/inventarioSuc/${sucursalId}`);
  };

  const { sidebarOpen, setSidebarOpen } = useOutletContext();

  useEffect(() => {
    fetch(`${apiUrl}inventario/sucursales/`, {
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
                onClick={() => handleClickSucursal(sucursal.id)}
                className="bg-white border rounded-lg flex flex-col items-center justify-center p-4 shadow hover:shadow-lg transition cursor-pointer h-32"
              >
                <p className="font-medium text-gray-700 text-center">
                  {sucursal.descripcion}
                </p>
                <p className="text-gray-500 text-sm">
                  Comuna: {sucursal.Comuna}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 w-full flex justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Volver
          </button>
        </div>
      </main>
    </div>
  );
}
