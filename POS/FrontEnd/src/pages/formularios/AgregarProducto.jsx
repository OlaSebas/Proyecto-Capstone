import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { CupSoda, Drumstick, Package, Filter } from "lucide-react";

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
    const [modalEliminar, setModalEliminar] = useState({ abierto: false, productoId: null });
    const [modalEditar, setModalEditar] = useState({ abierto: false, producto: null });

    const apiUrl = import.meta.env.VITE_API_URL_INVENTARIO;
    const { sidebarOpen, setSidebarOpen } = useOutletContext();

    // Actualizar hora cada segundo
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

    // Cargar productos y categorías
    const fetchProductos = async () => {
        try {
            const res = await fetch(`${apiUrl}productos/`, {
                headers: { Authorization: `Token ${localStorage.getItem("token")}` },
            });
            const data = await res.json();
            setProductos(data);
        } catch (err) {
            console.error("Error al cargar productos:", err);
        }
    };

    const fetchCategorias = async () => {
        try {
            const res = await fetch(`${apiUrl}categorias/`, {
                headers: { Authorization: `Token ${localStorage.getItem("token")}` },
            });
            const data = await res.json();
            setCategorias(data);
        } catch (err) {
            console.error("Error al cargar categorías:", err);
        }
    };

    useEffect(() => {
        fetchProductos();
        fetchCategorias();
    }, []);

    // Imagen
    const handleImagenChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagen(file);
            setPreview(URL.createObjectURL(file));
        } else {
            setImagen(null);
            setPreview(null);
        }
    };

    // Agregar producto
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nombre || !precio || !imagen) {
            alert("Completa todos los campos");
            return;
        }
        const formData = new FormData();
        formData.append("descripcion", nombre);
        formData.append("precio", precio);
        formData.append("imagen", imagen);

        try {
            const res = await fetch(`${apiUrl}productos/create/`, {
                method: "POST",
                headers: { Authorization: `Token ${localStorage.getItem("token")}` },
                body: formData,
            });
            if (!res.ok) throw new Error("Error al agregar producto");
            const data = await res.json();
            setProductos([...productos, data]);
            setNombre("");
            setPrecio("");
            setImagen(null);
            setPreview(null);
            alert("Producto agregado con éxito");
        } catch (err) {
            console.error(err);
            alert("Error al agregar producto");
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
            setProductos(productos.filter((p) => p.id !== id));
            setModalEliminar({ abierto: false, productoId: null });
        } catch (err) {
            console.error(err);
            alert("Error al eliminar producto");
        }
    };

    // Editar producto
    const abrirModalEditar = (producto) => {
        setModalEditar({ abierto: true, producto });
        setNombre(producto.descripcion);
        setPrecio(producto.precio);
        setPreview(producto.imagen);
        setImagen(null);
    };
    const cancelarEditar = () => {
        setModalEditar({ abierto: false, producto: null });
        setNombre("");
        setPrecio("");
        setImagen(null);
        setPreview(null);
    };
    const confirmarEditar = async () => {
        const producto = modalEditar.producto;
        const formData = new FormData();
        formData.append("descripcion", nombre);
        formData.append("precio", precio);
        if (imagen) formData.append("imagen", imagen);

        try {
            const res = await fetch(`${apiUrl}productos/update/${producto.id}/`, {
                method: "PUT",
                headers: { Authorization: `Token ${localStorage.getItem("token")}` },
                body: formData,
            });
            if (!res.ok) throw new Error("Error al editar producto");
            const data = await res.json();
            setProductos(productos.map((p) => (p.id === producto.id ? data : p)));
            cancelarEditar();
            alert("Producto actualizado correctamente");
        } catch (err) {
            console.error(err);
            alert("Error al editar producto");
        }
    };

    // Filtrado
    const productosFiltrados = productos.filter((p) =>
        categoriaSeleccionada ? p.categoria === categoriaSeleccionada : true
    );

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
                    Gestión de Productos
                </h2>
                <span className="text-gray-600 font-medium">{hora}</span>
            </header>

            <main className="flex-1 flex flex-col p-6 items-center">
                {/* Tabs */}
                <div className="flex justify-center gap-4 mb-6">
                    {["agregar", "administrar"].map((t) => (
                        <button
                            key={t}
                            className={`px-5 py-2 rounded-t-lg font-medium transition-all ${tab === t
                                    ? "bg-red-600 text-white shadow"
                                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                                }`}
                            onClick={() => setTab(t)}
                        >
                            {t === "agregar" ? "Agregar Producto" : "Administrar / Editar"}
                        </button>
                    ))}
                </div>

                {/* Contenido principal */}
                <div className="w-full max-w-5xl bg-white shadow-lg rounded-b-lg p-6 border-t-0">
                    {/* Agregar producto */}
                    {tab === "agregar" && (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="flex justify-center mb-4">
                                <label
                                    htmlFor="imagen"
                                    className="w-40 h-40 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden transition-all"
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
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Nombre del producto"
                                className="border rounded px-3 py-2 w-full"
                            />
                            <input
                                type="number"
                                value={precio}
                                onChange={(e) => setPrecio(e.target.value)}
                                placeholder="Precio"
                                className="border rounded px-3 py-2 w-full"
                            />
                            <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-all">
                                Agregar
                            </button>
                        </form>
                    )}

                    {/* Administrar productos */}
                    {tab === "administrar" && (
                        <div>
                            {/* Filtro de categorías */}
                            <div className="flex flex-wrap justify-center gap-3 mb-8">
                                <button
                                    onClick={() => setCategoriaSeleccionada(null)}
                                    className={`flex items-center gap-2 px-5 py-2 rounded-full border shadow-sm transition-all ${!categoriaSeleccionada
                                            ? "bg-red-600 text-white border-red-700 shadow-md"
                                            : "bg-white hover:bg-gray-50 text-gray-800 border-gray-300"
                                        }`}
                                >
                                    <Filter size={18} />
                                    Todos
                                </button>

                                {categorias.map((cat) => {
                                    const icon =
                                        cat.descripcion.toLowerCase().includes("bebida") ? (
                                            <CupSoda size={18} />
                                        ) : cat.descripcion.toLowerCase().includes("comida") ? (
                                            <Drumstick size={18} />
                                        ) : (
                                            <Package size={18} />
                                        );
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() =>
                                                setCategoriaSeleccionada(
                                                    categoriaSeleccionada === cat.id ? null : cat.id
                                                )
                                            }
                                            className={`flex items-center gap-2 px-5 py-2 rounded-full border shadow-sm transition-all ${categoriaSeleccionada === cat.id
                                                    ? "bg-red-600 text-white border-red-700 shadow-md scale-105"
                                                    : "bg-white hover:bg-gray-50 text-gray-800 border-gray-300"
                                                }`}
                                        >
                                            {icon}
                                            {cat.descripcion}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Tabla */}
                            {productosFiltrados.length > 0 ? (
                                <table className="w-full border-collapse text-left text-gray-800">
                                    <thead>
                                        <tr className="bg-gray-200">
                                            <th className="px-4 py-2">Imagen</th>
                                            <th className="px-4 py-2">Nombre</th>
                                            <th className="px-4 py-2">Precio</th>
                                            <th className="px-4 py-2 text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productosFiltrados.map((p) => (
                                            <tr key={p.id} className="border-b hover:bg-gray-50 transition-all">
                                                <td className="px-4 py-2 w-20">
                                                    <img
                                                        src={p.imagen}
                                                        alt={p.descripcion}
                                                        className="w-16 h-16 object-cover rounded"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">{p.descripcion}</td>
                                                <td className="px-4 py-2">${p.precio}</td>
                                                <td className="px-4 py-2 flex justify-center gap-2">
                                                    <button
                                                        onClick={() => abrirModalEditar(p)}
                                                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => abrirModalEliminar(p.id)}
                                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-center text-gray-500 mt-4">
                                    No hay productos disponibles
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Modales */}
                {modalEliminar.abierto && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                        <div className="bg-white p-6 rounded shadow-lg w-80">
                            <h3 className="text-xl font-bold mb-4 text-gray-800">Confirmar Eliminación</h3>
                            <p className="text-gray-600">¿Estás seguro de eliminar este producto?</p>
                            <div className="mt-4 flex justify-end gap-4">
                                <button
                                    onClick={cancelarEliminar}
                                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmarEliminar}
                                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {modalEditar.abierto && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                        <div className="bg-white p-6 rounded shadow-lg w-80 flex flex-col gap-3">
                            <h3 className="text-xl font-bold mb-2 text-gray-800">Editar Producto</h3>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Nombre"
                                className="border rounded px-3 py-2"
                            />
                            <input
                                type="number"
                                value={precio}
                                onChange={(e) => setPrecio(e.target.value)}
                                placeholder="Precio"
                                className="border rounded px-3 py-2"
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImagenChange}
                                className="border rounded px-3 py-2"
                            />
                            <div className="flex justify-end gap-3 mt-2">
                                <button
                                    onClick={cancelarEditar}
                                    className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmarEditar}
                                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
