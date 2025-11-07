import React, { useEffect, useState } from "react";
import axios from "axios";
import { PlusCircle, Trash2, Edit2, XCircle } from "lucide-react";
import { useOutletContext, useNavigate } from "react-router-dom";

export default function InventarioPage() {
    const [inventario, setInventario] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [sucursalActiva, setSucursalActiva] = useState("");
    const [nuevo, setNuevo] = useState({
        tipo: "item",
        descripcion: "",
        stock_actual: "",
        fecha_ingreso: new Date().toISOString().split("T")[0],
    });
    const [editando, setEditando] = useState(null);
    const [mensaje, setMensaje] = useState("");
    const [loading, setLoading] = useState(true);
    const [tabActiva, setTabActiva] = useState("inventario"); // inventario o formulario
    const [hora, setHora] = useState("");
    const { sidebarOpen, setSidebarOpen } = useOutletContext();
    const token = localStorage.getItem("token");
    const apiUrl = import.meta.env.VITE_API_URL_INVENTARIO;

    useEffect(() => {
        if (!token) {
            setMensaje("No estás autenticado. Por favor inicia sesión.");
            setLoading(false);
            return;
        }

        const cargarSucursales = async () => {
            try {
                const res = await fetch(`${apiUrl}sucursales/`, {
                    headers: { Authorization: `Token ${token}` },
                });
                if (!res.ok) throw new Error("No se pudieron cargar sucursales");
                const data = await res.json();
                setSucursales(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error(error);
                setMensaje("Error al cargar sucursales");
            } finally {
                setLoading(false);
            }
        };

        cargarSucursales();
    }, [token]);

    // Reloj en vivo
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
        if (!sucursalActiva) {
            setInventario([]);
            return;
        }

        const fetchInventario = async () => {
            try {
                const res = await fetch(`${apiUrl}${sucursalActiva}/`, {
                    headers: { Authorization: `Token ${token}` },
                });
                if (!res.ok) throw new Error("Inventario no encontrado");
                const data = await res.json();

                const invNormalizado = Array.isArray(data)
                    ? data.map((item) => ({
                        id: item.id,
                        tipo: item.item ? "item" : "insumo",
                        descripcion: item.item ? item.item_descripcion : item.insumo_descripcion,
                        stock_actual: item.stock_actual,
                        fecha_ingreso: item.fecha_ingreso ?? "-",
                    }))
                    : [];
                setInventario(invNormalizado);
            } catch (err) {
                console.error(err);
                setInventario([]);
            }
        };

        fetchInventario();
    }, [sucursalActiva, token]);

    const seleccionarSucursal = (e) => {
        const id = e.target.value;
        setSucursalActiva(id);
        setMensaje("");
        setEditando(null);
        setNuevo({
            tipo: "item",
            descripcion: "",
            stock_actual: "",
            fecha_ingreso: new Date().toISOString().split("T")[0],
        });
    };

    const guardarInventario = async (e) => {
        e.preventDefault();
        if (!nuevo.descripcion || !nuevo.stock_actual || !sucursalActiva || !nuevo.fecha_ingreso) {
            setMensaje("Completa todos los campos obligatorios.");
            return;
        }

        try {
            const payload = { ...nuevo, sucursal: sucursalActiva };
            const axiosConfig = { headers: { Authorization: `Token ${token}` } };

            if (editando) {
                await axios.put(`${apiUrl}update/${editando}/`, payload, axiosConfig);
                setMensaje("Inventario actualizado ✅");
                setEditando(null);
            } else {
                await axios.post(`${apiUrl}create/`, payload, axiosConfig);
                setMensaje("Inventario agregado ✅");
            }

            setNuevo({
                tipo: "item",
                descripcion: "",
                stock_actual: "",
                fecha_ingreso: new Date().toISOString().split("T")[0],
            });

            const res = await fetch(`${apiUrl}${sucursalActiva}/`, {
                headers: { Authorization: `Token ${token}` },
            });
            const data = await res.json();
            const invNormalizado = Array.isArray(data)
                ? data.map((item) => ({
                    id: item.id,
                    tipo: item.item ? "item" : "insumo",
                    descripcion: item.item ? item.item_descripcion : item.insumo_descripcion,
                    stock_actual: item.stock_actual,
                    fecha_ingreso: item.fecha_ingreso ?? "-",
                }))
                : [];
            setInventario(invNormalizado);

            setTabActiva("inventario");
        } catch (error) {
            console.error(error);
            setMensaje("Error al guardar inventario ❌");
        }
    };

    const eliminarInventario = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este registro?")) return;
        try {
            await axios.delete(`${apiUrl}delete/${id}/`, {
                headers: { Authorization: `Token ${token}` },
            });
            setInventario((prev) => prev.filter((i) => i.id !== id));
            setMensaje("Registro eliminado ✅");
        } catch (error) {
            console.error(error);
            setMensaje("Error al eliminar registro ❌");
        }
    };

    const editarRegistro = (registro) => {
        setNuevo({
            tipo: registro.tipo,
            descripcion: registro.descripcion,
            stock_actual: registro.stock_actual,
            fecha_ingreso: registro.fecha_ingreso,
        });
        setEditando(registro.id);
        setTabActiva("formulario");
        setMensaje("Editando registro...");
    };

    const cancelarEdicion = () => {
        setNuevo({
            tipo: "item",
            descripcion: "",
            stock_actual: "",
            fecha_ingreso: new Date().toISOString().split("T")[0],
        });
        setEditando(null);
        setTabActiva("inventario");
        setMensaje("");
    };

    const obtenerNombreSucursal = (id) => {
        const suc = sucursales.find((s) => s.id === id);
        return suc ? suc.descripcion : "-";
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
                    Gestion de Inventario
                </h2>
                <span className="text-gray-600 font-medium">{hora}</span>
            </header>

            <main className="flex-1 flex flex-col p-4 sm:p-6 items-center w-full">
                <div className="bg-white p-4 shadow rounded-lg mb-6 max-w-3xl w-full">
                    <label className="block mb-2 font-medium">Selecciona la sucursal:</label>
                    <select
                        value={sucursalActiva}
                        onChange={seleccionarSucursal}
                        className="w-full border rounded px-2 py-1"
                    >
                        <option value="">-- Selecciona una sucursal --</option>
                        {sucursales.map((s) => (
                            <option key={s.id} value={s.id}>{s.descripcion}</option>
                        ))}
                    </select>
                </div>

                {sucursalActiva && (
                    <>
                        {/* Tabs estilo GestionPromociones */}
                        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                            {["inventario", "formulario"].map((t) => (
                                <button key={t}
                                    className={`px-3 sm:px-4 py-1 sm:py-2 rounded-t-lg ${tabActiva === t ? "bg-red-600 text-white" : "bg-gray-300 text-gray-700 hover:bg-gray-400"}`}
                                    onClick={() => setTabActiva(t)}>
                                    {t === "inventario" ? "Inventario" : editando ? "Editar Registro" : "Agregar Inventario"}
                                </button>
                            ))}
                        </div>

                        <div className="w-full max-w-5xl bg-white shadow-lg rounded-b-lg p-4 sm:p-6 border-t-0 overflow-x-auto">
                            {tabActiva === "inventario" && (
                                <table className="w-full border-collapse text-left min-w-[600px]">
                                    <thead>
                                        <tr className="bg-gray-200">
                                            <th className="px-3 py-2">ID</th>
                                            <th className="px-3 py-2">Tipo</th>
                                            <th className="px-3 py-2">Descripción</th>
                                            <th className="px-3 py-2">Stock</th>
                                            <th className="px-3 py-2">Fecha</th>
                                            <th className="px-3 py-2">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inventario.length ? inventario.map(inv => (
                                            <tr key={inv.id} className="border-b">
                                                <td className="px-3 py-2">{inv.id}</td>
                                                <td className="px-3 py-2 capitalize">{inv.tipo}</td>
                                                <td className="px-3 py-2">{inv.descripcion}</td>
                                                <td className="px-3 py-2">{inv.stock_actual}</td>
                                                <td className="px-3 py-2">{inv.fecha_ingreso}</td>
                                                <td className="px-3 py-2 flex gap-2">
                                                    <button onClick={() => editarRegistro(inv)} className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs sm:text-sm"><Edit2 size={14} /></button>
                                                    <button onClick={() => eliminarInventario(inv.id)} className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs sm:text-sm"><Trash2 size={14} /></button>
                                                </td>
                                            </tr>
                                        )) : <tr><td colSpan="6" className="px-3 py-2 text-center text-gray-500">No hay registros</td></tr>}
                                    </tbody>
                                </table>
                            )}

                            {tabActiva === "formulario" && (
                                <form onSubmit={guardarInventario} className="flex flex-col gap-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Tipo</label>
                                            <select value={nuevo.tipo} onChange={(e) => setNuevo({ ...nuevo, tipo: e.target.value })} className="w-full border rounded px-2 py-1">
                                                <option value="item">Item</option>
                                                <option value="insumo">Insumo</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Nombre</label>
                                            <input type="text" value={nuevo.descripcion} onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })} className="w-full border rounded px-2 py-1" placeholder="Nombre" required />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Stock actual</label>
                                            <input type="number" value={nuevo.stock_actual} onChange={(e) => setNuevo({ ...nuevo, stock_actual: e.target.value })} className="w-full border rounded px-2 py-1" placeholder="Stock" required />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Fecha de ingreso</label>
                                            <input type="date" value={nuevo.fecha_ingreso} onChange={(e) => setNuevo({ ...nuevo, fecha_ingreso: e.target.value })} className="w-full border rounded px-2 py-1" required />
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                        <button type="submit" className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"><PlusCircle size={18} /> {editando ? "Guardar" : "Agregar"}</button>
                                        {editando && <button type="button" onClick={cancelarEdicion} className="flex items-center gap-2 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"><XCircle size={18} /> Cancelar</button>}
                                    </div>
                                </form>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
