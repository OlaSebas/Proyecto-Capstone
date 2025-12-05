import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { CupSoda, Drumstick, Package, Filter, Pencil, Trash2, X } from "lucide-react";

export default function GestionProductos() {
  const [tab, setTab] = useState("agregar");
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [hora, setHora] = useState("");

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);

  const [modalEliminar, setModalEliminar] = useState({ abierto: false, productoId: null });
  const [modalEditar, setModalEditar] = useState({ abierto: false, producto: null });

  const [msg, setMsg] = useState({ type: "", text: "" }); // mensajes inline

  const apiUrl = import.meta.env.VITE_API_URL_INVENTARIO;
  const { setSidebarOpen } =
    useOutletContext?.() ?? { sidebarOpen: false, setSidebarOpen: () => {} };

  // NEW states to preserve original image and manage temp objectURL
  const [originalPreview, setOriginalPreview] = useState(null);
  const [tempObjectUrl, setTempObjectUrl] = useState(null);

  // Nuevo estado: categoría para el formulario "Agregar"
  const [newCategoria, setNewCategoria] = useState("");

  // ===== helpers =====
  const formatCLP = (v) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(Number(v ?? 0));

  // Reloj
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

  // Cargar productos y categorías
  const fetchProductos = async () => {
    try {
      const res = await fetch(`${apiUrl}productos/`, {
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar productos:", err);
      setMsg({ type: "error", text: "No se pudieron cargar los productos." });
    }
  };

  const fetchCategorias = async () => {
    try {
      const res = await fetch(`${apiUrl}categorias/`, {
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setCategorias(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
      setMsg({ type: "error", text: "No se pudieron cargar las categorías." });
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        await fetchProductos();
        await fetchCategorias();
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  // Imagen
  const handleImagenChange = (e) => {
    const file = e.target.files?.[0] ?? null;

    // revoke previous temp URL if any
    if (tempObjectUrl) {
      URL.revokeObjectURL(tempObjectUrl);
      setTempObjectUrl(null);
    }

    if (file) {
      const url = URL.createObjectURL(file);
      setTempObjectUrl(url);
      setPreview(url);
      setImagen(file);
    } else {
      // if user cleared file input, restore original preview
      setImagen(null);
      setPreview(originalPreview);
    }
  };

  // convierte cualquier imagen a PNG (mantiene proporciones/size original)
  const convertToPng = (file) =>
    new Promise((resolve, reject) => {
      try {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error("No se pudo convertir a PNG"));
              const pngFile = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, "") + ".png",
                { type: "image/png" }
              );
              resolve(pngFile);
            },
            "image/png",
            0.92
          );
        };
        img.onerror = (e) => reject(e);
        img.src = URL.createObjectURL(file);
      } catch (err) {
        reject(err);
      }
    });

  // Agregar producto
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (!nombre || !precio || !imagen || !newCategoria) {
      setMsg({ type: "error", text: "Completa nombre, precio, imagen y categoría." });
      return;
    }

    const formData = new FormData();
    formData.append("descripcion", nombre);
    formData.append("precio", precio);
    // siempre adjuntar el archivo original
    formData.append("imagen", imagen);
    // adjuntar id de categoría
    formData.append("categoria", String(newCategoria));

    // intentar convertir y adjuntar PNG adicional (campo imagen_png)
    try {
      const pngFile = await convertToPng(imagen);
      formData.append("imagen_png", pngFile);
    } catch (err) {
      console.warn("No se pudo generar PNG, se enviará solo el archivo original:", err);
      // no abortamos; backend recibirá el archivo original
    }

    try {
      const res = await fetch(`${apiUrl}productos/create/`, {
        method: "POST",
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Error al agregar producto");
      const data = await res.json();
      setProductos((prev) => [...prev, data]);
      setNombre("");
      setPrecio("");
      setImagen(null);
      setPreview(null);
      setNewCategoria("");
      setMsg({ type: "success", text: "Producto agregado con éxito." });
    } catch (err) {
      console.error(err);
      setMsg({ type: "error", text: "Error al agregar el producto." });
    }
  };

  // Eliminar producto
  const abrirModalEliminar = (id) => setModalEliminar({ abierto: true, productoId: id });
  const cancelarEliminar = () => setModalEliminar({ abierto: false, productoId: null });
  const confirmarEliminar = async () => {
    const id = modalEliminar.productoId;
    try {
      const res = await fetch(`${apiUrl}productos/delete/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Error al eliminar producto");
      setProductos((prev) => prev.filter((p) => p.id !== id));
      setModalEliminar({ abierto: false, productoId: null });
      setMsg({ type: "success", text: "Producto eliminado." });
    } catch (err) {
      console.error(err);
      setMsg({ type: "error", text: "No se pudo eliminar el producto." });
    }
  };

  // Editar producto
  const abrirModalEditar = (producto) => {
    setModalEditar({ abierto: true, producto });
    setNombre(producto.descripcion ?? "");
    setPrecio(producto.precio ?? "");
    // set original preview (kept if cancel) and current preview shown
    const imgUrl = producto.imagen || producto.imagen_url || producto.image || null;
    setPreview(imgUrl);
    setOriginalPreview(imgUrl);
    setImagen(null);
  };

  const cancelarEditar = () => {
    // revoke temp object url if set
    if (tempObjectUrl) {
      URL.revokeObjectURL(tempObjectUrl);
      setTempObjectUrl(null);
    }
    // restore original preview and reset states
    setImagen(null);
    setPreview(originalPreview);
    setModalEditar({ abierto: false, producto: null });
    // do not clear originalPreview here to keep it if modal reopened; optionally clear:
    setNombre("");
    setPrecio("");
  };

  const confirmarEditar = async () => {
    const producto = modalEditar.producto;
    if (!producto) return;

    const form = new FormData();
    form.append("descripcion", nombre);
    form.append("precio", precio);
    if (imagen) form.append("imagen", imagen); // only send new image if user selected one

    try {
      const res = await fetch(`${apiUrl}productos/update/${producto.id}/`, {
        method: "PUT",
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
        body: form,
      });
      if (!res.ok) throw new Error("Error al editar producto");
      // reload full list to ensure consistency
      await fetchProductos();

      // cleanup temp URL if used
      if (tempObjectUrl) {
        URL.revokeObjectURL(tempObjectUrl);
        setTempObjectUrl(null);
      }
      setImagen(null);
      setOriginalPreview(null);
      setModalEditar({ abierto: false, producto: null });
      setNombre("");
      setPrecio("");
      setMsg({ type: "success", text: "Producto actualizado." });
    } catch (err) {
      console.error(err);
      setMsg({ type: "error", text: "No se pudo actualizar el producto." });
    }
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (tempObjectUrl) URL.revokeObjectURL(tempObjectUrl);
    };
  }, [tempObjectUrl]);

  // Filtrado
  const productosFiltrados = productos.filter((p) =>
    categoriaSeleccionada ? p.categoria === categoriaSeleccionada : true
  );

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
              <h1 className="text-2xl font-extrabold text-gray-900">Gestión de Productos</h1>
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
              Gestión de Productos
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
              Cargando productos y categorías...
            </p>
          </div>
        </main>
      ) : (
        <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
          {/* Mensajes inline */}
          {msg.text && (
            <div
              className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
                msg.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {msg.text}
            </div>
          )}

          {/* Tabs */}
          <div className="flex justify-center gap-3 sm:gap-4 mb-6">
            {["agregar", "administrar"].map((t) => (
              <button
                key={t}
                className={`px-4 sm:px-5 py-2 rounded-full font-medium transition-all shadow-sm border ${
                  tab === t
                    ? "bg-red-600 text-white border-red-700 shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                }`}
                onClick={() => setTab(t)}
              >
                {t === "agregar" ? "Agregar Producto" : "Administrar / Editar"}
              </button>
            ))}
          </div>

          {/* Contenido principal */}
          <div className="w-full bg-white/90 backdrop-blur shadow-lg rounded-xl p-5 sm:p-6 border border-gray-200">
            {/* ===== Agregar (se mantiene como tenías) ===== */}
            {tab === "agregar" && (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col items-center">
                  <label
                    htmlFor="imagen"
                    className="w-44 h-44 sm:w-48 sm:h-48 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden transition-all"
                  >
                    {preview ? (
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-5xl select-none">+</span>
                    )}
                  </label>
                  <input id="imagen" type="file" accept="image/*" className="hidden" onChange={handleImagenChange} />
                  <p className="text-xs text-gray-500 mt-2">PNG/JPG hasta ~2MB</p>
                </div>

                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Nombre del producto"
                    className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <input
                    type="number"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    placeholder="Precio"
                    className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-400"
                  />

                  {/* Select categoría (solo en Agregar) */}
                  <select
                    value={newCategoria}
                    onChange={(e) => setNewCategoria(e.target.value)}
                    className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                    required
                  >
                    <option value="">Selecciona categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.descripcion}
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow hover:shadow-md"
                  >
                    Agregar
                  </button>
                </div>
              </form>
            )}

            {/* ===== Administrar (mejorado con loading) ===== */}
            {tab === "administrar" && (
              <div>
                {/* Filtro categorías */}
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-5">
                  <button
                    onClick={() => setCategoriaSeleccionada(null)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm transition-all ${
                      !categoriaSeleccionada
                        ? "bg-red-600 text-white border-red-700 shadow-md"
                        : "bg-white hover:bg-gray-50 text-gray-800 border-gray-300"
                    }`}
                  >
                    <Filter size={18} />
                    Todos
                  </button>

                  {categorias.map((cat) => {
                    const icon =
                      cat.descripcion?.toLowerCase().includes("bebida") ||
                      cat.descripcion?.toLowerCase().includes("bebestible") ? (
                        <CupSoda size={18} />
                      ) : cat.descripcion?.toLowerCase().includes("comida") ? (
                        <Drumstick size={18} />
                      ) : (
                        <Package size={18} />
                      );

                    return (
                      <button
                        key={cat.id}
                        onClick={() =>
                          setCategoriaSeleccionada(categoriaSeleccionada === cat.id ? null : cat.id)
                        }
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm transition-all ${
                          categoriaSeleccionada === cat.id
                            ? "bg-red-600 text-white border-red-700 shadow-md scale-[1.02]"
                            : "bg-white hover:bg-gray-50 text-gray-800 border-gray-300"
                        }`}
                      >
                        {icon}
                        {cat.descripcion}
                      </button>
                    );
                  })}
                </div>

                {/* Tabla → Cards responsive (estilo mejorado) */}
                {productosFiltrados.length > 0 ? (
                  <>
                    {/* Tabla (sm+) */}
                    <div className="hidden sm:block">
                      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                        <table className="w-full text-left text-gray-800">
                          <thead className="bg-gray-100 sticky top-0 z-10">
                            <tr>
                              <th className="px-4 py-3 font-semibold">Imagen</th>
                              <th className="px-4 py-3 font-semibold">Nombre</th>
                              <th className="px-4 py-3 font-semibold">Precio</th>
                              <th className="px-4 py-3 text-center font-semibold">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {productosFiltrados.map((p, i) => (
                              <tr
                                key={p.id}
                                className={`${i % 2 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition`}
                              >
                                <td className="px-4 py-3 w-20">
                                  <img
                                    src={p.imagen || ""}
                                    onError={(e) => (e.currentTarget.src = "")}
                                    alt={p.descripcion}
                                    className="w-16 h-16 object-cover rounded border border-gray-200"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <span className="font-medium text-gray-900">{p.descripcion}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-gray-900 font-semibold">
                                    {formatCLP(p.precio)}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex justify-center gap-2">
                                    <button
                                      onClick={() => abrirModalEditar(p)}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                                    >
                                      <Pencil size={16} />
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => abrirModalEliminar(p.id)}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700"
                                    >
                                      <Trash2 size={16} />
                                      Eliminar
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Cards (móvil) */}
                    <ul className="sm:hidden grid grid-cols-1 gap-3">
                      {productosFiltrados.map((p) => (
                        <li
                          key={p.id}
                          className="bg-white/95 border border-gray-200 rounded-xl p-4 shadow-sm"
                        >
                          <div className="flex gap-3">
                            <img
                              src={p.imagen || ""}
                              onError={(e) => (e.currentTarget.src = "")}
                              alt={p.descripcion}
                              className="w-16 h-16 object-cover rounded border border-gray-200"
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{p.descripcion}</p>
                              <p className="text-gray-900 font-medium mt-0.5">
                                {formatCLP(p.precio)}
                              </p>
                              <div className="mt-3 grid grid-cols-2 gap-2">
                                <button
                                  onClick={() => abrirModalEditar(p)}
                                  className="px-3 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => abrirModalEliminar(p.id)}
                                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Package className="w-10 h-10 text-gray-400" />
                    <p className="mt-2 text-gray-600">No hay productos disponibles</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal: Eliminar */}
          {modalEliminar.abierto && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 px-4">
              <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-2 text-gray-900">Confirmar Eliminación</h3>
                <p className="text-gray-600">¿Estás seguro de eliminar este producto?</p>
                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={cancelarEliminar}
                    className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmarEliminar}
                    className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal: Editar (ESTILO DeleteConfirmModal adaptado) */}
          {modalEditar.abierto && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-product-modal-title"
            >
              {/* backdrop */}
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={cancelarEditar}
              />

              {/* panel */}
              <div className="relative w-full max-w-full sm:max-w-lg mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                        <Pencil className="w-6 h-6 text-amber-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 id="edit-product-modal-title" className="text-lg sm:text-xl font-semibold text-gray-900">
                          Editar Producto
                        </h3>
                        <p className="mt-1 text-sm sm:text-base text-gray-600">
                          Modifica nombre, precio e imagen. Para cancelar se mantendrá la imagen actual.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); confirmarEditar(); }} className="mt-4 sm:mt-6">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Nombre</label>
                          <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Nombre del producto"
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
                        >
                          Cancelar
                        </button>

                        <button
                          type="submit"
                          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-sm"
                        >
                          Guardar cambios
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
