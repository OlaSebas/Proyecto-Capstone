import { useState } from "react";

export default function PreCarrito({ producto, onClose, onAddToCart }) {
  const [cantidad, setCantidad] = useState(1);
  const [preferencias, setPreferencias] = useState("");

  const total = (producto?.precio || 0) * cantidad;

  const handleAddToCart = () => {
    const pedido = { producto, cantidad, preferencias, total };
    onAddToCart(pedido);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex min-h-full items-center justify-center bg-black/50 p-4 sm:p-6">
      {/* Modal */}
      <div className="w-full max-w-lg sm:max-w-2xl lg:max-w-4xl rounded-lg overflow-hidden flex flex-col md:flex-row bg-white shadow-2xl max-h-[90vh]">
        {/* Imagen: adaptativa, centrada y sin deformar */}
        <div className="md:w-1/2 bg-white flex items-center justify-center p-3">
          <div
            className="
              w-full 
              h-52 sm:h-64 md:h-[420px] lg:h-[500px] xl:h-[560px] 
              max-h-[70vh]
              bg-gray-50 rounded-md border border-gray-200
              flex items-center justify-center
            "
          >
            <img
              src={producto?.imagen}
              alt={producto?.nombre || "Producto"}
              className="w-full h-full object-contain"
              draggable={false}
            />
          </div>
        </div>

        {/* Panel de opciones */}
        <div className="md:w-1/2 p-4 sm:p-6 flex flex-col overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {producto?.nombre}
              </h2>
              {producto?.descripcion && (
                <p className="text-gray-600">{producto.descripcion}</p>
              )}
              {typeof producto?.precio === "number" && (
                <p className="mt-1 text-red-600 font-semibold">
                  ${producto.precio.toLocaleString("es-CL")}
                </p>
              )}
            </div>

            {/* Cerrar */}
            <button
              onClick={onClose}
              className="text-red-600 text-2xl sm:text-3xl font-bold cursor-pointer select-none p-2 leading-none"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          {/* Preferencias */}
          <h3 className="font-semibold mt-2 sm:mt-4 text-gray-800">Preferencias</h3>
          <textarea
            value={preferencias}
            onChange={(e) => setPreferencias(e.target.value)}
            placeholder="Cuéntanos algún requisito en especial"
            className="border border-gray-300 rounded p-2 w-full mt-2 bg-gray-50 text-gray-800 placeholder-gray-400"
            rows={3}
          />

          {/* Cantidad + Agregar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
            <div className="flex items-center justify-between sm:justify-start gap-4 text-gray-800">
              <button
                onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                className="px-3 py-1.5 bg-gray-100 rounded hover:bg-gray-200"
                aria-label="Disminuir cantidad"
              >
                –
              </button>
              <span className="min-w-[2ch] text-center font-semibold">
                {cantidad}
              </span>
              <button
                onClick={() => setCantidad((c) => c + 1)}
                className="px-3 py-1.5 bg-gray-100 rounded hover:bg-gray-200"
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full sm:w-auto bg-red-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-red-700"
            >
              Agregar ${total.toLocaleString("es-CL")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
