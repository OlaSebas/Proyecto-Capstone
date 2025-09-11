import { useEffect, useState } from "react";
import { Plus, List, Clock } from "lucide-react";

export default function Ventas() {
    const [acciones, setAcciones] = useState([]);
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetch(`${apiUrl}api/ventas/`)
            .then((res) => res.json())
            .then((data) => setAcciones(data.acciones))
            .catch((err) => console.error(err));
    }, []);

    return (
        <div className="flex h-screen w-screen bg-gray-100 flex-col overflow-hidden">
            {/* Header */}
            <header className="flex justify-between items-center p-6 bg-white shadow-md">
                <h2 className="text-3xl font-bold text-gray-800">Ventas</h2>
            </header>

            {/* Grid de acciones con scroll */}
            <main className="flex-1 p-6 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {/* Pedido nuevo */}
                    <div className="bg-white border rounded-lg flex flex-col items-center justify-center p-8 shadow hover:shadow-lg transition cursor-pointer text-black">
                        <Plus className="w-16 h-16 mb-4 text-gray-700" />
                        <p className="font-medium">Pedido nuevo</p>
                    </div>

                    {/* Pedido delivery */}
                    <div className="bg-white border rounded-lg flex flex-col items-center justify-center p-8 shadow hover:shadow-lg transition cursor-pointer text-black">
                        <List className="w-16 h-16 mb-4 text-gray-700" />
                        <p className="font-medium">Pedido delivery</p>
                    </div>

                    {/* Cerrar caja */}
                    <div className="bg-white border rounded-lg flex flex-col items-center justify-center p-8 shadow hover:shadow-lg transition cursor-pointer text-black">
                        <Clock className="w-16 h-16 mb-4 text-gray-700" />
                        <p className="font-medium">Cerrar caja</p>
                    </div>
                </div>
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
    );
}