import { useState } from "react";

export default function PreCarrito({ producto, onClose, onAddToCart }) {
  const [cantidad, setCantidad] = useState(1);
  const [refresco, setRefresco] = useState(null);
  const [adicionales, setAdicionales] = useState([]);
  const [preferencias, setPreferencias] = useState("");

  const refrescosDisponibles = [
    { id: 1, nombre: "Coca Cola Original", precio: 1500 },
    { id: 2, nombre: "Coca Cola Zero", precio: 1500 },
    { id: 3, nombre: "Fanta", precio: 1500 },
    { id: 4, nombre: "Sprite", precio: 1500 },
    { id: 5, nombre: "Frucola", precio: 1500 },
  ];

  const adicionalesDisponibles = [
    { id: 1, nombre: "Mayonesa", precio: 500 },
    { id: 2, nombre: "Ketchup", precio: 500 },
    { id: 3, nombre: "Mostaza", precio: 500 },
  ];

  const toggleRefresco = (r) => {
    if (refresco?.id === r.id) setRefresco(null);
    else setRefresco(r);
  };

  const toggleAdicional = (a) => {
    if (adicionales.find((item) => item.id === a.id)) {
      setAdicionales(adicionales.filter((item) => item.id !== a.id));
    } else {
      setAdicionales([...adicionales, a]);
    }
  };

  const total =
    (producto.precio +
      (refresco?.precio || 0) +
      adicionales.reduce((sum, a) => sum + a.precio, 0)) *
    cantidad;

  const handleAddToCart = () => {
    const pedido = {
      producto,
      cantidad,
      refresco,
      adicionales,
      preferencias,
      total,
    };
    onAddToCart(pedido);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none bg-black/50">
      {/* Modal */}
      <div className="w-full max-w-4xl rounded-lg overflow-hidden flex flex-col md:flex-row pointer-events-auto bg-white shadow-2xl">
        {/* Imagen del producto */}
        <div className="md:w-1/2">
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Panel de opciones */}
        <div className="md:w-1/2 p-6 flex flex-col overflow-y-auto max-h-[90vh] bg-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {producto.nombre}
              </h2>
              <p className="text-gray-600">{producto.descripcion}</p>
            </div>
            {/* X para cerrar */}
            <div
              onClick={onClose}
              className="text-red-600 text-3xl font-bold cursor-pointer select-none p-2"
            >
              ✕
            </div>
          </div>

          <h3 className="font-semibold mt-4 text-gray-800">
            Bebida (Opcional)
          </h3>
          {refrescosDisponibles.map((r) => (
            <label
              key={r.id}
              className="flex justify-between items-center border-b border-gray-200 py-1 cursor-pointer text-gray-700"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={refresco?.id === r.id}
                  onChange={() => toggleRefresco(r)}
                />
                {r.nombre}
              </div>
              <span>${r.precio.toLocaleString()}</span>
            </label>
          ))}

          <h3 className="font-semibold mt-4 text-gray-800">
            Adicionales (Opcional)
          </h3>
          {adicionalesDisponibles.map((a) => (
            <label
              key={a.id}
              className="flex justify-between items-center border-b border-gray-200 py-1 cursor-pointer text-gray-700"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!adicionales.find((item) => item.id === a.id)}
                  onChange={() => toggleAdicional(a)}
                />
                {a.nombre}
              </div>
              <span>${a.precio.toLocaleString()}</span>
            </label>
          ))}

          <h3 className="font-semibold mt-4 text-gray-800">Preferencias</h3>
          <textarea
            value={preferencias}
            onChange={(e) => setPreferencias(e.target.value)}
            placeholder="Cuéntanos algún requisito en especial"
            className="border border-gray-300 rounded p-2 w-full mt-2 bg-gray-50 text-gray-800 placeholder-gray-400"
          />

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-4 text-gray-800">
              <button
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                -
              </button>
              <span>{cantidad}</span>
              <button
                onClick={() => setCantidad(cantidad + 1)}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className="bg-red-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-red-700"
            >
              Agregar ${total.toLocaleString()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
