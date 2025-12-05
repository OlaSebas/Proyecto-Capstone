import React, { useState, useEffect, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import PreCarrito from "../components/PreCarrito";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, CupSoda, Drumstick, Package, Tag, PlusCircle } from "lucide-react";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [productoEditar, setProductoEditar] = useState(null);
  const [hora, setHora] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [expandirCarrito, setExpandirCarrito] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [mostrarPromociones, setMostrarPromociones] = useState(false);
  const [mostrarExtras, setMostrarExtras] = useState(false);
  const [cargando, setCargando] = useState(true);

  const { sidebarOpen, setSidebarOpen } =
    useOutletContext?.() ?? { sidebarOpen: false, setSidebarOpen: () => {} };

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  // Obtener productos
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await fetch(`${apiUrl}inventario/productos/`, {
          headers: { Authorization: `Token ${token}` },
        });
        const data = await res.json();
        setProductos(Array.isArray(data) ? data : []);
      } catch {
        setProductos([]);
      }
    };
    fetchProductos();
  }, [apiUrl, token]);

  // Obtener promociones
  useEffect(() => {
    const fetchPromociones = async () => {
      try {
        const res = await fetch(`${apiUrl}inventario/promociones/`, {
          headers: { Authorization: `Token ${token}` },
        });
        const data = await res.json();
        setPromociones(Array.isArray(data) ? data : []);
      } catch {
        setPromociones([]);
      }
    };
    fetchPromociones();
  }, [apiUrl, token]);

  // Obtener categorías
  useEffect(() => {
    const fetchCategorias = async () => {
      setCargando(true);
      try {
        const res = await fetch(`${apiUrl}inventario/categorias/`, {
          headers: { Authorization: `Token ${token}` },
        });
        const data = await res.json();
        setCategorias(Array.isArray(data) ? data : []);
      } catch {
        setCategorias([]);
      } finally {
        setCargando(false);
      }
    };
    fetchCategorias();
  }, [apiUrl, token]);

  // Reloj
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

  // Carrito localStorage
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

  const subtotal = carrito.reduce((sum, item) => sum + (item.total || 0), 0);

  // 🔎 detectar id de categoría "Extras" (si existe)
  const extrasCategoriaId = useMemo(() => {
    const extra = categorias.find(
      (c) =>
        (c.descripcion || c.nombre || "")
          .toString()
          .toLowerCase()
          .includes("extra")
    );
    return extra?.id ?? null;
  }, [categorias]);

  // Filtrados
  const productosFiltrados = productos.filter((producto) => {
    // si estoy mirando promos, oculto productos
    if (mostrarPromociones) return false;

    // si estoy mirando extras, aplico heurística y no mezclo con categoría
    if (mostrarExtras) {
      const esExtraFlag =
        producto?.es_extra === true ||
        producto?.esExtra === true ||
        (producto?.tipo || "").toString().toLowerCase() === "extra";
      const coincideCategoria =
        extrasCategoriaId && producto?.categoria === extrasCategoriaId;

      if (!(esExtraFlag || coincideCategoria)) return false;
    } else if (categoriaSeleccionada && producto.categoria !== categoriaSeleccionada) {
      // categoría normal
      return false;
    }

    return (producto.descripcion || producto.nombre || "")
      .toLowerCase()
      .includes(busqueda.toLowerCase());
  });

  const promocionesFiltradas = promociones.filter((promo) =>
    (promo.descripcion || promo.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  // Íconos para categorías comunes
  const iconosCategorias = {
    Bebestibles: <CupSoda className="w-5 h-5" />,
    Comida: <Drumstick className="w-5 h-5" />,
    Otros: <Package className="w-5 h-5" />,
    Extras: <PlusCircle className="w-5 h-5" />,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-200 via-white to-gray-300">
      {/* HEADER: móvil apilado / desktop alineado */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-3 sm:px-6">
          {/* Móvil */}
          <div className="block md:hidden py-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Abrir/Cerrar barra lateral"
              className="w-full h-10 inline-flex items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              ☰
            </button>
            <div className="mt-3 text-center">
              <h1 className="text-2xl font-extrabold text-gray-900">Productos</h1>
              <p className="mt-1 text-gray-600 font-medium">{hora}</p>
            </div>
          </div>

          {/* Desktop/Tablet */}
          <div className="hidden md:flex items-center justify-between py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Abrir/Cerrar barra lateral"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              ☰
            </button>

            <h1 className="flex-1 px-3 text-center text-3xl font-extrabold text-gray-900">
              Productos
            </h1>

            <span className="min-w-[120px] text-right text-gray-600 font-medium">{hora}</span>
          </div>
        </div>
      </header>

      {/* LOADING CONTROLLER */}
      {cargando ? (
        <main className="flex-1 p-6 flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-3 bg-white/80 backdrop-blur rounded-xl border border-gray-200 shadow-lg px-6 py-8">
            <div className="relative h-14 w-14">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-red-500 border-b-blue-500 animate-spin"></div>
            </div>
            <p className="text-gray-700 font-semibold text-sm sm:text-base">
              Cargando productos, promociones y categorías...
            </p>
          </div>
        </main>
      ) : (
        <>
          {/* CONTENIDO */}
          <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
            {/* Filtros tipo chips */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-5">
              {(categorias || []).slice(0, 3).map((cat) => (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setCategoriaSeleccionada(categoriaSeleccionada === cat.id ? null : cat.id);
                    setMostrarPromociones(false);
                    setMostrarExtras(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all shadow-sm border ${
                    categoriaSeleccionada === cat.id
                      ? "bg-red-600 text-white border-red-700 shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                  }`}
                >
                  {iconosCategorias[cat.descripcion] ?? <Package className="w-5 h-5" />}
                  {cat.descripcion}
                </motion.button>
              ))}

              {/* Chip EXTRAS */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  const next = !mostrarExtras;
                  setMostrarExtras(next);
                  if (next) {
                    setCategoriaSeleccionada(null);
                    setMostrarPromociones(false);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all shadow-sm border ${
                  mostrarExtras
                    ? "bg-red-600 text-white border-red-700 shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                }`}
              >
                <PlusCircle className="w-5 h-5" />
                Extras
              </motion.button>

              {/* Chip PROMOCIONES */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  const next = !mostrarPromociones;
                  setMostrarPromociones(next);
                  if (next) {
                    setCategoriaSeleccionada(null);
                    setMostrarExtras(false);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all shadow-sm border ${
                  mostrarPromociones
                    ? "bg-red-600 text-white border-red-700 shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                }`}
              >
                <Tag className="w-5 h-5" />
                Promociones
              </motion.button>
            </div>

            {/* Buscador (fondo blanco) */}
            <div className="mb-6 w-full max-w-4xl mx-auto px-1">
              <input
                type="text"
                placeholder="Buscar producto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-4 py-3 text-lg sm:text-xl border border-gray-300 rounded-lg shadow-md bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
              />
            </div>

            {/* Grillas */}
            {!mostrarPromociones ? (
              productosFiltrados.length === 0 ? (
                <p className="text-gray-500 text-center">No se encontraron productos.</p>
              ) : (
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl w-full">
                  {productosFiltrados.map((producto) => (
                    <div
                      key={producto.id}
                      onClick={() => setProductoSeleccionado(producto)}
                      className="bg-white/90 border border-gray-200 rounded-xl p-4 shadow hover:shadow-lg transition cursor-pointer h-64 flex flex-col"
                    >
                      <div className="flex-1 flex items-center">
                        <img
                          src={producto.imagen}
                          alt={producto.nombre}
                          className="w-full h-32 object-contain"
                        />
                      </div>
                      <p className="mt-2 font-medium text-gray-800 text-center line-clamp-2">
                        {producto.descripcion || producto.nombre}
                      </p>
                      <p className="text-gray-900 font-extrabold text-center mt-1">
                        ${producto.precio?.toLocaleString?.("es-CL") ?? producto.precio ?? "0"}
                      </p>
                    </div>
                  ))}
                </div>
              )
            ) : promocionesFiltradas.length === 0 ? (
              <p className="text-gray-500 text-center">No se encontraron promociones.</p>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl w-full">
                {promocionesFiltradas.map((promo) => (
                  <div
                    key={promo.id}
                    onClick={() => setProductoSeleccionado(promo)}
                    className="bg-white/90 border border-gray-200 rounded-xl p-4 shadow hover:shadow-lg transition cursor-pointer h-64 flex flex-col"
                  >
                    <div className="flex-1 flex items-center">
                      <img
                        src={promo.imagen}
                        alt={promo.nombre}
                        className="w-full h-32 object-contain"
                      />
                    </div>
                    <p className="mt-2 font-medium text-gray-800 text-center line-clamp-2">
                      {promo.descripcion || promo.nombre}
                    </p>
                    <p className="text-gray-900 font-extrabold text-center mt-1">
                      ${promo.precio?.toLocaleString?.("es-CL") ?? promo.precio ?? "0"}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Volver */}
            <div className="mt-8 w-full flex justify-center">
              <button
                onClick={() => window.history.back()}
                className="px-6 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
              >
                Volver
              </button>
            </div>
          </main>
        </>
      )}

      {/* Modal PreCarrito y edición */}
      {productoSeleccionado && (
        <PreCarrito
          producto={productoSeleccionado}
          onClose={() => setProductoSeleccionado(null)}
          onAddToCart={agregarAlCarrito}
        />
      )}

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

      {/* Bottom-sheet (móvil) / Panel flotante (desktop) */}
      <div
        className={`
          fixed z-40
          ${expandirCarrito ? "bottom-0" : "bottom-3"}
          left-0 right-0
          md:left-auto md:right-6
          md:w-[420px]
        `}
      >
        <motion.div
          animate={{
            height: expandirCarrito ? (window.innerWidth < 768 ? "60vh" : "420px") : "72px",
          }}
          transition={{ duration: 0.35 }}
          className="mx-3 md:mx-0 bg-white/95 backdrop-blur border border-gray-200 shadow-2xl rounded-t-2xl md:rounded-2xl p-4 overflow-hidden flex flex-col"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-base sm:text-lg font-semibold">Resumen del Pedido</h2>
            <button
              onClick={() => setExpandirCarrito(!expandirCarrito)}
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs sm:text-sm"
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
                        alt={item.producto.nombre || item.producto.descripcion}
                        className="w-14 h-14 object-cover rounded"
                      />
                      <div className="flex-1 text-sm">
                        <p className="font-medium flex justify-between gap-2">
                          <span className="truncate">
                            {item.producto.nombre || item.producto.descripcion}
                          </span>
                          <span className="text-gray-900 font-bold">
                            ${item.producto.precio?.toLocaleString?.("es-CL") ?? item.producto.precio}
                          </span>
                        </p>
                        <p className="text-gray-600">Cantidad: {item.cantidad}</p>
                        {item.refresco && (
                          <p className="text-gray-500 text-xs">
                            Bebida: {item.refresco.nombre} ($
                            {item.refresco.precio?.toLocaleString?.("es-CL") ?? item.refresco.precio})
                          </p>
                        )}
                        {item.adicionales?.length > 0 && (
                          <p className="text-gray-500 text-xs">
                            +{" "}
                            {item.adicionales
                              .map((a) => `${a.nombre} ($${a.precio?.toLocaleString?.("es-CL") ?? a.precio})`)
                              .join(", ")}
                          </p>
                        )}
                        <p className="text-gray-900 font-semibold text-sm mt-1">
                          Total: ${item.total?.toLocaleString?.("es-CL") ?? item.total}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editarProducto(index)}
                          className="p-1 bg-gray-900 text-white rounded hover:bg-gray-800"
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
            <div className="mt-3 text-right text-lg font-bold">
              Subtotal: ${subtotal.toLocaleString("es-CL")}
            </div>
          )}

          <button
            onClick={() => navigate("/carrito")}
            className="mt-3 w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-2 rounded-lg font-semibold hover:shadow"
          >
            Ver Pedido
          </button>
        </motion.div>
      </div>
    </div>
  );
}
