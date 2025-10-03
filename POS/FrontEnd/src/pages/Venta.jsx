import { useEffect, useState } from "react";
import { Plus, List, Clock } from "lucide-react";
import { useOutletContext, Link } from "react-router-dom";

export default function Ventas() {
  const [acciones, setAcciones] = useState([]);
  const [hora, setHora] = useState("");
  const [cajaAbierta, setCajaAbierta] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  const { sidebarOpen, setSidebarOpen } = useOutletContext();

  // Consultar acciones
  useEffect(() => {
    fetch(`${apiUrl}api/ventas/`)
      .then((res) => res.json())
      .then((data) => setAcciones(data.acciones || []))
      .catch((err) => console.error(err));
  }, [apiUrl]);

  // Consultar si hay sesión de caja activa
  useEffect(() => {
    fetch(`${apiUrl}api/sesion_activa/`, {
      headers: {
        "Authorization": `Token ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setCajaAbierta(data.sesion_activa === true || (data.length && data.length > 0));
      })
      .catch((err) => {
        console.error("Error cargando sesión activa:", err);
        setCajaAbierta(false);
      });
  }, [apiUrl]);

  // Actualizar hora
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

  // Función para cerrar caja
  const cerrarCaja = async () => {
    const montoCierre = prompt("Ingrese monto de cierre:");

    if (!montoCierre) return alert("Debe ingresar un monto para cerrar la caja.");

    try {
      const res = await fetch(`${apiUrl}api/sesion_caja/${localStorage.getItem("sesionCaja")}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          fecha_cierre: new Date().toISOString(),
          monto_final: montoCierre,
          is_active: false,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        console.error("Error cerrando caja:", errData);
        alert("Error cerrando caja");
      } else {
        alert("Caja cerrada exitosamente");
        setCajaAbierta(false);
        handleLogout();
      }
    } catch (err) {
      console.error("Error en la petición de cerrar caja:", err);
      alert("Error cerrando caja");
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/Login";
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
          Ventas
        </h2>

        <span className="text-gray-600 font-medium">{hora}</span>
      </header>

      {/* Grid de acciones */}
      <main className="flex-1 p-6 overflow-y-auto flex flex-col items-center">
        <div className="flex justify-center w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl w-full">
            {/* Pedido nuevo */}
            <Link
              to="/producto"
              className="bg-white border rounded-lg flex flex-col items-center justify-center p-8 shadow hover:shadow-lg transition cursor-pointer text-black"
            >
              <Plus className="w-16 h-16 mb-4 text-gray-700" />
              <p className="font-medium">Pedido nuevo</p>
            </Link>

            {/* Pedido delivery */}
            <Link
              to="/PedidosDelivery"
              className="bg-white border rounded-lg flex flex-col items-center justify-center p-8 shadow hover:shadow-lg transition cursor-pointer text-black"
            >
              <List className="w-16 h-16 mb-4 text-gray-700" />
              <p className="font-medium">Pedido delivery</p>
            </Link>

            {/* Abrir/Cerrar caja */}
            <button
              onClick={cajaAbierta ? cerrarCaja : handleLogout}
              className="bg-white border rounded-lg flex flex-col items-center justify-center p-8 shadow hover:shadow-lg transition cursor-pointer text-black"
            >
              <Clock className="w-16 h-16 mb-4 text-gray-700" />
              <p className="font-medium">
                {cajaAbierta ? "Cerrar caja" : "Abrir caja"}
              </p>
            </button>
          </div>
        </div>

        {/* Botón Volver */}
        <div className="mt-8 w-full flex justify-center">
          <Link
            to="/home"
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Volver
          </Link>
        </div>
      </main>
    </div>
  );
}
