import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [hora, setHora] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL;

  // Recibir estado del sidebar desde Layout
  const { sidebarOpen, setSidebarOpen } = useOutletContext();

  useEffect(() => {
    fetch(`${apiUrl}inventario/productos/`, {
      headers: {
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProductos(data);
        } else {
          console.error("Data no es un array:", data);
          setProductos([]);
        }
      })
      .catch((err) => {
        console.error("Error al cargar productos:", err);
        setProductos([]);
      });
  }, [apiUrl]);

  // Actualizar hora en tiempo real
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
      {/* Header con botón ☰, título y hora */}
      <header className="flex justify-between items-center bg-white shadow px-6 py-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ☰
        </button>

        <h2 className="text-3xl font-bold text-gray-800 flex-1 text-center">
          Productos
        </h2>

        <span className="text-gray-600 font-medium">{hora}</span>
      </header>

      {/* Grid de productos */}
      <main className="flex-1 p-6 overflow-y-auto flex flex-col items-center">
        {productos.length === 0 ? (
          <p className="text-gray-600 text-center">Cargando productos...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl w-full">
            {productos.map((producto) => (
              <div
                key={producto.id}
                className="bg-white border rounded-lg flex flex-col items-center justify-between p-4 shadow hover:shadow-lg transition cursor-pointer h-64"
              >
                <img
                  src={producto.imagen}
                  alt={producto.descripcion}
                  className="w-full h-32 object-contain mb-2"
                />
                <p className="font-medium text-gray-700 text-center">
                  {producto.descripcion}
                </p>
                <p className="text-red-600 font-bold">${producto.precio}</p>
              </div>
            ))}
          </div>
        )}

        {/* Botón Volver */}
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
