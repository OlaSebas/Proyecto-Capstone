import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

export default function PedidosDelivery() {
    const { sidebarOpen, setSidebarOpen } = useOutletContext();

    const [hora, setHora] = useState("");
    const [pedidos, setPedidos] = useState([
        {
            id: 1,
            cliente: "Alon Ramirez",
            empresa: "Rappi",
            pago: "Débito",
            pedido: "1/4 pollo + papas fritas + bebida 1.5L",
            estado: "pendiente",
        },
        {
            id: 2,
            cliente: "Chiquitín Galliardo",
            empresa: "Uber Eats",
            pago: "Efectivo",
            pedido: "Bebida 1.5L",
            estado: "pendiente",
        },
    ]);

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

    const volver = () => {
        window.history.back();
    };

    // Cambiar estado del pedido a "listo"
    const marcarListo = (id) => {
        setPedidos((prev) =>
            prev.map((p) =>
                p.id === id ? { ...p, estado: "listo" } : p
            )
        );
    };

    // Eliminar pedido cuando se entregue
    const entregarPedido = (id) => {
        setPedidos((prev) => prev.filter((p) => p.id !== id));
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            {/* Header */}
            <header className="flex justify-between items-center bg-white shadow px-6 py-4">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                    ☰
                </button>
                <h2 className="text-3xl font-bold text-gray-800 flex-1 text-center">
                    Pedidos Delivery
                </h2>
                <span className="text-gray-600 font-medium">{hora}</span>
            </header>

            {/* Contenido */}
            <main className="flex-1 flex flex-col overflow-auto p-6">
                <div className="flex-1 flex justify-center">
                    <div
                        className={`w-full max-w-6xl bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200 text-black ${pedidos.length > 6 ? "max-h-[500px] overflow-y-auto" : "max-h-fit"
                            }`}
                    >
                        <table className="w-full border-collapse text-left text-lg">
                            <thead className="bg-gray-300 sticky top-0">
                                <tr>
                                    <th className="px-6 py-4 text-gray-800">Cliente</th>
                                    <th className="px-6 py-4 text-gray-800">Empresa</th>
                                    <th className="px-6 py-4 text-gray-800">Pago</th>
                                    <th className="px-6 py-4 text-gray-800">Pedido</th>
                                    <th className="px-6 py-4 text-gray-800">Estado</th>
                                    <th className="px-6 py-4 text-gray-800">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pedidos.map((p, i) => (
                                    <tr
                                        key={p.id}
                                        className={i % 2 === 0 ? "bg-white/90" : "bg-gray-100/90"}
                                    >
                                        <td className="px-6 py-4">{p.cliente}</td>
                                        <td className="px-6 py-4">{p.empresa}</td>
                                        <td className="px-6 py-4">{p.pago}</td>
                                        <td className="px-6 py-4">{p.pedido}</td>
                                        <td className="px-6 py-4">
                                            {p.estado === "pendiente" ? (
                                                <span className="px-2 py-1 bg-red-200 text-red-800 rounded">
                                                    Pendiente
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-green-200 text-green-800 rounded">
                                                    Listo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 flex gap-2">
                                            {p.estado === "pendiente" ? (
                                                <button
                                                    onClick={() => marcarListo(p.id)}
                                                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                                >
                                                    Marcar listo
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => entregarPedido(p.id)}
                                                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                                >
                                                    Entregado
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
            </main>
        </div>
    );
}
