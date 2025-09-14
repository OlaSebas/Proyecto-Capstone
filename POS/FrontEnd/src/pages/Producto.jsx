import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import PreCarrito from "../components/PreCarrito";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [hora, setHora] = useState("");
  const [carrito, setCarrito] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;

  const { sidebarOpen, setSidebarOpen } = useOutletContext();
  const navigate = useNavigate();

  // Cargar productos desde API
  useEffect(() => {
    fetch(`${apiUrl}inventario/productos/`, {
      headers: {
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setProductos(Array.isArray(data) ? data : []))
      .catch(() => setProductos([]));
  }, [apiUrl]);

  // Hora en tiempo real
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

  // Cargar carrito desde Local Storage
  useEffect(() => {
    const carritoGuardado = localStorage.getItem("carrito");
    if (carritoGuardado) setCarrito(JSON.parse(carritoGuardado));
  }, []);

  // Agregar producto al carrito y guardar en Local Storage
  const agregarAlCarrito = (pedido) => {
    const nuevoCarrito = [...carrito, pedido];
    setCarrito(nuevoCarrito);
    localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
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
          Productos
        </h2>
        <span className="text-gray-600 font-medium">{hora}</span>
      </header>

      {/* Botón carrito */}
      <div className="p-4 flex justify-end max-w-6xl w-full mx-auto">
        <button
          onClick={() => navigate("/carrito")}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Ver Carrito ({carrito.length})
        </button>
      </div>

      {/* Grid de productos */}
      <main className="flex-1 p-6 overflow-y-auto flex flex-col items-center">
        {productos.length === 0 ? (
          <p className="text-gray-600 text-center">Cargando productos...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl w-full">
            {productos.map((producto) => (
              <div
                key={producto.id}
                onClick={() => setProductoSeleccionado(producto)}
                className="bg-white border rounded-lg flex flex-col items-center justify-between p-4 shadow hover:shadow-lg transition cursor-pointer h-64"
              >
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="w-full h-32 object-contain mb-2"
                />
                <p className="font-medium text-gray-700 text-center">
                  {producto.descripcion || producto.nombre}
                </p>
                <p className="text-red-600 font-bold">
                  ${producto.precio || "0"}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 w-full flex justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Volver
          </button>
        </div>
      </main>

      {/* Modal PreCarrito */}
      {productoSeleccionado && (
        <PreCarrito
          producto={productoSeleccionado}
          onClose={() => setProductoSeleccionado(null)}
          onAddToCart={agregarAlCarrito}
        />
      )}
    </div>
  );
}