import React, { useEffect, useState } from "react";
import axios from "axios";
import { PlusCircle, Trash2, Edit2, XCircle, Pencil } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function InventarioSucursalesPage() {
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen } =
    useOutletContext?.() ?? { sidebarOpen: false, setSidebarOpen: () => {} };

  const [sucursales, setSucursales] = useState([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);
  const [inventario, setInventario] = useState([]);
  const [tabActiva, setTabActiva] = useState("inventario");
  const [hora, setHora] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [nuevo, setNuevo] = useState({
    tipo: "item",
    descripcion: "",
    stock_actual: "",
    fecha_ingreso: new Date().toISOString().split("T")[0],
  });
  const [editando, setEditando] = useState(null);

  const token = localStorage.getItem("token");
  const apiUrl = import.meta.env.VITE_API_URL_INVENTARIO;

  const editarSucursal = (sucursal) => {
    navigate(`/sucursalEdit/${sucursal.id}`);
  };

  const irAgregarSucursal = () => {
    navigate("/SucursalForm");
  };

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

  // cargar sucursales
  useEffect(() => {
    fetch(`${apiUrl}sucursales/`, {
      headers: { Authorization: `Token ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSucursales(Array.isArray(data) ? data : []))
      .catch(() => setSucursales([]));
  }, [apiUrl, token]);

  // cargar inventario por sucursal
  const toggleSucursal = async (sucursalId) => {
    if (sucursalSeleccionada === sucursalId) {
      setSucursalSeleccionada(null);
      setInventario([]);
      return;
    }
    setSucursalSeleccionada(sucursalId);
    try {
      const res = await fetch(`${apiUrl}${sucursalId}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      const invNormalizado = Array.isArray(data)
        ? data.map((item) => ({
            id: item.id,
            tipo: item.item ? "item" : "insumo",
            descripcion:
              item.item?.descripcion ||
              item.insumo?.descripcion ||
              item.descripcion ||
              "",
            stock_actual: item.stock_actual,
            unidad: item.item?.unidad_medida || item.insumo?.unidad_medida || "-",
            fecha_ingreso:
              item.fecha_modificacion ?? item.updated_at ?? item.fecha_ingreso ?? "-",
          }))
        : [];
      setInventario(invNormalizado);
    } catch {
      setInventario([]);
    }
  };

  // guardar (crear/editar)
  const guardarInventario = async (e) => {
    e.preventDefault();
    if (!nuevo.descripcion || !nuevo.stock_actual || !sucursalSeleccionada || !nuevo.fecha_ingreso) {
      setMensaje("Completa todos los campos obligatorios.");
      return;
    }
    try {
      const payload = { ...nuevo, sucursal: sucursalSeleccionada };
      const cfg = { headers: { Authorization: `Token ${token}` } };
      if (editando) {
        await axios.put(`${apiUrl}update/${editando}/`, payload, cfg);
        setMensaje("Inventario actualizado");
        setEditando(null);
      } else {
        await axios.post(`${apiUrl}create/`, payload, cfg);
        setMensaje("Inventario agregado");
      }
      await toggleSucursal(sucursalSeleccionada);
      setNuevo({
        tipo: "item",
        descripcion: "",
        stock_actual: "",
        fecha_ingreso: new Date().toISOString().split("T")[0],
      });
      setTabActiva("inventario");
    } catch {
      setMensaje("Error al guardar inventario");
    }
  };

  const eliminarInventario = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este registro?")) return;
    try {
      await axios.delete(`${apiUrl}delete/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setInventario((prev) => prev.filter((i) => i.id !== id));
      setMensaje("Registro eliminado");
    } catch {
      setMensaje("Error al eliminar registro");
    }
  };

  const editarRegistro = (registro) => {
    setNuevo({
      tipo: registro.tipo,
      descripcion: registro.descripcion,
      stock_actual: registro.stock_actual,
      fecha_ingreso:
        registro.fecha_ingreso && registro.fecha_ingreso !== "-"
          ? registro.fecha_ingreso
          : new Date().toISOString().split("T")[0],
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

  const nombreSucursal =
    sucursales.find((s) => s.id === sucursalSeleccionada)?.descripcion || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-white to-red-200">
      {/* HEADER */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-3 sm:px-6">
          {/* móvil */}
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
                Sucursales e Inventario
              </h1>
              <p className="mt-1 text-gray-600 font-medium">{hora}</p>
            </div>
            {/* botón agregar sucursal (móvil) */}
            <button
              onClick={irAgregarSucursal}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 text-white py-2.5 font-semibold shadow hover:bg-gray-800"
            >
              <PlusCircle size={18} />
              Agregar sucursal
            </button>
          </div>

          {/* desktop/tablet */}
          <div className="hidden md:flex items-center justify-between py-4">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Abrir/Cerrar barra lateral"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              ☰
            </button>

            <h1 className="flex-1 px-3 text-center text-3xl font-extrabold text-gray-900">
              Sucursales e Inventario
            </h1>

            <div className="flex items-center gap-3">
              {/* botón agregar sucursal (desktop) */}
              <button
                onClick={irAgregarSucursal}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-900 text-white px-3 py-2 font-medium shadow hover:bg-gray-800"
              >
                <PlusCircle size={18} />
                Agregar sucursal
              </button>
              <span className="min-w-[120px] text-right text-gray-600 font-medium">
                {hora}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* mensaje inline */}
      {mensaje && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-4">
          <div className="rounded-lg border px-4 py-3 text-sm bg-yellow-50 border-yellow-200 text-yellow-900">
            {mensaje}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {/* CARDS de sucursales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {sucursales.map((sucursal) => (
            <div
              key={sucursal.id}
              onClick={() => toggleSucursal(sucursal.id)}
              className={`bg-white/90 backdrop-blur border rounded-xl p-5 shadow-sm hover:shadow-md transition cursor-pointer ${
                sucursalSeleccionada === sucursal.id ? "ring-2 ring-red-500" : "border-gray-200"
              }`}
            >
              <p className="font-semibold text-gray-900 text-lg">
                {sucursal.descripcion}
              </p>
              <p className="text-gray-600 mb-4">
                Comuna: <span className="font-medium">{sucursal.Comuna}</span>
              </p>

              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    editarSucursal(sucursal);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                >
                  <Pencil size={16} />
                  Editar
                </button>

                <button
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* PANEL inventario */}
        {sucursalSeleccionada && (
          <div className="w-full bg-white/90 backdrop-blur shadow-lg rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 bg-red-50 border-b border-red-200">
              <h3 className="text-lg sm:text-xl font-semibold text-red-800 text-center">
                Inventario {nombreSucursal ? `– ${nombreSucursal}` : ""}
              </h3>
            </div>

            {/* tabs */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-4 sm:px-6 pt-4">
              {["inventario", "formulario"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTabActiva(t)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition shadow-sm ${
                    tabActiva === t
                      ? "bg-red-600 text-white border-red-700 shadow"
                      : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                  }`}
                >
                  {t === "inventario"
                    ? "Inventario"
                    : editando
                    ? "Editar Registro"
                    : "Agregar Inventario"}
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-6">
              {tabActiva === "inventario" && (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-left text-gray-800">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 sm:px-6 py-3">ID</th>
                        <th className="px-4 sm:px-6 py-3">Tipo</th>
                        <th className="px-4 sm:px-6 py-3">Descripción</th>
                        <th className="px-4 sm:px-6 py-3">Stock</th>
                        <th className="px-4 sm:px-6 py-3">Unidad</th>
                        <th className="px-4 sm:px-6 py-3">Fecha</th>
                        <th className="px-4 sm:px-6 py-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventario.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-6 text-center text-gray-500">
                            No hay inventario disponible
                          </td>
                        </tr>
                      ) : (
                        inventario.map((inv, i) => (
                          <tr
                            key={inv.id}
                            className={`${i % 2 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition`}
                          >
                            <td className="px-4 sm:px-6 py-3">{inv.id}</td>
                            <td className="px-4 sm:px-6 py-3 capitalize">{inv.tipo}</td>
                            <td className="px-4 sm:px-6 py-3">{inv.descripcion}</td>
                            <td className="px-4 sm:px-6 py-3">{inv.stock_actual}</td>
                            <td className="px-4 sm:px-6 py-3">{inv.unidad}</td>
                            <td className="px-4 sm:px-6 py-3">{inv.fecha_ingreso}</td>
                            <td className="px-4 sm:px-6 py-3">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    editarRegistro(inv);
                                  }}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 text-sm"
                                >
                                  <Edit2 size={16} />
                                  Editar
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    eliminarInventario(inv.id);
                                  }}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                                >
                                  <Trash2 size={16} />
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {tabActiva === "formulario" && (
                <form onSubmit={guardarInventario} className="mt-2 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Tipo</label>
                      <select
                        value={nuevo.tipo}
                        onChange={(e) => setNuevo({ ...nuevo, tipo: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                      >
                        <option value="item">Item</option>
                        <option value="insumo">Insumo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Descripción</label>
                      <input
                        type="text"
                        value={nuevo.descripcion}
                        onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                        placeholder="Nombre"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Stock actual</label>
                      <input
                        type="number"
                        value={nuevo.stock_actual}
                        onChange={(e) => setNuevo({ ...nuevo, stock_actual: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Fecha de ingreso</label>
                      <input
                        type="date"
                        value={nuevo.fecha_ingreso}
                        onChange={(e) => setNuevo({ ...nuevo, fecha_ingreso: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      <PlusCircle size={18} /> {editando ? "Guardar" : "Agregar"}
                    </button>

                    {editando && (
                      <button
                        type="button"
                        onClick={cancelarEdicion}
                        className="inline-flex items-center gap-2 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400"
                      >
                        <XCircle size={18} /> Cancelar
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
