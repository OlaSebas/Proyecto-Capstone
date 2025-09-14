import { useState, useEffect } from "react";
import { ShoppingCart, Package, UserPlus } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Home() {
  const { sidebarOpen, setSidebarOpen } = useOutletContext();

  const [hora, setHora] = useState("");

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

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header con título centrado y hora */}
      <header className="flex justify-between items-center bg-white shadow px-6 py-4">
        {/* Botón ☰ */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ☰
        </button>

        {/* Título centrado */}
        <h2 className="text-3xl font-bold text-gray-800 flex-1 text-center">
          Bienvenido al Sistema
        </h2>

        {/* Hora */}
        <span className="text-gray-600 font-medium">{hora}</span>
      </header>

      {/* Subtítulo */}
      <div className="flex justify-center mt-6 px-4">
        <p className="text-gray-700 text-lg text-center max-w-2xl">
          Administre las ventas, el inventario, y revise los pedidos a
          proveedores
        </p>
      </div>

      {/* Opciones principales */}
      <main className="flex-1 p-6 overflow-y-auto flex flex-col items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl w-full">
          {/* Opción Ventas */}
          <Link
            to="/venta"
            className="bg-white border rounded-lg flex flex-col items-center justify-center p-8 shadow hover:shadow-lg transition cursor-pointer text-black"
          >
            <ShoppingCart className="w-16 h-16 mb-4 text-gray-700" />
            <p className="font-medium">Ventas</p>
          </Link>

          {/* Opción Inventario */}
          <Link
            to="/inventariostock"
            className="bg-white border rounded-lg flex flex-col items-center justify-center p-8 shadow hover:shadow-lg transition cursor-pointer text-black"
          >
            <Package className="w-16 h-16 mb-4 text-gray-700" />
            <p className="font-medium">Inventario</p>
          </Link>

          {/* Opción Proveedores */}
          <Link
            to="/proveedores"
            className="bg-white border rounded-lg flex flex-col items-center justify-center p-8 shadow hover:shadow-lg transition cursor-pointer text-black"
          >
            <UserPlus className="w-16 h-16 mb-4 text-gray-700" />
            <p className="font-medium">Proveedores</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
