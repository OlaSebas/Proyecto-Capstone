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
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      {/* Contenido principal */}
      <main className="flex-1 flex justify-start overflow-auto">
        <section className="flex-1 max-w-5xl mx-6 my-8 flex flex-col">
          <div className="flex justify-between items-center mb-6 flex-wrap">
            <h2 className="text-3xl font-bold text-gray-800">Inventario de stock</h2>
            <button
              onClick={recargar}
              className="p-2 rounded-md bg-black hover:bg-gray-800 text-white mt-2 sm:mt-0"
              aria-label="Recargar"
            >
              🔄
            </button>
          </div>

          {/* Tabla */}
          <div className="bg-white shadow-xl rounded-lg overflow-hidden w-full border border-gray-200 text-black">
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
          <div className="mt-6 flex justify-start">
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
