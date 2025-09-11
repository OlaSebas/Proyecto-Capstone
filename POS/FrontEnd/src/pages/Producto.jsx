import React, { useState, useEffect } from "react";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;

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
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center p-6 bg-white shadow-md">
          <h2 className="text-3xl font-bold text-gray-800">Productos</h2>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              Inicio
            </button>
            <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              Cerrar Sesión
            </button>
          </div>
        </header>

        {/* Grid de productos con scroll */}
        <main className="flex-1 p-6 overflow-y-auto">
          {productos.length === 0 ? (
            <p className="text-gray-600 text-center">Cargando productos...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {productos.map((producto) => (
                <div
                  key={producto.id}
                  className="bg-white border rounded-lg flex flex-col items-center justify-between p-4 shadow hover:shadow-lg transition cursor-pointer"
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
          <div className="mt-8 w-full flex justify-start">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              Volver
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}