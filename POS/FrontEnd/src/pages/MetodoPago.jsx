import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Wallet, CreditCard, Smartphone, DollarSign } from "lucide-react";

export default function MetodoPago() {
    const navigate = useNavigate();
    const { sidebarOpen, setSidebarOpen } = useOutletContext();
    const [hora, setHora] = useState("");

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
        const intervalo = setInterval(actualizarHora, 1000);
        return () => clearInterval(intervalo);
    }, []);

    const seleccionarMetodo = (metodo) => {
        localStorage.setItem("metodoPago", metodo);
        if (metodo === "Efectivo") {
            navigate("/Efectivo");
        } else {
            alert(`Has seleccionado ${metodo}`);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            {/* Header */}
            <header className="flex justify-between items-center bg-white shadow px-6 py-4 relative">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                    ☰
                </button>

                <h2 className="text-2xl font-bold text-gray-800 flex-1 text-center">
                    Métodos de pago
                </h2>

                <span className="text-gray-600 font-medium">{hora}</span>
            </header>

            {/* Opciones de pago */}
            <main className="flex-1 p-6 flex flex-col items-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8">
                    <button
                        onClick={() => seleccionarMetodo("Efectivo")}
                        className="w-48 h-48 border rounded-lg shadow flex flex-col items-center justify-center hover:bg-gray-200 transition"
                    >
                        <DollarSign size={64} />
                        <span className="mt-4 text-lg font-semibold">Efectivo</span>
                    </button>

                    <button
                        onClick={() => seleccionarMetodo("Débito")}
                        className="w-48 h-48 border rounded-lg shadow flex flex-col items-center justify-center hover:bg-gray-200 transition"
                    >
                        <CreditCard size={64} />
                        <span className="mt-4 text-lg font-semibold">Débito</span>
                    </button>

                    <button
                        onClick={() => seleccionarMetodo("Crédito")}
                        className="w-48 h-48 border rounded-lg shadow flex flex-col items-center justify-center hover:bg-gray-200 transition"
                    >
                        <Wallet size={64} />
                        <span className="mt-4 text-lg font-semibold">Crédito</span>
                    </button>

                    <button
                        onClick={() => seleccionarMetodo("Transferencia")}
                        className="w-48 h-48 border rounded-lg shadow flex flex-col items-center justify-center hover:bg-gray-200 transition"
                    >
                        <Smartphone size={64} />
                        <span className="mt-4 text-lg font-semibold">Transferencia</span>
                    </button>
                </div>

                {/* Botón Cancelar */}
                <div className="mt-12">
                    <button
                        onClick={() => navigate("/carrito")}
                        className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Cancelar
                    </button>
                </div>
            </main>
        </div>
    );
}
