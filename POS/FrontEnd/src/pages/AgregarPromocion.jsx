import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

export default function GestionPromociones() {
    const [tab, setTab] = useState("agregar");
    const [descripcion, setDescripcion] = useState("");
    const [precio, setPrecio] = useState("");
    const [imagen, setImagen] = useState(null);
    const [preview, setPreview] = useState(null);
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [promociones, setPromociones] = useState([]);
    const [modalEliminar, setModalEliminar] = useState({ abierto: false, id: null });
    const [modalEditar, setModalEditar] = useState({ abierto: false, promo: null });
    const [hora, setHora] = useState("");

    // --- Estados para la lista de productos (filtro + selección) ---
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);

    const apiUrl = import.meta.env.VITE_API_URL_INVENTARIO; // ajusta si tu var tiene otro nombre
    const { sidebarOpen, setSidebarOpen } = useOutletContext();

    // Hora en tiempo real
    useEffect(() => {
        const actualizarHora = () => {
            setHora(
                new Date().toLocaleTimeString("es-CL", {
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

    // Fecha inicio por defecto (hoy)
    useEffect(() => {
        setFechaInicio(new Date().toISOString().split("T")[0]);
    }, []);

    // Cargar promociones desde backend
    const fetchPromociones = async () => {
        try {
            const res = await fetch(`${apiUrl}promociones/`, {
                headers: { Authorization: `Token ${localStorage.getItem("token")}` },
            });
            const data = await res.json();
            setPromociones(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error cargando promociones:", err);
            setPromociones([]);
        }
    };

    // Cargar productos desde backend (para poder agregarlos a la promo)
    const fetchProductos = async () => {
        try {
            const res = await fetch(`${apiUrl}productos/`, {
                headers: { Authorization: `Token ${localStorage.getItem("token")}` },
            });
            const data = await res.json();
            setProductos(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error cargando productos:", err);
            setProductos([]);
        }
    };

    useEffect(() => {
        fetchPromociones();
        fetchProductos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Imagen preview
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

    // Filtrado de productos (usa descripcion o nombre dependiendo del campo)
    const productosFiltrados = productos.filter((p) =>
        ((p.descripcion || p.nombre || "") + "")
            .toLowerCase()
            .includes(busqueda.toLowerCase())
    );

    // Agregar producto a la lista de la promo (si ya existe, no lo duplica aquí; si quieres incrementar cantidad, cambia la lógica)
    const agregarProducto = (producto) => {
        setProductosSeleccionados((prev) => {
            const existe = prev.find((x) => x.id === producto.id);
            if (existe) {
                // si ya existe, incrementamos cantidad
                return prev.map((x) =>
                    x.id === producto.id ? { ...x, cantidad: (x.cantidad || 1) + 1 } : x
                );
            }
            return [...prev, { ...producto, cantidad: 1 }];
        });
    };

    const cambiarCantidad = (id, cantidad) => {
        setProductosSeleccionados((prev) =>
            prev.map((p) => (p.id === id ? { ...p, cantidad: Math.max(1, cantidad || 1) } : p))
        );
    };

    // Submit (agregar promoción) - mantiene la estructura que enviaste; agrego productos en FormData por si tu back lo soporta
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!descripcion || !precio || !imagen) {
            alert("Completa los campos obligatorios");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("descripcion", descripcion);
            formData.append("precio", precio);
            formData.append("fecha_inicio", fechaInicio);
            if (fechaFin) formData.append("fecha_fin", fechaFin);
            formData.append("imagen", imagen);

            // si seleccionaste productos, los agregamos como JSON para que el backend los reciba
            if (productosSeleccionados.length > 0) {
                formData.append("productos", JSON.stringify(productosSeleccionados));
            }

            const res = await fetch(`${apiUrl}promociones/create/`, {
                method: "POST",
                headers: {
                    Authorization: `Token ${localStorage.getItem("token")}`,
                },
                body: formData,
            });

            if (!res.ok) {
                const txt = await res.text();
                throw new Error(`Error ${res.status}: ${txt}`);
            }

            const data = await res.json();
            setPromociones((prev) => [...prev, data]);

            // reset form
            setDescripcion("");
            setPrecio("");
            setImagen(null);
            setPreview(null);
            setFechaInicio(new Date().toISOString().split("T")[0]);
            setFechaFin("");
            setProductosSeleccionados([]);
            alert("Promoción agregada con éxito");
            setTab("administrar");
        } catch (err) {
            console.error("Error al crear promoción:", err);
            alert("Error al crear promoción. Revisa la consola.");
        }
    };

    // Eliminar promoción (modal)
    const abrirModalEliminar = (id) => setModalEliminar({ abierto: true, id });
    const cancelarEliminar = () => setModalEliminar({ abierto: false, id: null });
    const confirmarEliminar = async () => {
        try {
            const res = await fetch(`${apiUrl}promociones/${modalEliminar.id}/`, {
                method: "DELETE",
                headers: { Authorization: `Token ${localStorage.getItem("token")}` },
            });
            if (!res.ok) throw new Error("Error al eliminar promoción");
            setPromociones((prev) => prev.filter((p) => p.id !== modalEliminar.id));
            cancelarEliminar();
        } catch (err) {
            console.error(err);
            alert("Error al eliminar promoción");
        }
    };

    // Editar promoción (abre modal y rellena campos)
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
        setDescripcion("");
        setPrecio("");
        setImagen(null);
        setPreview(null);
        setFechaInicio("");
        setFechaFin("");
    };

    const confirmarEditar = async () => {
        const promo = modalEditar.promo;
        if (!promo) return;
        const formData = new FormData();
        formData.append("descripcion", descripcion);
        formData.append("precio", precio);
        formData.append("fecha_inicio", fechaInicio);
        if (fechaFin) formData.append("fecha_fin", fechaFin);
        if (imagen) formData.append("imagen", imagen);

        try {
            const res = await fetch(`${apiUrl}promociones/${promo.id}/`, {
                method: "PATCH",
                headers: { Authorization: `Token ${localStorage.getItem("token")}` },
                body: formData,
            });
            if (!res.ok) throw new Error("Error al editar promoción");
            const data = await res.json();
            setPromociones((prev) => prev.map((p) => (p.id === promo.id ? data : p)));
            cancelarEditar();
            alert("Promoción actualizada correctamente");
        } catch (err) {
            console.error(err);
            alert("Error al editar promoción");
        }
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
                    Gestión de Promociones
                </h2>
                <span className="text-gray-600 font-medium">{hora}</span>
            </header>

            <main className="flex-1 flex flex-col p-6 items-center">
                {/* Tabs */}
                <div className="flex justify-center gap-4 mb-6">
                    <button
                        className={`px-4 py-2 rounded-t-lg ${tab === "agregar" ? "bg-red-600 text-white" : "bg-gray-300 text-gray-700 hover:bg-gray-400"}`}
                        onClick={() => setTab("agregar")}
                    >
                        Agregar Promoción
                    </button>
                    <button
                        className={`px-4 py-2 rounded-t-lg ${tab === "administrar" ? "bg-red-600 text-white" : "bg-gray-300 text-gray-700 hover:bg-gray-400"}`}
                        onClick={() => setTab("administrar")}
                    >
                        Administrar / Editar
                    </button>
                </div>

                <div className="w-full max-w-4xl bg-white shadow-lg rounded-b-lg p-6 border-t-0">
                    {/* Agregar */}
                    {tab === "agregar" && (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {/* Imagen */}
                            <div className="flex justify-center mb-4">
                                <label
                                    htmlFor="imagen"
                                    className="w-40 h-40 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden"
                                >
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-gray-400 text-5xl select-none">+</span>
                                    )}
                                </label>
                                <input id="imagen" type="file" accept="image/*" className="hidden" onChange={handleImagenChange} />
                            </div>

                            <input
                                type="text"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                placeholder="Descripción"
                                className="border rounded px-3 py-2 w-full"
                            />
                            <input
                                type="number"
                                value={precio}
                                onChange={(e) => setPrecio(e.target.value)}
                                placeholder="Precio"
                                className="border rounded px-3 py-2 w-full"
                            />
                            <div className="flex gap-4">
                                <input
                                    type="date"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                    className="border rounded px-3 py-2 w-full"
                                />
                                <input
                                    type="date"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                    className="border rounded px-3 py-2 w-full"
                                />
                            </div>

                            {/* Lista de productos */}
                            <div className="mt-6">
                                <h3 className="font-bold mb-2">Lista Productos</h3>
                                <div className="mb-6 w-full max-w-4xl mx-auto px-2">
                                    <input
                                        type="text"
                                        placeholder="Buscar producto..."
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                        className="w-full px-4 py-3 text-lg sm:text-xl border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                                    />
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                                    {productosFiltrados.map((p) => (
                                        <div
                                            key={p.id}
                                            className="border rounded p-2 flex flex-col items-center hover:bg-gray-50 cursor-pointer"
                                        >
                                            <img
                                                src={p.imagen}
                                                alt={p.descripcion || p.nombre}
                                                className="w-16 h-16 object-contain mb-2"
                                            />
                                            <p className="text-sm text-center">{p.descripcion || p.nombre}</p>
                                            <button
                                                type="button"
                                                onClick={() => agregarProducto(p)}
                                                className="mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-green-500"
                                            >
                                                Agregar
                                            </button>
                                        </div>
                                    ))}
                                    {productosFiltrados.length === 0 && (
                                        <p className="col-span-full text-center text-gray-500">
                                            No se encontraron productos
                                        </p>
                                    )}
                                </div>

                                {productosSeleccionados.length > 0 && (
                                    <div className="border rounded p-4">
                                        {productosSeleccionados.map((p) => (
                                            <div key={p.id} className="flex items-center justify-between mb-2">
                                                <span>{p.descripcion || p.nombre}</span>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        value={p.cantidad}
                                                        onChange={(e) => cambiarCantidad(p.id, parseInt(e.target.value))}
                                                        className="w-16 border rounded px-2 py-1"
                                                        min="1"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setProductosSeleccionados((prev) => prev.filter((prod) => prod.id !== p.id))
                                                        }
                                                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                                Agregar
                            </button>
                        </form>
                    )}

                    {/* Administrar */}
                    {tab === "administrar" && (
                        <div>
                            {promociones.length > 0 ? (
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="bg-gray-200">
                                            <th className="px-4 py-2">Imagen</th>
                                            <th className="px-4 py-2">Descripción</th>
                                            <th className="px-4 py-2">Precio</th>
                                            <th className="px-4 py-2">Fechas</th>
                                            <th className="px-4 py-2">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {promociones.map((p) => (
                                            <tr key={p.id} className="border-b">
                                                <td className="px-4 py-2 w-20">
                                                    <img src={p.imagen} alt={p.descripcion} className="w-16 h-16 object-cover rounded" />
                                                </td>
                                                <td className="px-4 py-2">{p.descripcion}</td>
                                                <td className="px-4 py-2">${p.precio}</td>
                                                <td className="px-4 py-2">
                                                    {p.fecha_inicio} - {p.fecha_fin || "Indefinida"}
                                                </td>
                                                <td className="px-4 py-2 flex gap-2">
                                                    <button
                                                        onClick={() => abrirModalEditar(p)}
                                                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => abrirModalEliminar(p.id)}
                                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-center text-gray-500">No hay promociones</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Modal eliminar */}
                {modalEliminar.abierto && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                        <div className="bg-white p-6 rounded shadow-lg w-80">
                            <h3 className="text-xl font-bold mb-4">Confirmar Eliminación</h3>
                            <p>¿Eliminar esta promoción?</p>
                            <div className="mt-4 flex justify-end gap-4">
                                <button onClick={cancelarEliminar} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">
                                    Cancelar
                                </button>
                                <button onClick={confirmarEliminar} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal editar */}
                {modalEditar.abierto && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                        <div className="bg-white p-6 rounded shadow-lg w-96 flex flex-col gap-3">
                            <h3 className="text-xl font-bold mb-2">Editar Promoción</h3>
                            <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción" className="border rounded px-3 py-2" />
                            <input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Precio" className="border rounded px-3 py-2" />
                            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="border rounded px-3 py-2" />
                            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="border rounded px-3 py-2" />
                            <input type="file" accept="image/*" onChange={handleImagenChange} className="border rounded px-3 py-2" />
                            <div className="flex justify-end gap-3 mt-2">
                                <button onClick={cancelarEditar} className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400">Cancelar</button>
                                <button onClick={confirmarEditar} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Guardar</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
