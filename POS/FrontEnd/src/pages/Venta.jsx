import { useEffect, useState } from "react";

export default function Ventas() {
  const [acciones, setAcciones] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${apiUrl}ventas/`)
      .then((res) => res.json())
      .then((data) => setAcciones(data.acciones))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Barra lateral */}
      <aside className="hidden md:flex md:w-64 bg-gradient-to-b from-red-600 to-red-400 text-white p-6 flex-col">
        <h2 className="text-2xl font-bold mb-8">Danny Pollos</h2>
        <nav className="flex flex-col gap-4 text-lg">
          <button className="p-2 rounded hover:bg-red-700">Inicio</button>
          <button className="p-2 rounded hover:bg-red-700">Venta</button>
          <button className="p-2 rounded hover:bg-red-700">Inventario</button>
          <button className="p-2 rounded hover:bg-red-700">Proveedores</button>
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-6 flex flex-col bg-gray-100 overflow-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-4xl font-extrabold text-gray-800">Ventas</h1>
          <div className="flex gap-3">
            <button className="px-5 py-2 rounded bg-gray-200 hover:bg-gray-300 text-lg">
              Inicio
            </button>
            <button className="px-5 py-2 rounded bg-red-500 text-white hover:bg-red-600 text-lg">
              Cerrar sesión
            </button>
          </div>
        </header>

        {/* Opciones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full max-w-7xl mx-auto">
          {acciones.map((accion) => (
            <div
              key={accion.id}
              className="bg-white shadow-lg rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:shadow-2xl hover:bg-red-50 transition transform hover:scale-105"
            >
              {/* Ícono de ejemplo */}
              <span className="text-6xl mb-4">🍗</span>
              <p className="font-semibold text-gray-700 text-xl text-center">
                {accion.nombre}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
