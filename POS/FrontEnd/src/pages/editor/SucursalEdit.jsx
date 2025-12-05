import { useState, useEffect } from "react";
import { useOutletContext, useParams, useNavigate } from "react-router-dom";

export default function SucursalEditForm() {
  const { sidebarOpen, setSidebarOpen } = useOutletContext();
  const { id } = useParams(); // ID de la sucursal desde la URL
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL_INVENTARIO;

  const [comunas, setComunas] = useState([]);
  const [selectedComuna, setSelectedComuna] = useState("");
  const [formData, setFormData] = useState({
    descripcion: "",
    direccion: "",
  });

  const [hora, setHora] = useState("");
  const [alerta, setAlerta] = useState(null); // { type: 'success' | 'error', text: string }
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Obtener comunas al cargar
  useEffect(() => {
    const fetchComunas = async () => {
      try {
        const res = await fetch(`${apiUrl}comunas/`, {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) throw new Error("Error al obtener comunas");
        const data = await res.json();
        setComunas(data);
      } catch (err) {
        console.error("Error al cargar comunas:", err);
        setAlerta({ type: "error", text: "Error al cargar comunas" });
      }
    };

    fetchComunas();
  }, [apiUrl]);

  // Obtener datos de la sucursal seleccionada
  useEffect(() => {
    const fetchSucursal = async () => {
      setCargando(true);
      try {
        const res = await fetch(`${apiUrl}sucursales/${id}/`, {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) throw new Error("Error al obtener sucursal");
        const data = await res.json();

        setFormData({
          descripcion: data.descripcion || "",
          direccion: data.direccion || "",
        });
        setSelectedComuna(data.comuna || "");
      } catch (err) {
        console.error("Error al cargar sucursal:", err);
        setAlerta({ type: "error", text: "Error al cargar la sucursal" });
      } finally {
        setCargando(false);
      }
    };

    if (id) fetchSucursal();
  }, [id, apiUrl]);

  // Actualizar hora
  useEffect(() => {
    const actualizarHora = () => {
      const now = new Date();
      const time = now.toLocaleTimeString("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setHora(time);
    };

    actualizarHora();
    const intervalo = setInterval(actualizarHora, 1000);
    return () => clearInterval(intervalo);
  }, []);

  // Autocerrar alerta
  useEffect(() => {
    if (!alerta) return;
    const t = setTimeout(() => setAlerta(null), 3500);
    return () => clearTimeout(t);
  }, [alerta]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComuna) {
      setAlerta({ type: "error", text: "Debes seleccionar una comuna" });
      return;
    }

    setGuardando(true);
    try {
      const res = await fetch(`${apiUrl}sucursales/update/${id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...formData,
          comuna: selectedComuna,
        }),
      });

      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      const data = await res.json();

      setAlerta({
        type: "success",
        text: data.message || "Sucursal actualizada con éxito",
      });

      // Redirigir a /sucursal después de 1.5 segundos
      setTimeout(() => {
        navigate("/sucursal");
      }, 1500);
    } catch (err) {
      console.error("Error al actualizar sucursal:", err);
      setAlerta({
        type: "error",
        text: "Ocurrió un error al actualizar la sucursal",
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-200 via-white to-gray-300">
      {/* Alerta flotante */}
      {alerta && (
        <div className="fixed top-4 inset-x-0 flex justify-center z-50 px-4">
          <div
            className={`max-w-lg w-full rounded-xl shadow-lg px-4 py-3 text-sm font-medium ${
              alerta.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {alerta.text}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Móvil: botón en pastilla + título + hora */}
          <div className="block md:hidden py-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Abrir/Cerrar barra lateral"
              className="w-full h-10 inline-flex items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              ☰
            </button>

            <h2 className="mt-3 text-center text-2xl font-extrabold text-gray-900">
              Editar Sucursal
            </h2>
            <span className="mt-1 block text-center text-gray-600 font-medium">
              {hora}
            </span>
          </div>

          {/* Desktop/Tablet: botón izq + título centro + hora der */}
          <div className="hidden md:flex items-center justify-between py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Abrir/Cerrar barra lateral"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              ☰
            </button>

            <h2 className="flex-1 px-3 text-center text-3xl font-extrabold text-gray-900">
              Editar Sucursal
            </h2>

            <span className="min-w-[120px] text-right text-gray-600 font-medium">
              {hora}
            </span>
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
              Cargando datos de la sucursal...
            </p>
          </div>
        </main>
      ) : (
        <>
          {/* Formulario */}
          <main className="flex-1 flex items-center justify-center p-6">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 sm:p-10 rounded-2xl shadow-2xl w-full max-w-3xl border border-gray-200"
            >
              <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">
                Editar Sucursal
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Nombre de la Sucursal
                  </label>
                  <input
                    type="text"
                    name="descripcion"
                    placeholder="Nombre de la Sucursal"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-700 bg-white"
                    value={formData.descripcion}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Dirección
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    placeholder="Dirección"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-700 bg-white"
                    value={formData.direccion}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Dropdown de comunas */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Comuna
                  </label>
                  <select
                    value={selectedComuna}
                    onChange={(e) => setSelectedComuna(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-700 bg-white"
                    required
                  >
                    <option value="">Selecciona una comuna</option>
                    {comunas.map((comuna) => (
                      <option key={comuna.id} value={comuna.id}>
                        {comuna.descripcion}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => navigate("/sucursal")}
                  className="w-full sm:flex-1 px-4 py-3 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className={`w-full sm:flex-1 px-4 py-3 rounded-lg transition font-semibold text-white ${
                    guardando
                      ? "bg-red-400 cursor-wait opacity-75"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {guardando ? (
                    <span className="inline-flex items-center gap-2">
                      <svg
                        className="w-4 h-4 animate-spin"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="opacity-25"
                        />
                        <path
                          d="M22 12a10 10 0 00-10-10"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          className="opacity-75"
                        />
                      </svg>
                      Guardando...
                    </span>
                  ) : (
                    "Guardar Cambios"
                  )}
                </button>
              </div>
            </form>
          </main>
        </>
      )}
    </div>
  );
}
