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
      }
    };

    fetchComunas();
  }, [apiUrl]);

  // Obtener datos de la sucursal seleccionada
  useEffect(() => {
    const fetchSucursal = async () => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComuna) {
      alert("Debes seleccionar una comuna");
      return;
    }

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
      alert(data.message || "Sucursal actualizada con éxito");

      navigate("/sucursal"); // volver a la lista
    } catch (err) {
      console.error("Error al actualizar sucursal:", err);
      alert("Ocurrió un error al actualizar la sucursal");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
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

      {/* Formulario */}
      <main className="flex-1 flex items-center justify-center p-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-3xl mx-4"
        >
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
            Editar Sucursal
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              name="descripcion"
              placeholder="Nombre de la Sucursal"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
              value={formData.descripcion}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="direccion"
              placeholder="Dirección"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
              value={formData.direccion}
              onChange={handleChange}
              required
            />

            {/* Dropdown de comunas */}
            <select
              value={selectedComuna}
              onChange={(e) => setSelectedComuna(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 md:col-span-2"
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

          <button
            type="submit"
            className="w-full mt-6 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
          >
            Guardar Cambios
          </button>
        </form>
      </main>
    </div>
  );
}
