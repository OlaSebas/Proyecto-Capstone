import { useState } from "react";

export default function InventarioStock() {
  const [stock] = useState([
    { id: 1, nombre: "Pollos", cantidad: 49 },
    { id: 2, nombre: "Carbón (sacos)", cantidad: 10 },
    { id: 3, nombre: "Potes de salsa", cantidad: 700 },
  ]);

  const recargar = () => {
    console.log("Recargando inventario...");
  };

  const volver = () => {
    window.history.back();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
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
      <main className="flex-1 flex flex-col bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 overflow-auto">
        {/* Sección central */}
        <section className="flex-1 p-8">
          {/* Título + botón recargar */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Inventario de stock</h2>
            <button
              onClick={recargar}
              className="p-2 rounded-md bg-black hover:bg-gray-800 text-white"
              aria-label="Recargar"
            >
              🔄
            </button>
          </div>

          {/* Tabla */}
          <div className="bg-white/95 shadow-xl rounded-lg overflow-hidden w-full border border-gray-200 text-black">
            <table className="w-full border-collapse text-left">
              <thead className="bg-gray-300">
                <tr>
                  <th className="px-6 py-3 text-gray-800">Nombre producto</th>
                  <th className="px-6 py-3 text-gray-800">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((item, i) => (
                  <tr
                    key={item.id}
                    className={i % 2 === 0 ? "bg-white/90" : "bg-gray-100/90"}
                  >
                    <td className="px-6 py-3">{item.nombre}</td>
                    <td className="px-6 py-3">{item.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Botón volver */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={volver}
              className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              Volver
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
