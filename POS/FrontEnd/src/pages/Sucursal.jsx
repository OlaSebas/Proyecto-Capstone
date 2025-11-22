import React, { useEffect, useState } from "react";
import axios from "axios";
import { PlusCircle, Trash2, Edit2, XCircle, Pencil } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function InventarioSucursalesPage() {
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen } = useOutletContext();

  const [sucursales, setSucursales] = useState([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);
  const [inventario, setInventario] = useState([]);
  const [tabActiva, setTabActiva] = useState("inventario");
  const [hora, setHora] = useState("");
  const [nuevo, setNuevo] = useState({
    tipo: "item",
    descripcion: "",
    stock_actual: "",
    fecha_ingreso: new Date().toISOString().split("T")[0],
  });
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const token = localStorage.getItem("token");
  const apiUrl = import.meta.env.VITE_API_URL_INVENTARIO;

  const editarSucursal = (sucursal) => {
    navigate(`/sucursalEdit/${sucursal.id}`);
  };

  // Cargar sucursales
  useEffect(() => {
    fetch(`${apiUrl}sucursales/`, {
      headers: { Authorization: `Token ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSucursales(Array.isArray(data) ? data : []))
      .catch(() => setSucursales([]));
  }, [apiUrl, token]);

  // Actualizar hora
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

  // Cargar inventario según sucursal
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

      // ⭐ CORRECCIÓN: usar fecha de última actualización real
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
            unidad:
              item.item?.unidad_medida || item.insumo?.unidad_medida || "-",

            // ⭐ ESTA ES LA FECHA REAL DE ÚLTIMA ACTUALIZACIÓN
            fecha_ingreso:
              item.fecha_modificacion ??
              item.updated_at ??
              item.fecha_ingreso ??
              "-",
          }))
        : [];

      setInventario(invNormalizado);
    } catch {
      setInventario([]);
    }
  };

  // Guardar inventario
  const guardarInventario = async (e) => {
    e.preventDefault();

    if (
      !nuevo.descripcion ||
      !nuevo.stock_actual ||
      !sucursalSeleccionada ||
      !nuevo.fecha_ingreso
    ) {
      setMensaje("Completa todos los campos obligatorios.");
      return;
    }

    try {
      const payload = { ...nuevo, sucursal: sucursalSeleccionada };
      const axiosConfig = { headers: { Authorization: `Token ${token}` } };

      if (editando) {
        await axios.put(`${apiUrl}update/${editando}/`, payload, axiosConfig);
        setMensaje("Inventario actualizado");
        setEditando(null);
      } else {
        await axios.post(`${apiUrl}create/`, payload, axiosConfig);
        setMensaje("Inventario agregado");
      }

      toggleSucursal(sucursalSeleccionada);

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
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex justify-between items-center bg-white shadow px-6 py-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ☰
        </button>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center flex-1">
          Sucursales e Inventario
        </h2>
        <span className="text-gray-600 font-medium">{hora}</span>
      </header>

      {mensaje && (
        <div className="mx-6 mt-4 p-3 rounded bg-yellow-100 text-yellow-800 border border-yellow-200">
          {mensaje}
        </div>
      )}

      <main className="flex-1 p-6 overflow-y-auto">
        {/* Cards de sucursales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
          {sucursales.map((sucursal) => (
            <div
              key={sucursal.id}
              onClick={() => toggleSucursal(sucursal.id)}
              className={`bg-white border rounded-lg shadow hover:shadow-lg transition cursor-pointer text-center p-6 ${
                sucursalSeleccionada === sucursal.id
                  ? "ring-2 ring-red-500"
                  : ""
              }`}
            >
              <p className="font-semibold text-gray-800 text-lg">
                {sucursal.descripcion}
              </p>
              <p className="text-gray-500 mb-4">Comuna: {sucursal.Comuna}</p>

              <div className="flex justify-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    editarSucursal(sucursal);
                  }}
                  className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-900 flex items-center gap-1"
                >
                  <Pencil size={16} /> Editar
                </button>

                <button
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1"
                >
                  <Trash2 size={16} /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {sucursalSeleccionada && (
          <div className="w-full max-w-6xl mx-auto bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
            <div className="flex justify-center items-center px-6 py-4 bg-red-100 border-b border-red-300">
              <h3 className="text-xl font-semibold text-red-800 text-center">
                Inventario {nombreSucursal ? `– ${nombreSucursal}` : ""}
              </h3>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-4">
              {["inventario", "formulario"].map((t) => (
                <button
                  key={t}
                  className={`px-3 sm:px-4 py-1 sm:py-2 rounded-t-lg ${
                    tabActiva === t
                      ? "bg-red-600 text-white"
                      : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                  }`}
                  onClick={() => setTabActiva(t)}
                >
                  {t === "inventario"
                    ? "Inventario"
                    : editando
                    ? "Editar Registro"
                    : "Agregar Inventario"}
                </button>
              ))}
            </div>

            <div className="p-6 border-t border-red-300">
              {tabActiva === "inventario" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-gray-700 border-collapse divide-y divide-red-300">
                    <thead className="bg-red-200 text-red-900 border-b border-red-300">
                      <tr>
                        <th className="px-6 py-3 border-r border-red-300">
                          ID
                        </th>
                        <th className="px-6 py-3 border-r border-red-300">
                          Tipo
                        </th>
                        <th className="px-6 py-3 border-r border-red-300">
                          Descripción
                        </th>
                        <th className="px-6 py-3 border-r border-red-300">
                          Stock
                        </th>
                        <th className="px-6 py-3 border-r border-red-300">
                          Unidad
                        </th>
                        <th className="px-6 py-3 border-r border-red-300">
                          Fecha
                        </th>
                        <th className="px-6 py-3">Acciones</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-red-200">
                      {inventario.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            No hay inventario disponible
                          </td>
                        </tr>
                      ) : (
                        inventario.map((inv, i) => (
                          <tr
                            key={inv.id}
                            className={`${
                              i % 2 === 0 ? "bg-white" : "bg-red-50"
                            } hover:bg-red-100 transition`}
                          >
                            <td className="px-6 py-4 border-r border-red-200">
                              {inv.id}
                            </td>
                            <td className="px-6 py-4 border-r border-red-200 capitalize">
                              {inv.tipo}
                            </td>
                            <td className="px-6 py-4 border-r border-red-200">
                              {inv.descripcion}
                            </td>
                            <td className="px-6 py-4 border-r border-red-200">
                              {inv.stock_actual}
                            </td>
                            <td className="px-6 py-4 border-r border-red-200">
                              {inv.unidad}
                            </td>

                            {/* ⭐ FECHA REAL DE LA ÚLTIMA ACTUALIZACIÓN */}
                            <td className="px-6 py-4 border-r border-red-200">
                              {inv.fecha_ingreso}
                            </td>

                            <td className="px-6 py-4 flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  editarRegistro(inv);
                                }}
                                className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs"
                              >
                                <Edit2 size={14} />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  eliminarInventario(inv.id);
                                }}
                                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {tabActiva === "formulario" && (
                <form
                  onSubmit={guardarInventario}
                  className="flex flex-col gap-4 mt-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Tipo
                      </label>
                      <select
                        value={nuevo.tipo}
                        onChange={(e) => setNuevo({ ...nuevo, tipo: e.target.value })}
                        className="w-full border rounded px-2 py-1"
                      >
                        <option value="item">Item</option>
                        <option value="insumo">Insumo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Descripción
                      </label>
                      <input
                        type="text"
                        value={nuevo.descripcion}
                        onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })}
                        className="w-full border rounded px-2 py-1"
                        placeholder="Nombre"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Stock actual
                      </label>
                      <input
                        type="number"
                        value={nuevo.stock_actual}
                        onChange={(e) => setNuevo({ ...nuevo, stock_actual: e.target.value })}
                        className="w-full border rounded px-2 py-1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Fecha de ingreso
                      </label>
                      <input
                        type="date"
                        value={nuevo.fecha_ingreso}
                        onChange={(e) =>
                          setNuevo({ ...nuevo, fecha_ingreso: e.target.value })
                        }
                        className="w-full border rounded px-2 py-1"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      type="submit"
                      className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      <PlusCircle size={18} /> {editando ? "Guardar" : "Agregar"}
                    </button>

                    {editando && (
                      <button
                        type="button"
                        onClick={cancelarEdicion}
                        className="flex items-center gap-2 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
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
