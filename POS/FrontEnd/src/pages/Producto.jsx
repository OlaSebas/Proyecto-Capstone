import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import PreCarrito from "../components/PreCarrito";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [productoEditar, setProductoEditar] = useState(null);
  const [hora, setHora] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [expandirCarrito, setExpandirCarrito] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  const { sidebarOpen, setSidebarOpen } = useOutletContext();
  const navigate = useNavigate();

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

  useEffect(() => {
    const carritoGuardado = localStorage.getItem("carrito");
    if (carritoGuardado) setCarrito(JSON.parse(carritoGuardado));
  }, []);

  const guardarCarrito = (nuevoCarrito) => {
    setCarrito(nuevoCarrito);
    localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
  };

  const agregarAlCarrito = (pedido) => {
    const nuevoCarrito = [...carrito, pedido];
    guardarCarrito(nuevoCarrito);
    setExpandirCarrito(true);
  };

  const eliminarProducto = (index) => {
    const nuevoCarrito = carrito.filter((_, i) => i !== index);
    guardarCarrito(nuevoCarrito);
  };

  const editarProducto = (index) => {
    setProductoEditar({ ...carrito[index], index });
  };

  const guardarEdicion = (pedidoEditado) => {
    const nuevoCarrito = [...carrito];
    nuevoCarrito[pedidoEditado.index] = { ...pedidoEditado };
    guardarCarrito(nuevoCarrito);
    setProductoEditar(null);
  };

  const subtotal = carrito.reduce((sum, item) => sum + item.total, 0);

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

      {/* Modal PreCarrito agregar */}
      {productoSeleccionado && (
        <PreCarrito
          producto={productoSeleccionado}
          onClose={() => setProductoSeleccionado(null)}
          onAddToCart={agregarAlCarrito}
        />
      )}

      {/* Modal PreCarrito editar */}
      {productoEditar && (
        <PreCarrito
          producto={productoEditar.producto}
          cantidadInicial={productoEditar.cantidad}
          refrescoInicial={productoEditar.refresco}
          adicionalesInicial={productoEditar.adicionales}
          onClose={() => setProductoEditar(null)}
          onAddToCart={(pedido) =>
            guardarEdicion({ ...pedido, index: productoEditar.index })
          }
        />
      )}

      {/* Drop-up Carrito */}
      <div className="fixed bottom-0 right-4 w-96">
        <motion.div
          animate={{ height: expandirCarrito ? "400px" : "70px" }}
          transition={{ duration: 0.4 }}
          className="bg-white border border-gray-200 shadow-xl rounded-t-xl p-4 overflow-hidden flex flex-col"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Resumen del Pedido</h2>
            <button
              onClick={() => setExpandirCarrito(!expandirCarrito)}
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
            >
              {expandirCarrito ? "Replegar" : "Desplegar"}
            </button>
          </div>

          <AnimatePresence>
            {expandirCarrito && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-y-auto space-y-3 mt-2"
              >
                {carrito.length === 0 ? (
                  <p className="text-gray-500">Tu carrito está vacío</p>
                ) : (
                  carrito.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border-b pb-2 gap-3"
                    >
                      <img
                        src={item.producto.imagen}
                        alt={item.producto.nombre}
                        className="w-14 h-14 object-cover rounded"
                      />
                      <div className="flex-1 text-sm">
                        {/* Precio base en rojo */}
                        <p className="font-medium flex justify-between">
                          {item.producto.nombre || item.producto.descripcion}
                          <span className="text-red-600 font-bold">
                            ${item.producto.precio.toLocaleString()}
                          </span>
                        </p>
                        <p className="text-gray-500">
                          Cantidad: {item.cantidad}
                        </p>
                        {item.refresco && (
                          <p className="text-gray-500 text-xs">
                            Bebida: {item.refresco.nombre} (${item.refresco.precio.toLocaleString()})
                          </p>
                        )}
                        {item.adicionales?.length > 0 && (
                          <p className="text-gray-500 text-xs">
                            + {item.adicionales.map((a) => `${a.nombre} ($${a.precio.toLocaleString()})`).join(", ")}
                          </p>
                        )}
                        {/* Total por producto (cantidad + extras) */}
                        <p className="text-gray-800 font-semibold text-sm mt-1">
                          Total: ${item.total.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editarProducto(index)}
                          className="p-1 bg-gray-800 text-white rounded hover:bg-gray-900"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => eliminarProducto(index)}
                          className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {expandirCarrito && (
            <div className="mt-4 text-right text-lg font-bold">
              Subtotal: ${subtotal.toLocaleString()}
            </div>
          )}

          <button
            onClick={() => navigate("/carrito")}
            className="mt-3 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-orange-700"
          >
            Ver Pedido
          </button>
        </motion.div>
      </div>
    </div>
  );
}
