import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

export default function CreateUser() {
  const { sidebarOpen, setSidebarOpen } = useOutletContext();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [vpassword, setVPassword] = useState("");

  const [isModalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    is_staff: false,
  });

  const [hora, setHora] = useState("");

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

    actualizarHora(); // inicial
    const intervalo = setInterval(actualizarHora, 1000);

    return () => clearInterval(intervalo); // cleanup
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== vpassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    else {
      try {
        const res = await fetch(`${apiUrl}api/register/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        alert(data.message || data.error || "Registro exitoso");
      } catch (err) {
        console.error("Error en handleSubmit:", err);
        alert("Ocurrió un error al registrar. Intenta nuevamente.");
      } finally {
        console.log("Petición finalizada");
        formData.username = "";
        formData.email = "";
        formData.first_name = "";
        formData.last_name = "";
        formData.password = "";
        formData.is_staff = false;
        setVPassword("");
        // acá podrías desactivar un loader/spinner
      }
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header centrado con hora */}
      <header className="flex justify-between items-center bg-white shadow px-6 py-4">
        {/* Botón ☰ */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ☰
        </button>

        {/* Título centrado */}
        <h2 className="text-3xl font-bold text-gray-800 text-center flex-1">
          Crear Usuario
        </h2>

        {/* Hora */}
        <span className="text-gray-600 font-medium">{hora}</span>
      </header>

      {/* Formulario centrado */}
      <main className="flex-1 flex items-center justify-center p-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-3xl mx-4"
        >
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
            Crear Usuario
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              name="username"
              placeholder="Usuario"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-700"
              value={formData.username}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Correo"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-700"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="first_name"
              placeholder="Primer Nombre"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-700"
              value={formData.first_name}
              onChange={handleChange}
            />

            <input
              type="text"
              name="last_name"
              placeholder="Apellido"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-700"
              value={formData.last_name}
              onChange={handleChange}
            />
            <input
              type="password"
              name="password2"
              placeholder="Contraseña"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-700 md:col-span-2"
              value={vpassword}
              onChange={(e) => setVPassword(e.target.value)}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Repetir Contraseña"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-700 md:col-span-2"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <label className="flex items-center gap-2 mt-6 mb-6 text-gray-700">
            <input
              type="checkbox"
              name="is_staff"
              checked={formData.is_staff}
              onChange={handleChange}
              className="h-4 w-4 accent-red-500"
            />
            ¿Es administrador?
          </label>

          <button
            type="submit"
            className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition"
          >
            Crear Usuario
          </button>
        </form>
      </main>
    </div>
  );
}
