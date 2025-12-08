import React, { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ImagePlus,
  Plus,
  Minus,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Tag,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

export default function GestionPromociones() {
  const [tab, setTab] = useState("agregar");

  // form (agregar/editar)
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // datos
  const [promociones, setPromociones] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);

  // UI
  const [hora, setHora] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [cargando, setCargando] = useState(true);

  // filtros/orden ADMINISTRAR
  const [busquedaPromo, setBusquedaPromo] = useState("");
  const [ordenCol, setOrdenCol] = useState("fecha_inicio");
  const [ordenDir, setOrdenDir] = useState("desc"); // 'asc' | 'desc'

  // filtros AGREGAR
  const [busquedaProd, setBusquedaProd] = useState("");

  const { setSidebarOpen } =
    useOutletContext?.() ?? { sidebarOpen: false, setSidebarOpen: () => {} };

  const apiUrl = import.meta.env.VITE_API_URL_INVENTARIO;

  // reloj
  useEffect(() => {
    const tick = () =>
      setHora(
        new Date().toLocaleTimeString("es-CL", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // carga inicial
  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        setFechaInicio(new Date().toISOString().split("T")[0]);
        await fetchPromociones();
        await fetchProductos();
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  const fetchPromociones = async () => {
    try {
      const res = await fetch(`${apiUrl}promociones/`, {
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPromociones(Array.isArray(data) ? data : []);
    } catch {
      setPromociones([]);
      setMsg({ type: "error", text: "No se pudieron cargar las promociones." });
    }
  };

  const fetchProductos = async () => {
    try {
      const res = await fetch(`${apiUrl}productos/`, {
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : []);
    } catch {
      setProductos([]);
      setMsg({ type: "error", text: "No se pudieron cargar los productos." });
    }
  };

  // -------- AGREGAR --------
  const handleImagenChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagen(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setImagen(null);
      setPreview(null);
    }
  };

  const productosFiltrados = productos.filter((p) =>
    ((p.descripcion || p.nombre || "") + "")
      .toLowerCase()
      .includes(busquedaProd.toLowerCase())
  );

  const agregarProducto = (producto) => {
    setProductosSeleccionados((prev) => {
      const existe = prev.find((x) => x.id === producto.id);
      if (existe)
        return prev.map((x) =>
          x.id === producto.id ? { ...x, cantidad: (x.cantidad || 1) + 1 } : x
        );
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (id, cantidad) => {
    setProductosSeleccionados((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, cantidad: Math.max(1, cantidad || 1) } : p
      )
    );
  };

  const quitarProductoSel = (id) =>
    setProductosSeleccionados((prev) => prev.filter((p) => p.id !== id));

  const limpiarFormulario = () => {
    setDescripcion("");
    setPrecio("");
    setImagen(null);
    setPreview(null);
    setFechaInicio(new Date().toISOString().split("T")[0]);
    setFechaFin("");
    setProductosSeleccionados([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (!descripcion || !precio || !imagen) {
      setMsg({ type: "error", text: "Completa descripción, precio e imagen." });
      return;
    }

    try {
      setCargando(true);
      const formData = new FormData();
      formData.append("descripcion", descripcion);
      formData.append("precio", precio);
      formData.append("fecha_inicio", fechaInicio);
      if (fechaFin) formData.append("fecha_fin", fechaFin);
      formData.append("imagen", imagen);

      const res = await fetch(`${apiUrl}promociones/create/`, {
        method: "POST",
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const nuevaPromocion = await res.json();

      // relaciones producto-promoción
      for (const p of productosSeleccionados) {
        const payload = { promocion: nuevaPromocion.id, producto: p.id, cantidad: p.cantidad };
        const resProd = await fetch(`${apiUrl}promociones_productos/create/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        });
        if (!resProd.ok) {
          console.error("Error asociando producto a promoción:", await resProd.text());
        }
      }

      limpiarFormulario();
      await fetchPromociones();
      setTab("administrar");
      setMsg({ type: "success", text: "Promoción creada correctamente." });
    } catch (err) {
      console.error(err);
      setMsg({ type: "error", text: "No se pudo crear la promoción." });
    } finally {
      setCargando(false);
    }
  };

  // -------- ADMINISTRAR --------
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, id: null, descripcion: "" });
  const [eliminando, setEliminando] = useState(false);
  const [modalEditar, setModalEditar] = useState({ abierto: false, promo: null });

  const abrirModalEliminar = (promo) => {
    setModalEliminar({ abierto: true, id: promo.id, descripcion: promo.descripcion });
  };

  const cancelarEliminar = () => {
    setModalEliminar({ abierto: false, id: null, descripcion: "" });
  };

  const confirmarEliminar = async () => {
    setEliminando(true);
    try {
      const res = await fetch(`${apiUrl}promociones/delete/${modalEliminar.id}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error();
      setPromociones((prev) => prev.filter((p) => p.id !== modalEliminar.id));
      cancelarEliminar();
      setMsg({ type: "success", text: "Promoción eliminada." });
    } catch {
      setMsg({ type: "error", text: "Error al eliminar la promoción." });
    } finally {
      setEliminando(false);
    }
  };

  const abrirModalEditar = (promo) => {
    setModalEditar({ abierto: true, promo });
    setDescripcion(promo.descripcion || "");
    setPrecio(promo.precio || "");
    setPreview(promo.imagen || null);
    setFechaInicio(promo.fecha_inicio || "");
    setFechaFin(promo.fecha_fin || "");
    setImagen(null);
  };

  const cancelarEditar = () => {
    setModalEditar({ abierto: false, promo: null });
    limpiarFormulario();
  };

  const confirmarEditar = async () => {
    const promo = modalEditar.promo;
    if (!promo) return;
    setMsg({ type: "", text: "" });

    try {
      setCargando(true);
      const formData = new FormData();
      formData.append("descripcion", descripcion);
      formData.append("precio", precio);
      formData.append("fecha_inicio", fechaInicio);
      if (fechaFin) formData.append("fecha_fin", fechaFin);
      if (imagen) formData.append("imagen", imagen);

      const res = await fetch(`${apiUrl}promociones/update/${promo.id}/`, {
        method: "PUT",
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
        body: formData,
      });
      if (!res.ok) throw new Error();

      const data = await res.json();
      setPromociones((prev) => prev.map((p) => (p.id === promo.id ? data : p)));
      cancelarEditar();
      setMsg({ type: "success", text: "Promoción actualizada." });
    } catch {
      setMsg({ type: "error", text: "No se pudo actualizar la promoción." });
    } finally {
      setCargando(false);
    }
  };

  // lista filtrada + ordenada
  const promosFiltradasOrdenadas = useMemo(() => {
    const f = promociones.filter((p) => {
      const text = `${p.descripcion ?? ""} ${p.precio ?? ""} ${p.fecha_inicio ?? ""} ${p.fecha_fin ?? ""}`.toLowerCase();
      return text.includes(busquedaPromo.toLowerCase());
    });
    const sorted = [...f].sort((a, b) => {
      const va = ordenCol === "precio" ? Number(a.precio ?? 0) : (a[ordenCol] ?? "");
      const vb = ordenCol === "precio" ? Number(b.precio ?? 0) : (b[ordenCol] ?? "");
      if (va < vb) return ordenDir === "asc" ? -1 : 1;
      if (va > vb) return ordenDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [promociones, busquedaPromo, ordenCol, ordenDir]);

  const toggleOrden = (col) => {
    if (ordenCol === col) {
      setOrdenDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setOrdenCol(col);
      setOrdenDir("asc");
    }
  };

  const OrdenIcon = ({ active }) =>
    active ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />;

  // LOADING CONTROLLER
  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-200 via-white to-gray-300">
        <header className="bg-white/90 backdrop-blur sticky top-0 z-20 shadow">
          <div className="mx-auto max-w-7xl px-3 sm:px-6">
            <div className="block md:hidden py-3">
              <button
                onClick={() => setSidebarOpen((v) => !v)}
                aria-label="Abrir/Cerrar barra lateral"
                className="w-full h-10 inline-flex items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                ☰
              </button>
              <div className="mt-3 text-center">
                <h1 className="text-2xl font-extrabold text-gray-900">
                  Gestión de Promociones
                </h1>
                <p className="mt-1 text-gray-600 font-medium">{hora}</p>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-between py-4">
              <button
                onClick={() => setSidebarOpen((v) => !v)}
                aria-label="Abrir/Cerrar barra lateral"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                ☰
              </button>
              <h1 className="flex-1 px-3 text-center text-3xl font-extrabold text-gray-900">
                Gestión de Promociones
              </h1>
              <span className="min-w-[120px] text-right text-gray-600 font-medium">
                {hora}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-3 bg-white/80 backdrop-blur rounded-xl border border-gray-200 shadow-lg px-6 py-8">
            <div className="relative h-14 w-14">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-red-500 border-b-blue-500 animate-spin"></div>
            </div>
            <p className="text-gray-700 font-semibold text-sm sm:text-base">
              Cargando promociones y productos...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // -------- UI --------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-200 via-white to-gray-300">
      <header className="bg-white/90 backdrop-blur sticky top-0 z-20 shadow">
        <div className="mx-auto max-w-7xl px-3 sm:px-6">
          <div className="block md:hidden py-3">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Abrir/Cerrar barra lateral"
              className="w-full h-10 inline-flex items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              ☰
            </button>
            <div className="mt-3 text-center">
              <h1 className="text-2xl font-extrabold text-gray-900">
                Gestión de Promociones
              </h1>
              <p className="mt-1 text-gray-600 font-medium">{hora}</p>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-between py-4">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Abrir/Cerrar barra lateral"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              ☰
            </button>
            <h1 className="flex-1 px-3 text-center text-3xl font-extrabold text-gray-900">
              Gestión de Promociones
            </h1>
            <span className="min-w-[120px] text-right text-gray-600 font-medium">
              {hora}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {/* mensajes */}
        {msg.text && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
              msg.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {msg.text}
          </motion.div>
        )}

        {/* tabs tipo segmented */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex rounded-full bg-white p-1 shadow-sm border border-gray-200">
            {[
              { key: "agregar", label: "Agregar Promoción", icon: <ImagePlus className="w-4 h-4" /> },
              { key: "administrar", label: "Administrar / Editar", icon: <Tag className="w-4 h-4" /> },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-sm font-medium transition ${
                  tab === t.key ? "bg-red-600 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* contenedor */}
        <div className="w-full bg-white/90 backdrop-blur shadow-lg rounded-xl p-5 sm:p-6 border border-gray-200">
          <AnimatePresence mode="wait">
            {/* -------- AGREGAR -------- */}
            {tab === "agregar" && (
              <motion.div
                key="agregar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col items-center">
                    <label
                      htmlFor="imagen"
                      className="w-44 h-44 sm:w-52 sm:h-52 border-2 border-dashed rounded-xl flex flex-col gap-2 items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden transition-all"
                    >
                      {preview ? (
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <ImagePlus className="w-8 h-8 text-gray-400" />
                          <span className="text-gray-400 text-sm select-none">Subir imagen</span>
                        </>
                      )}
                    </label>
                    <input id="imagen" type="file" accept="image/*" className="hidden" onChange={handleImagenChange} />
                    <p className="text-xs text-gray-500 mt-2">PNG/JPG hasta ~2MB</p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <input
                      type="text"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Descripción"
                      className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                    />
                    <input
                      type="number"
                      value={precio}
                      onChange={(e) => setPrecio(e.target.value)}
                      placeholder="Precio"
                      className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="date"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                      />
                      <input
                        type="date"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                        className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                      />
                    </div>

                    <div className="relative">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        placeholder="Buscar producto..."
                        value={busquedaProd}
                        onChange={(e) => setBusquedaProd(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {productosFiltrados.length ? (
                        productosFiltrados.map((p) => (
                          <div
                            key={p.id}
                            className="border rounded-lg p-3 bg-white hover:bg-gray-50 transition flex flex-col items-center"
                          >
                            <img src={p.imagen} alt={p.descripcion || p.nombre} className="w-16 h-16 object-contain mb-2" />
                            <p className="text-xs sm:text-sm text-center text-gray-800">{p.descripcion || p.nombre}</p>
                            <button
                              type="button"
                              onClick={() => agregarProducto(p)}
                              className="mt-2 px-2 py-1 text-xs bg-gray-900 text-white rounded hover:bg-gray-800"
                            >
                              Agregar
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="col-span-full text-center text-gray-500">No se encontraron productos</p>
                      )}
                    </div>

                    {productosSeleccionados.length > 0 && (
                      <div className="border rounded-xl p-4 mt-4 bg-white/80">
                        <h4 className="font-semibold text-gray-900 mb-3">Productos de la promoción</h4>
                        <ul className="space-y-2">
                          {productosSeleccionados.map((p) => (
                            <li key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <span className="flex-1 text-gray-900">{p.descripcion || p.nombre}</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => cambiarCantidad(p.id, (p.cantidad || 1) - 1)}
                                  className="p-2 rounded bg-gray-100 hover:bg-gray-200"
                                  title="Menos"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={p.cantidad}
                                  onChange={(e) => cambiarCantidad(p.id, parseInt(e.target.value))}
                                  className="w-20 border rounded px-2 py-1"
                                />
                                <button
                                  type="button"
                                  onClick={() => cambiarCantidad(p.id, (p.cantidad || 1) + 1)}
                                  className="p-2 rounded bg-gray-100 hover:bg-gray-200"
                                  title="Más"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => quitarProductoSel(p.id)}
                                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                >
                                  Quitar
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 flex justify-center">
                    <button
                      type="submit"
                      disabled={cargando}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
                    >
                      {cargando ? "Creando..." : "Crear promoción"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* -------- ADMINISTRAR (CON LOADING) -------- */}
            {tab === "administrar" && (
              <motion.div
                key="administrar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Filtros/orden */}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <div className="relative w-full sm:max-w-sm">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      placeholder="Buscar en promociones…"
                      value={busquedaPromo}
                      onChange={(e) => setBusquedaPromo(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => toggleOrden("descripcion")}
                      className={`px-3 py-2 rounded border inline-flex items-center gap-2 ${
                        ordenCol === "descripcion" ? "bg-gray-900 text-white" : "bg-white text-gray-800"
                      }`}
                    >
                      <Filter className="w-4 h-4" />
                      Descripción
                      <OrdenIcon active={ordenCol === "descripcion" && ordenDir === "asc"} />
                    </button>
                    <button
                      onClick={() => toggleOrden("precio")}
                      className={`px-3 py-2 rounded border inline-flex items-center gap-2 ${
                        ordenCol === "precio" ? "bg-gray-900 text-white" : "bg-white text-gray-800"
                      }`}
                    >
                      <Filter className="w-4 h-4" />
                      Precio
                      <OrdenIcon active={ordenCol === "precio" && ordenDir === "asc"} />
                    </button>
                    <button
                      onClick={() => toggleOrden("fecha_inicio")}
                      className={`px-3 py-2 rounded border inline-flex items-center gap-2 ${
                        ordenCol === "fecha_inicio" ? "bg-gray-900 text-white" : "bg-white text-gray-800"
                      }`}
                    >
                      <Filter className="w-4 h-4" />
                      Fecha inicio
                      <OrdenIcon active={ordenCol === "fecha_inicio" && ordenDir === "asc"} />
                    </button>
                  </div>
                </div>

                {/* Tabla (sm+) con mini-loading */}
                <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-left text-gray-900">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3">Imagen</th>
                        <th className="px-4 py-3">Descripción</th>
                        <th className="px-4 py-3">Precio</th>
                        <th className="px-4 py-3">Fechas</th>
                        <th className="px-4 py-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {promosFiltradasOrdenadas.length ? (
                        promosFiltradasOrdenadas.map((p) => (
                          <tr key={p.id} className="border-t hover:bg-gray-50 transition">
                            <td className="px-4 py-3 w-20">
                              <img src={p.imagen} alt={p.descripcion} className="w-12 h-12 object-cover rounded" />
                            </td>
                            <td className="px-4 py-3">{p.descripcion}</td>
                            <td className="px-4 py-3">
                              <span className="font-semibold text-gray-900">
                                ${p.precio?.toLocaleString?.() ?? p.precio}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {p.fecha_inicio} — {p.fecha_fin || "Indefinida"}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => abrirModalEditar(p)}
                                  className="px-3 py-1.5 bg-gray-900 text-white rounded hover:bg-gray-800 text-sm inline-flex items-center gap-1"
                                >
                                  <Pencil className="w-4 h-4" /> Editar
                                </button>
                                <button
                                  onClick={() => abrirModalEliminar(p)}
                                  className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm inline-flex items-center gap-1"
                                >
                                  <Trash2 className="w-4 h-4" /> Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                            No hay promociones
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Cards (móvil) */}
                <ul className="sm:hidden grid grid-cols-1 gap-3">
                  {promosFiltradasOrdenadas.length ? (
                    promosFiltradasOrdenadas.map((p) => (
                      <li key={p.id} className="bg-white/90 border border-gray-200 rounded-xl p-4 shadow-sm">
                        <div className="flex gap-3">
                          <img src={p.imagen} alt={p.descripcion} className="w-16 h-16 object-cover rounded" />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{p.descripcion}</p>
                            <p className="text-gray-900 font-semibold">
                              ${p.precio?.toLocaleString?.() ?? p.precio}
                            </p>
                            <p className="text-gray-600 text-sm">
                              {p.fecha_inicio} — {p.fecha_fin || "Indefinida"}
                            </p>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <button
                                onClick={() => abrirModalEditar(p)}
                                className="px-3 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 inline-flex items-center justify-center gap-1"
                              >
                                <Pencil className="w-4 h-4" /> Editar
                              </button>
                              <button
                                onClick={() => abrirModalEliminar(p)}
                                className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 inline-flex items-center justify-center gap-1"
                              >
                                <Trash2 className="w-4 h-4" /> Eliminar
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">No hay promociones</p>
                  )}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MODAL ELIMINAR (estilo DeleteConfirmModal) */}
        {modalEliminar.abierto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-promo-modal-title"
          >
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={cancelarEliminar}
            />

            <div className="relative w-full max-w-lg mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                      <Trash2 className="w-6 h-6 text-red-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 id="delete-promo-modal-title" className="text-lg font-semibold text-gray-900">
                        Eliminar Promoción
                      </h3>
                      <p className="mt-2 text-sm text-gray-600">
                        ¿Estás seguro de eliminar <span className="font-semibold">"{modalEliminar.descripcion}"</span>? Esta acción no se puede deshacer.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={cancelarEliminar}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-white border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 shadow-sm"
                      disabled={eliminando}
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      onClick={confirmarEliminar}
                      disabled={eliminando}
                      className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold text-white shadow-sm ${
                        eliminando ? "opacity-60 cursor-wait bg-red-400" : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {eliminando && (
                        <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" fill="none" />
                          <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" fill="none" />
                        </svg>
                      )}
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL EDITAR */}
        {modalEditar.abierto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="editar-promo-title"
          >
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={cancelarEditar}
            />

            <div className="relative w-full max-w-full sm:max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                      <Pencil className="w-6 h-6 text-amber-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 id="editar-promo-title" className="text-lg sm:text-xl font-semibold text-gray-900">
                        Editar Promoción
                      </h3>
                      <p className="mt-1 text-sm sm:text-base text-gray-600">
                        Modifica los campos que necesites. Para salir haz clic fuera o en Cerrar.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={cancelarEditar}
                      className="text-gray-500 hover:text-gray-700 ml-2"
                      aria-label="Cerrar"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); confirmarEditar(); }} className="mt-4 sm:mt-6">
                    {cargando ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-amber-500 animate-spin" />
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Descripción</label>
                            <input
                              type="text"
                              value={descripcion}
                              onChange={(e) => setDescripcion(e.target.value)}
                              placeholder="Descripción"
                              className="mt-1 w-full p-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Precio</label>
                            <input
                              type="number"
                              value={precio}
                              onChange={(e) => setPrecio(e.target.value)}
                              placeholder="Precio"
                              className="mt-1 w-full p-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Fecha inicio</label>
                            <input
                              type="date"
                              value={fechaInicio}
                              onChange={(e) => setFechaInicio(e.target.value)}
                              className="mt-1 w-full p-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Fecha fin</label>
                            <input
                              type="date"
                              value={fechaFin}
                              onChange={(e) => setFechaFin(e.target.value)}
                              className="mt-1 w-full p-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Imagen</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImagenChange}
                              className="mt-1 w-full p-2 text-base border border-gray-300 rounded-lg bg-white"
                            />
                            {preview && (
                              <div className="mt-3">
                                <img src={preview} alt="Preview" className="w-full h-auto max-h-56 object-cover rounded-lg" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:justify-end gap-3">
                          <button
                            type="button"
                            onClick={cancelarEditar}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-md bg-white border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 shadow-sm"
                            disabled={cargando}
                          >
                            Cancelar
                          </button>

                          <button
                            type="submit"
                            disabled={cargando}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-sm"
                          >
                            {cargando ? "Guardando..." : "Guardar cambios"}
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}