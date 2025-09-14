import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import PreCarrito from "../components/PreCarrito";

export default function Carrito() {
    const [carrito, setCarrito] = useState([]);
    const [hora, setHora] = useState("");
    const [productoEditar, setProductoEditar] = useState(null); // Producto que se quiere editar
    const { sidebarOpen, setSidebarOpen } = useOutletContext(); // Sidebar desde Layout
    const navigate = useNavigate();

    // Cargar carrito desde Local Storage
    useEffect(() => {
        const carritoGuardado = localStorage.getItem("carrito");
        if (carritoGuardado) setCarrito(JSON.parse(carritoGuardado));
    }, []);

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

    // Guardar carrito en localStorage
    const guardarCarrito = (nuevoCarrito) => {
        setCarrito(nuevoCarrito);
        localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
    };

    // Eliminar producto del carrito
    const eliminarProducto = (index) => {
        const nuevoCarrito = carrito.filter((_, i) => i !== index);
        guardarCarrito(nuevoCarrito);
    };

    // Editar producto (abrir modal)
    const editarProducto = (index) => {
        setProductoEditar({ ...carrito[index], index });
    };

    // Guardar cambios desde el modal PreCarrito
    const guardarEdicion = (pedidoEditado) => {
        const nuevoCarrito = [...carrito];
        nuevoCarrito[pedidoEditado.index] = { ...pedidoEditado };
        guardarCarrito(nuevoCarrito);
        setProductoEditar(null);
    };

    // Calcular subtotal, impuestos y total
    const subtotal = Math.round(carrito.reduce((sum, item) => sum + item.total, 0));
    const impuestos = Math.round(subtotal * 0.19);
    const total = subtotal + impuestos;

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
                    Carrito
                </h2>

                <span className="text-gray-600 font-medium">{hora}</span>
            </header>

            <div className="p-6 max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">Carrito de Compras</h2>

                {carrito.length === 0 ? (
                    <p>Tu carrito está vacío</p>
                ) : (
                    <>
                        <table className="w-full border-collapse border">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border px-4 py-2">Producto</th>
                                    <th className="border px-4 py-2">Bebida</th>
                                    <th className="border px-4 py-2">Adicionales</th>
                                    <th className="border px-4 py-2">Cantidad</th>
                                    <th className="border px-4 py-2">Total</th>
                                    <th className="border px-4 py-2">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {carrito.map((item, index) => (
                                    <tr key={index}>
                                        <td className="border px-4 py-2">{item.producto.nombre || item.producto.descripcion}</td>
                                        <td className="border px-4 py-2">{item.refresco?.nombre || "-"}</td>
                                        <td className="border px-4 py-2">
                                            {item.adicionales.length > 0
                                                ? item.adicionales.map((a) => a.nombre).join(", ")
                                                : "-"}
                                        </td>
                                        <td className="border px-4 py-2">{item.cantidad}</td>
                                        <td className="border px-4 py-2">${item.total.toLocaleString()}</td>
                                        <td className="border px-4 py-2 flex gap-2">
                                            <button
                                                onClick={() => editarProducto(index)}
                                                className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => eliminarProducto(index)}
                                                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="mt-4 text-right">
                            <h3 className="text-xl font-bold">Subtotal: ${subtotal.toLocaleString()}</h3>
                            <h3 className="text-xl font-bold">Impuestos (19%): ${impuestos.toLocaleString()}</h3>
                            <h3 className="text-xl font-bold">Total: ${total.toLocaleString()}</h3>
                        </div>

                        <div className="mt-6 flex gap-4 justify-end">
                            <button
                                onClick={() => navigate("/producto")}
                                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
                            >
                                Seguir Comprando
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Modal para editar producto */}
            {productoEditar && (
                <PreCarrito
                    producto={productoEditar.producto}
                    cantidadInicial={productoEditar.cantidad}
                    refrescoInicial={productoEditar.refresco}
                    adicionalesInicial={productoEditar.adicionales}
                    onClose={() => setProductoEditar(null)}
                    onAddToCart={(pedido) => guardarEdicion({ ...pedido, index: productoEditar.index })}
                />
            )}
        </div>
    );
}