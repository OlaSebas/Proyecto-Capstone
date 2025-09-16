import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

export default function AgregarProducto() {
    const [nombre, setNombre] = useState("");
    const [precio, setPrecio] = useState("");
    const [imagen, setImagen] = useState(null);
    const [preview, setPreview] = useState(null);
    const [hora, setHora] = useState("");
    const apiUrl = import.meta.env.VITE_API_URL;

    const { sidebarOpen, setSidebarOpen } = useOutletContext(); // Sidebar desde Layout

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nombre || !precio || !imagen) {
            alert("Completa todos los campos");
            return;
        }

        const formData = new FormData();
        formData.append("nombre", nombre);
        formData.append("precio", precio);
        formData.append("imagen", imagen);

        try {
            const res = await fetch(`${apiUrl}inventario/productos/`, {
                method: "POST",
                headers: {
                    Authorization: `Token ${localStorage.getItem("token")}`
                },
                body: formData,
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Error ${res.status}: ${text}`);
            }

            const data = await res.json();
            alert("Producto agregado con éxito");
            setNombre("");
            setPrecio("");
            setImagen(null);
            setPreview(null);
            console.log("Producto creado:", data);
        } catch (err) {
            console.error("Error al guardar producto:", err);
            alert("Error al guardar producto. Revisa la consola para más detalles.");
        }
    };

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
                    Agregar Producto
                </h2>
                <span className="text-gray-600 font-medium">{hora}</span>
            </header>

            {/* Formulario */}
            <div className="flex items-center justify-center flex-1 p-4">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white shadow-lg rounded-lg p-8 w-full max-w-xl border"
                >
                    <h2 className="text-2xl font-bold text-center mb-6">Formulario Producto</h2>

                    {/* Imagen */}
                    <div className="flex items-center justify-center mb-6">
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

                    {/* Nombre */}
                    <div className="mb-4">
                        <label className="block font-medium mb-1">Nombre:</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            placeholder="Ej: Pollo Entero"
                        />
                    </div>

                    {/* Precio */}
                    <div className="mb-6">
                        <label className="block font-medium mb-1">Precio:</label>
                        <input
                            type="number"
                            value={precio}
                            onChange={(e) => setPrecio(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            placeholder="Ej: 12990"
                            min="0"
                        />
                    </div>

                    {/* Botón */}
                    <div className="flex justify-center">
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
