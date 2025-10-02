import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

export default function UserManagement() {
  const { sidebarOpen, setSidebarOpen } = useOutletContext();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [tab, setTab] = useState("crear");
  const [vpassword, setVPassword] = useState("");
  const [hora, setHora] = useState("");

  // Datos del formulario
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    is_staff: false,
  });

  // Usuarios
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reloj
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

  // Manejo de inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Crear usuario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== vpassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    try {
      const res = await fetch(`${apiUrl}api/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

      const data = await res.json();
      alert(data.message || "Usuario creado con éxito");

      // Resetear formulario
      setFormData({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        is_staff: false,
      });
      setVPassword("");
      fetchUsuarios();
    } catch (err) {
      console.error("Error en handleSubmit:", err);
      alert("Ocurrió un error al registrar.");
    }
  };

  // Obtener usuarios
  const fetchUsuarios = async () => {
    try {
      const res = await fetch(`${apiUrl}api/users/`, {
        headers: {
          "Authorization": `Token ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) throw new Error("Error al obtener usuarios");
      const data = await res.json();
      setUsuarios(data); // ya vienen sin admins
    } catch (err) {
      console.error(err);
      alert("Error cargando usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "gestionar") {
      fetchUsuarios();
    }
  }, [tab]);

  // Editar usuario
  const handleEdit = async (user) => {
    const nuevoNombre = prompt("Nuevo nombre:", user.first_name);
    if (!nuevoNombre) return;

    try {
      const res = await fetch(`${apiUrl}api/users/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ id: user.id, first_name: nuevoNombre }),
      });

      if (!res.ok) throw new Error("Error al actualizar usuario");
      alert("Usuario actualizado");
      fetchUsuarios();
    } catch (err) {
      console.error(err);
      alert("Error al actualizar usuario");
    }
  };

  // Eliminar usuario
  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;

    try {
      const res = await fetch(`${apiUrl}api/users/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Error eliminando usuario");
      alert("Usuario eliminado");
      fetchUsuarios();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar usuario");
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
          Gestión de Usuarios
        </h2>
        <span className="text-gray-600 font-medium">{hora}</span>
      </header>

      {/* Contenido de tabs */}
      <main className="flex-1 p-6">
        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded-t-lg ${tab === "crear"
                ? "bg-red-600 text-white"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              }`}
            onClick={() => setTab("crear")}
          >
            Crear Usuario
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg ${tab === "gestionar"
                ? "bg-red-600 text-white"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              }`}
            onClick={() => setTab("gestionar")}
          >
            Gestionar Usuarios
          </button>
        </div>
        {tab === "crear" && (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-3xl mx-auto"
          >
            <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">
              Crear Usuario
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                name="username"
                placeholder="Usuario"
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Correo"
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="first_name"
                placeholder="Primer Nombre"
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={formData.first_name}
                onChange={handleChange}
              />
              <input
                type="text"
                name="last_name"
                placeholder="Apellido"
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={formData.last_name}
                onChange={handleChange}
              />
              <input
                type="password"
                placeholder="Contraseña"
                className="w-full p-3 border border-gray-300 rounded-lg md:col-span-2"
                value={vpassword}
                onChange={(e) => setVPassword(e.target.value)}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Repetir Contraseña"
                className="w-full p-3 border border-gray-300 rounded-lg md:col-span-2"
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
        )}

        {tab === "gestionar" && (
          <div className="bg-white shadow-lg rounded-lg p-6 max-w-5xl mx-auto">
            {loading ? (
              <p className="text-center">Cargando usuarios...</p>
            ) : (
              <table className="w-full border rounded-lg overflow-hidden">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-3 border">Usuario</th>
                    <th className="p-3 border">Correo</th>
                    <th className="p-3 border">Nombre</th>
                    <th className="p-3 border">Apellido</th>
                    <th className="p-3 border">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.length > 0 ? (
                    usuarios.map((u) => (
                      <tr key={u.id} className="text-center">
                        <td className="border p-2">{u.username}</td>
                        <td className="border p-2">{u.email}</td>
                        <td className="border p-2">{u.first_name}</td>
                        <td className="border p-2">{u.last_name}</td>
                        <td className="border p-2 flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(u)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-4 text-center text-gray-500"
                      >
                        No hay usuarios disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
