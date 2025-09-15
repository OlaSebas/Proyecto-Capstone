import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

export default function SucursalForm() {
  const { sidebarOpen, setSidebarOpen } = useOutletContext();
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
      const res = await fetch(`${apiUrl}sucursales/create/`, {
        method: "POST",
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
      alert(data.message || "Sucursal creada con éxito");

      // Limpiar formulario
      setFormData({ descripcion: "", direccion: "" });
      setSelectedComuna("");
    } catch (err) {
      console.error("Error al crear sucursal:", err);
      alert("Ocurrió un error al crear la sucursal");
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

        <h2 className="text-3xl font-bold text-gray-800 text-center flex-1">
          Crear Sucursal
        </h2>

        <span className="text-gray-600 font-medium">{hora}</span>
      </header>

      {/* Formulario */}
      <main className="flex-1 flex items-center justify-center p-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-3xl mx-4"
        >
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
            Crear Sucursal
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              name="descripcion"
              placeholder="Nombre de la Sucursal"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-700"
              value={formData.descripcion}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="direccion"
              placeholder="Dirección"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-700"
              value={formData.direccion}
              onChange={handleChange}
              required
            />

            {/* Dropdown de comunas */}
            <select
              value={selectedComuna}
              onChange={(e) => setSelectedComuna(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-700 md:col-span-2"
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
            className="w-full mt-6 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition"
          >
            Crear Sucursal
          </button>
        </form>
      </main>
    </div>
  );
}
