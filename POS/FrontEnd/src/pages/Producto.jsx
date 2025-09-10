import React, { useState } from "react";

export default function Productos() {
  const [productos] = useState([
    { id: 1, nombre: "Pollo Entero", imagen: "../img/Productos/Pollo-prueba.png" },
    { id: 2, nombre: "Pechuga", imagen: "" },
    { id: 3, nombre: "Trutro", imagen: "" },
    { id: 4, nombre: "Alitas", imagen: "" },
    { id: 5, nombre: "Filete", imagen: "" },
    { id: 7, nombre: "Alitas Suprema", imagen: "" },
    { id: 8, nombre: "Combo Familiar", imagen: "" },
    { id: 9, nombre: "Extra Producto", imagen: "" },
  ]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productos.map((producto) => (
              <div
                key={producto.id}
                className="bg-white border rounded-lg flex flex-col items-center justify-between p-4 shadow hover:shadow-lg transition cursor-pointer"
              >
                <img
                  src={producto.imagen || "https://via.placeholder.com/150"}
                  alt={producto.nombre}
                  className="w-full h-32 object-contain mb-2"
                />
                <p className="font-medium text-gray-700 text-center">
                  {producto.nombre}
                </p>
              </div>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="flex justify-end gap-4 p-4 border-t bg-white shadow-inner">
          <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Cancelar
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Siguiente
          </button>
        </footer>
      </div>
    </div>
  );
}
