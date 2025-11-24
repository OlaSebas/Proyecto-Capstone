import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import { Wallet, CreditCard, Smartphone, DollarSign } from "lucide-react";

export default function MetodoPago() {
  const { id } = useParams(); // ID de la venta
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen } =
    useOutletContext?.() ?? { sidebarOpen: false, setSidebarOpen: () => {} };

  const [hora, setHora] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setHora(
        now.toLocaleTimeString("es-CL", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const seleccionarMetodo = (metodo) => {
    localStorage.setItem("metodoPago", metodo);
    if (metodo === "Efectivo") navigate(`/Efectivo/${id}`);
    else if (metodo === "Débito") navigate(`/Debito/${id}`);
    else if (metodo === "Crédito") navigate(`/Credito/${id}`);
    else if (metodo === "Transferencia") navigate(`/Transferencia/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-white to-red-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {/* HEADER (mismo estilo que los otros módulos) */}
        <header className="mb-6">
          {/* Móvil */}
          <div className="md:hidden bg-white/90 backdrop-blur rounded-xl shadow p-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Abrir/Cerrar barra lateral"
              className="w-full h-10 inline-flex items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              ☰
            </button>

            <div className="mt-3 text-center">
              <Wallet className="mx-auto mb-2 text-red-500" size={28} />
              <h1 className="text-2xl font-extrabold text-gray-900">
                Métodos de pago
              </h1>
              <p className="text-gray-600 text-sm">Venta #{id}</p>
            </div>

            <span className="mt-1 block text-center text-gray-600 font-medium">
              {hora}
            </span>
          </div>

          {/* Desktop / Tablet */}
          <div className="hidden md:flex items-center justify-between bg-white/90 backdrop-blur rounded-xl shadow p-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Abrir/Cerrar barra lateral"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              ☰
            </button>

            <div className="flex items-center gap-3">
              <Wallet className="text-red-500" size={28} />
              <h1 className="text-2xl font-extrabold text-gray-900">
                Métodos de pago — Venta #{id}
              </h1>
            </div>

            <span className="min-w-[120px] text-right text-gray-600 font-medium">
              {hora}
            </span>
          </div>
        </header>

        {/* CONTENIDO */}
        <main className="bg-white/90 rounded-2xl shadow-xl border border-gray-200 p-6">
          {/* Grid de opciones */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {/* Efectivo */}
            <button
              onClick={() => seleccionarMetodo("Efectivo")}
              className="group aspect-square rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex flex-col items-center justify-center gap-3"
            >
              <div className="rounded-full p-3 bg-gray-100 group-hover:scale-105 transition">
                <DollarSign size={28} className="text-gray-800" />
              </div>
              <span className="font-semibold text-gray-800">Efectivo</span>
              <span className="text-xs text-gray-500">Pago en caja</span>
            </button>

            {/* Débito */}
            <button
              onClick={() => seleccionarMetodo("Débito")}
              className="group aspect-square rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex flex-col items-center justify-center gap-3"
            >
              <div className="rounded-full p-3 bg-gray-100 group-hover:scale-105 transition">
                <CreditCard size={28} className="text-gray-800" />
              </div>
              <span className="font-semibold text-gray-800">Débito</span>
              <span className="text-xs text-gray-500">Sin recargo</span>
            </button>

            {/* Crédito */}
            <button
              onClick={() => seleccionarMetodo("Crédito")}
              className="group aspect-square rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex flex-col items-center justify-center gap-3"
            >
              <div className="rounded-full p-3 bg-gray-100 group-hover:scale-105 transition">
                <Wallet size={28} className="text-gray-800" />
              </div>
              <span className="font-semibold text-gray-800">Crédito</span>
              <span className="text-xs text-gray-500">Cuotas disponibles</span>
            </button>

            {/* Transferencia */}
            <button
              onClick={() => seleccionarMetodo("Transferencia")}
              className="group aspect-square rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex flex-col items-center justify-center gap-3"
            >
              <div className="rounded-full p-3 bg-gray-100 group-hover:scale-105 transition">
                <Smartphone size={28} className="text-gray-800" />
              </div>
              <span className="font-semibold text-gray-800">Transferencia</span>
              <span className="text-xs text-gray-500">Banco en línea</span>
            </button>
          </div>

          {/* Separador */}
          <div className="my-6 h-px bg-gray-200" />

          {/* Acciones inferiores */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <p className="text-xs text-gray-600 text-center sm:text-left">
              Selecciona un método para continuar con el pago de la venta #{id}.
            </p>
            <div className="flex justify-center sm:justify-end">
              <button
                onClick={() => navigate("/Carrito")}
                className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
