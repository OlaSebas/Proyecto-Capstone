import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

export default function Proveedores() {
    const { sidebarOpen, setSidebarOpen } = useOutletContext();
    const [proveedores, setProveedores] = useState([]);
    const [hora, setHora] = useState("");

    // Simulación de datos (mock)
    const proveedoresMock = [
        {
            id: 1,
            proveedor: "Coca Cola",
            cantidad: 4,
            pedido: "Caja Coca 237ml",
            dia_reporte: "Martes 2 Septiembre",
        },
        {
            id: 2,
            proveedor: "Coca Cola",
            cantidad: 2,
            pedido: "Caja Fanta 237ml",
            dia_reporte: "Martes 2 Septiembre",
        },
        {
            id: 3,
            proveedor: "Nestlé",
            cantidad: 10,
            pedido: "Caja Leche Entera",
            dia_reporte: "Miércoles 3 Septiembre",
        },
    ];

    // Función que en el futuro llamará a la API
    const fetchProveedores = async () => {
        try {
            // 🔹 Aquí reemplazarás el mock por la llamada a la API real
            // const res = await fetch(`${apiUrl}proveedores/`);
            // const data = await res.json();
            // setProveedores(data);

            setProveedores(proveedoresMock); // datos simulados
        } catch (error) {
            console.error("Error al cargar proveedores:", error);
        }
    };

    useEffect(() => {
        const actualizarHora = () => {
            const now = new Date();
            setHora(
                now.toLocaleTimeString("es-CL", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                })
            );
        };

        actualizarHora();
        const intervaloHora = setInterval(actualizarHora, 1000);

        fetchProveedores();

        return () => clearInterval(intervaloHora);
    }, []);

    const volver = () => window.history.back();

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
                    Proveedores
                </h2>
                <span className="text-gray-600 font-medium">{hora}</span>
            </header>

            {/* Contenido */}
            <main className="flex-1 flex flex-col overflow-auto p-6">
                <div className="flex justify-end mb-4">
                    <button
                        onClick={fetchProveedores}
                        className="px-4 py-2 rounded bg-black hover:bg-gray-800 text-white flex items-center gap-2"
                    >
                        🔄 Recargar
                    </button>
                </div>

                {/* Tabla proveedores */}
                <div className="w-full max-w-6xl bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200 mx-auto">
                    <table className="w-full border-collapse text-left text-lg">
                        <thead className="bg-gray-300">
                            <tr>
                                <th className="px-6 py-4">Proveedor</th>
                                <th className="px-6 py-4">Cantidad</th>
                                <th className="px-6 py-4">Pedido</th>
                                <th className="px-6 py-4">Día de Reporte</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proveedores.length > 0 ? (
                                proveedores.map((item, i) => (
                                    <tr
                                        key={item.id}
                                        className={i % 2 === 0 ? "bg-white/90" : "bg-gray-100/90"}
                                    >
                                        <td className="px-6 py-4">{item.proveedor}</td>
                                        <td className="px-6 py-4">{item.cantidad}</td>
                                        <td className="px-6 py-4">{item.pedido}</td>
                                        <td className="px-6 py-4">{item.dia_reporte}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="px-6 py-4 text-center text-gray-500"
                                    >
                                        No hay proveedores registrados
                                    </td>
                                </tr>
                            )}
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
            </main>
        </div>
    );
}
