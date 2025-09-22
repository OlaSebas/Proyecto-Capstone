import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

export default function AgregarPromocion() {
    const [descripcion, setDescripcion] = useState("");
    const [precio, setPrecio] = useState("");
    const [imagen, setImagen] = useState(null);
    const [preview, setPreview] = useState(null);
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [productos, setProductos] = useState([]);
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [hora, setHora] = useState("");
    const apiUrl = import.meta.env.VITE_API_URL_INVENTARIO;

    const { sidebarOpen, setSidebarOpen } = useOutletContext();

    // Fecha actual automática
    useEffect(() => {
        const hoy = new Date().toISOString().split("T")[0];
        setFechaInicio(hoy);
    }, []);

    // Cargar productos desde backend
    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const res = await fetch(`${apiUrl}productos/`, {
                    headers: {
                        Authorization: `Token ${localStorage.getItem("token")}`,
                    },
                });
                if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
                const data = await res.json();
                setProductos(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error cargando productos:", err);
                setProductos([]);
            }
        };
        fetchProductos();
    }, [apiUrl]);

    // Actualizar hora en tiempo real
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

    const handleImagenChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagen(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const agregarProducto = (producto) => {
        setProductosSeleccionados((prev) => {
            const existe = prev.find((p) => p.id === producto.id);
            return existe
                ? prev.map((p) =>
                      p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
                  )
                : [...prev, { ...producto, cantidad: 1 }];
        });
    };

    const cambiarCantidad = (id, cantidad) => {
        setProductosSeleccionados((prev) =>
            prev.map((p) =>
                p.id === id ? { ...p, cantidad: Math.max(1, cantidad) } : p
            )
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!descripcion || !precio || !imagen) {
            alert("Completa los campos obligatorios");
            return;
        }

        const formData = new FormData();
        formData.append("descripcion", descripcion);
        formData.append("precio", precio);
        formData.append("fecha_inicio", fechaInicio);
        formData.append("fecha_fin", fechaFin || "");
        formData.append("imagen", imagen);

        try {
            // 1️⃣ Crear la promoción
            const res = await fetch(`${apiUrl}promociones/create/`, {
                method: "POST",
                headers: {
                    Authorization: `Token ${localStorage.getItem("token")}`,
                },
                body: formData,
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Error ${res.status}: ${text}`);
            }

            const nuevaPromocion = await res.json();
            console.log("✅ Promoción creada:", nuevaPromocion);

            // 2️⃣ Crear las relaciones PromocionProducto
            for (const p of productosSeleccionados) {
                const productoData = {
                    promocion: nuevaPromocion.id,
                    producto: p.id,
                    cantidad: p.cantidad,
                };

                const resProd = await fetch(`${apiUrl}promociones_productos/create/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify(productoData),
                });

                if (!resProd.ok) {
                    console.error(
                        `😡 Error creando producto en promoción:`,
                        await resProd.text()
                    );
                }
            }

            alert("😭 Promoción y productos agregados con éxito");

            // Resetear formulario
            setDescripcion("");
            setPrecio("");
            setImagen(null);
            setPreview(null);
            setFechaInicio(new Date().toISOString().split("T")[0]);
            setFechaFin("");
            setProductosSeleccionados([]);
        } catch (err) {
            console.error("❌ Error al guardar promoción:", err);
            alert("⚠️ Error al guardar promoción. Revisa la consola para más detalles.");
        }
    };

    const productosFiltrados = productos.filter((p) =>
        p.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <header className="flex justify-between items-center bg-white shadow px-6 py-4">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                    ☰
                </button>
                <h2 className="text-3xl font-bold text-gray-800 flex-1 text-center">
                    Agregar Promoción
                </h2>
                <span className="text-gray-600 font-medium">{hora}</span>
            </header>

            <div className="flex items-center justify-center flex-1 p-4">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white shadow-lg rounded-lg p-8 w-full max-w-5xl border"
                >
                    <h2 className="text-2xl font-bold text-center mb-6">
                        Formulario Promociones
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Imagen */}
                        <div className="flex flex-col items-center">
                            <label
                                htmlFor="imagen"
                                className="w-40 h-40 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden"
                            >
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-gray-400 text-5xl select-none">+</span>
                                )}
                            </label>
                            <input
                                id="imagen"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImagenChange}
                            />
                        </div>

                        {/* Datos */}
                        <div>
                            <div className="mb-4">
                                <label className="block font-medium mb-1">Descripción:</label>
                                <input
                                    type="text"
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    placeholder="Ej: Promo Familiar"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block font-medium mb-1">Precio:</label>
                                <input
                                    type="number"
                                    value={precio}
                                    onChange={(e) => setPrecio(e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    placeholder="Ej: 19990"
                                    min="0"
                                />
                            </div>

                            <div className="mb-4 flex gap-4">
                                <div className="flex-1">
                                    <label className="block font-medium mb-1">
                                        Fecha inicio:
                                    </label>
                                    <input
                                        type="date"
                                        value={fechaInicio}
                                        onChange={(e) => setFechaInicio(e.target.value)}
                                        className="w-full border rounded px-3 py-2"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block font-medium mb-1">
                                        Fecha término:
                                    </label>
                                    <input
                                        type="date"
                                        value={fechaFin}
                                        onChange={(e) => setFechaFin(e.target.value)}
                                        className="w-full border rounded px-3 py-2"
                                    />
                                </div>
                            </div>
                        </div>
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
                                        alt={p.descripcion}
                                        className="w-16 h-16 object-contain mb-2"
                                    />
                                    <p className="text-sm text-center">{p.descripcion}</p>
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
                                    <div
                                        key={p.id}
                                        className="flex items-center justify-between mb-2"
                                    >
                                        <span>{p.descripcion}</span>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={p.cantidad}
                                                onChange={(e) =>
                                                    cambiarCantidad(p.id, parseInt(e.target.value))
                                                }
                                                className="w-16 border rounded px-2 py-1"
                                                min="1"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setProductosSeleccionados((prev) =>
                                                        prev.filter((prod) => prod.id !== p.id)
                                                    )
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

                    <div className="mt-6 flex justify-center">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Agregar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
