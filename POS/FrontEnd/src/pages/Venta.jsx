import { useEffect, useState } from "react";
import { Plus, List, Clock } from "lucide-react";
import { useOutletContext, Link } from "react-router-dom";
import CerrarCajaModal from "../components/CerrarCajaModal";

export default function Ventas() {
  const [hora, setHora] = useState("");
  const [cajaAbierta, setCajaAbierta] = useState(false);
  const [modalCerrarCaja, setModalCerrarCaja] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  const { setSidebarOpen } =
    useOutletContext?.() ?? { sidebarOpen: false, setSidebarOpen: () => {} };

  // Consultar si hay sesión de caja activa
  useEffect(() => {
    const cargarSesion = async () => {
      try {
        // Paso 1: Verificar si hay sesión activa
        const res1 = await fetch(`${apiUrl}api/sesion_activa/`, {
          headers: { Authorization: `Token ${localStorage.getItem("token")}` },
        });
        const data1 = await res1.json();
        

        if (data1?.sesion_activa === true) {
          setCajaAbierta(true);

          // Paso 2: Obtener el ID de la sesión activa
          const res2 = await fetch(`${apiUrl}api/sesion_caja/`, {
            headers: { Authorization: `Token ${localStorage.getItem("token")}` },
          });
          const data2 = await res2.json();
          
          if (Array.isArray(data2)) {
            const sesionActiva = data2.find((s) => s.is_active === true);
            if (sesionActiva) {
              localStorage.setItem("sesionCaja", sesionActiva.id);
            } else {
            
            }
          } else {
            
          }
        } else {
          setCajaAbierta(false);
        }
      } catch (err) {
        setCajaAbierta(false);
      }
    };

    cargarSesion();
  }, [apiUrl]);

  // Reloj
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

  // Cerrar caja con modal
  const cerrarCaja = async (montoCierre) => {
    setCerrando(true);
    try {
      const sesionId = localStorage.getItem("sesionCaja");
      if (!sesionId) {
        alert("No hay sesión de caja activa");
        setModalCerrarCaja(false);
        setCerrando(false);
        return;
      }

      const payload = {
        fecha_cierre: new Date().toISOString(),
        monto_final: parseFloat(montoCierre),
        is_active: false,
      };

      const res = await fetch(
        `${apiUrl}api/sesion_caja/${sesionId}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {

        alert(`Error cerrando caja: ${JSON.stringify(data)}`);
      } else {
 
        alert("Caja cerrada exitosamente");
        setCajaAbierta(false);
        sessionStorage.clear();
        localStorage.removeItem("token");
        localStorage.removeItem("sesionCaja");
        setModalCerrarCaja(false);
        handleLogout();
      }
    } catch (err) {
      alert(`Error cerrando caja: ${err.message}`);
    } finally {
      setCerrando(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/Login";
  };

  const handleClickCaja = () => {
    if (cajaAbierta) {
      setModalCerrarCaja(true);
    } else {
      handleLogout();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-200 via-white to-gray-300">
      {/* HEADER (móvil apilado / desktop alineado) */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-3 sm:px-6">
          {/* Móvil */}
          <div className="block md:hidden py-3">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Abrir/Cerrar barra lateral"
              className="w-full h-10 inline-flex items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              ☰
            </button>

            <div className="mt-3 text-center">
              <h1 className="text-2xl font-extrabold text-gray-900">Ventas</h1>
              <p className="mt-1 text-gray-600 font-medium">{hora}</p>
            </div>
          </div>

          {/* Desktop/Tablet */}
          <div className="hidden md:flex items-center justify-between py-4">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Abrir/Cerrar barra lateral"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              ☰
            </button>

            <h1 className="flex-1 px-3 text-center text-3xl font-extrabold text-gray-900">
              Ventas
            </h1>

            <span className="min-w-[120px] text-right text-gray-600 font-medium">
              {hora}
            </span>
          </div>
        </div>
      </header>

      {/* MODAL CERRAR CAJA */}
      <CerrarCajaModal
        open={modalCerrarCaja}
        loading={cerrando}
        onConfirm={cerrarCaja}
        onCancel={() => setModalCerrarCaja(false)}
      />

      {/* CONTENIDO */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* Grid de acciones centrada */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
          {/* Pedido nuevo */}
          <Link
            to="/producto"
            className="group w-full sm:w-[320px] md:w-[360px] min-h-[220px] rounded-2xl bg-white/90 backdrop-blur border border-gray-200 shadow hover:shadow-lg transition-shadow p-8 sm:p-10 flex flex-col items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-300"
            aria-label="Pedido nuevo"
          >
            <div className="rounded-full p-4 sm:p-5 bg-gray-100 group-hover:bg-gray-200 transition">
              <Plus className="w-14 h-14 text-gray-700" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-gray-900">Pedido nuevo</h3>
            <p className="mt-2 text-sm sm:text-base text-gray-600 text-center">
              Crea una venta rápida desde el catálogo.
            </p>
          </Link>

          {/* Abrir/Cerrar caja */}
          <button
            onClick={handleClickCaja}
            className="group w-full sm:w-[320px] md:w-[360px] min-h-[220px] rounded-2xl bg-white/90 backdrop-blur border border-gray-200 shadow hover:shadow-lg transition-shadow p-8 sm:p-10 flex flex-col items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-300"
            aria-label={cajaAbierta ? "Cerrar caja" : "Abrir caja"}
          >
            <div className="rounded-full p-4 sm:p-5 bg-gray-100 group-hover:bg-gray-200 transition">
              <Clock className="w-14 h-14 text-gray-700" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-gray-900">
              {cajaAbierta ? "Cerrar caja" : "Abrir caja"}
            </h3>
            <p className="mt-2 text-sm sm:text-base text-gray-600 text-center">
              {cajaAbierta
                ? "Finaliza la sesión de caja actual."
                : "Inicia sesión de caja para comenzar a vender."}
            </p>
          </button>
        </div>

        {/* Botón Volver (gris oscuro casi negro) */}
        <div className="mt-10 w-full flex justify-center">
          <Link
            to="/home"
            className="px-6 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Volver
          </Link>
        </div>
      </main>
    </div>
  );
}
