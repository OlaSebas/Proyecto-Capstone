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

    const precioRefresco = refresco ? refresco.precio : 0;
    const precioAdicionales = adicionales.reduce((sum, a) => sum + a.precio, 0);
    const total = (producto.precio + precioRefresco + precioAdicionales) * cantidad;

    const toggleAdicional = (adicional) => {
        if (adicionales.find((a) => a.id === adicional.id)) {
            setAdicionales(adicionales.filter((a) => a.id !== adicional.id));
        } else {
            setAdicionales([...adicionales, adicional]);
        }
    };

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row">
                <div className="md:w-1/2">
                    <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
                </div>

                <div className="md:w-1/2 p-6 flex flex-col overflow-y-auto max-h-[90vh]">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold">{producto.nombre}</h2>
                            <p className="text-gray-600">{producto.descripcion}</p>
                        </div>
                        <button onClick={onClose} className="text-red-600 text-xl">✕</button>
                    </div>

                    <h3 className="font-semibold mt-4">Bebida (Opcional)</h3>
                    {refrescosDisponibles.map((r) => (
                        <label key={r.id} className="flex justify-between items-center border-b py-1 cursor-pointer">
                            <div className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="refresco"
                                    checked={refresco?.id === r.id}
                                    onChange={() => setRefresco(r)}
                                />
                                {r.nombre}
                            </div>
                            <span>${r.precio.toLocaleString()}</span>
                        </label>
                    ))}

                    <h3 className="font-semibold mt-4">Adicionales (Opcional)</h3>
                    {adicionalesDisponibles.map((a) => (
                        <label key={a.id} className="flex justify-between items-center border-b py-1 cursor-pointer">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={!!adicionales.find((ad) => ad.id === a.id)}
                                    onChange={() => toggleAdicional(a)}
                                />
                                {a.nombre}
                            </div>
                            <span>${a.precio.toLocaleString()}</span>
                        </label>
                    ))}

                    <h3 className="font-semibold mt-4">Preferencias</h3>
                    <textarea
                        value={preferencias}
                        onChange={(e) => setPreferencias(e.target.value)}
                        placeholder="Cuéntanos algún requisito en especial"
                        className="border rounded p-2 w-full mt-2"
                    />

                    <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="px-3 py-1 bg-gray-200 rounded">-</button>
                            <span>{cantidad}</span>
                            <button onClick={() => setCantidad(cantidad + 1)} className="px-3 py-1 bg-gray-200 rounded">+</button>
                        </div>
                        <button onClick={handleAddToCart} className="bg-red-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-red-700">
                            Agregar ${total.toLocaleString()}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}