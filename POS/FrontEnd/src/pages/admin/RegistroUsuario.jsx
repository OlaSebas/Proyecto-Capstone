import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

export default function UserManagement() {
  const { sidebarOpen, setSidebarOpen } = useOutletContext();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [tab, setTab] = useState("crear");
  const [hora, setHora] = useState("");

  // Datos del formulario
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "", // contraseña principal
    is_staff: false,
  });
  const [vpassword, setVPassword] = useState(""); // repetir contraseña

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
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
          Authorization: `Token ${localStorage.getItem("token")}`,
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
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Error al obtener usuarios");
      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert("Error cargando usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "gestionar") fetchUsuarios();
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
          Authorization: `Token ${localStorage.getItem("token")}`,
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
          Authorization: `Token ${localStorage.getItem("token")}`,
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

  // ====== Botonera responsive dentro del card ======
  const CornerTabs = () => (
    <div
      className={`
        /* móvil: barra sticky arriba del card */
        sticky top-0 -mx-4 sm:mx-0 bg-white/90 backdrop-blur px-4 py-2 z-20
        /* desktop: esquina superior derecha absoluta, sin fondo extra */
        md:absolute md:top-3 md:right-3 md:bg-transparent md:px-0 md:py-0
      `}
    >
      <div className="flex flex-col sm:flex-row md:flex-row gap-2 md:gap-2">
        <button
          onClick={() => setTab("crear")}
          className={`w-full sm:w-auto md:w-auto px-3 py-2 rounded-md text-sm transition
            ${tab === "crear"
              ? "bg-red-600 text-white shadow"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
        >
          Crear Usuario
        </button>
        <button
          onClick={() => setTab("gestionar")}
          className={`w-full sm:w-auto md:w-auto px-3 py-2 rounded-md text-sm transition
            ${tab === "gestionar"
              ? "bg-red-600 text-white shadow"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
        >
          Gestionar Usuarios
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-red-100 via-white to-red-200">
      {/* === Header: NO TOCADO (misma barra / mismo botón ☰) === */}
      <header className="flex flex-col gap-3 sm:flex-row sm:gap-0 sm:justify-between sm:items-center bg-white shadow px-4 sm:px-6 py-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
          aria-label="Abrir/Cerrar barra lateral"
        >
          ☰
        </button>
        <h2 className="flex-1 px-3 text-center text-3xl font-extrabold text-gray-900">
          Gestión de Usuarios
        </h2>
        <span className="text-gray-600 font-medium text-center sm:text-right">
          {hora}
        </span>
      </header>

      {/* Contenido */}
      <main className="flex-1 p-4 sm:p-6">
        {/* === Tab: Crear === */}
        {tab === "crear" && (
          <div className="relative bg-white p-6 sm:p-10 rounded-2xl shadow-2xl w-full max-w-3xl mx-auto">
            <CornerTabs />
            <form onSubmit={handleSubmit} className="mt-2 md:mt-10">
              <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">
                Crear Usuario
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <input
                  type="text"
                  name="username"
                  placeholder="Usuario"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Correo"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="first_name"
                  placeholder="Primer Nombre"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                  value={formData.first_name}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="last_name"
                  placeholder="Apellido"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                  value={formData.last_name}
                  onChange={handleChange}
                />

                {/* Contraseña (principal) */}
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  className="w-full p-3 border border-gray-300 rounded-lg md:col-span-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                {/* Repetir contraseña */}
                <input
                  type="password"
                  placeholder="Repetir Contraseña"
                  className="w-full p-3 border border-gray-300 rounded-lg md:col-span-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                  value={vpassword}
                  onChange={(e) => setVPassword(e.target.value)}
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
          </div>
        )}

        {/* === Tab: Gestionar === */}
        {tab === "gestionar" && (
          <div className="relative bg-white shadow-lg rounded-lg p-4 sm:p-6 max-w-6xl mx-auto">
            <CornerTabs />
            {loading ? (
              <p className="text-center mt-4 md:mt-10">Cargando usuarios...</p>
            ) : (
              <>
                {/* Tabla (sm y +) */}
                <div className="hidden sm:block w-full overflow-x-auto mt-4 md:mt-10">
                  <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="min-w-[720px] w-full table-auto">
                      <thead className="bg-red-600 text-white sticky top-0 z-10">
                        <tr className="text-left text-sm uppercase tracking-wide">
                          <th className="p-3">Usuario</th>
                          <th className="p-3">Correo</th>
                          <th className="p-3">Nombre</th>
                          <th className="p-3">Apellido</th>
                          <th className="p-3">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm text-gray-800">
                        {usuarios.length > 0 ? (
                          usuarios.map((u, idx) => (
                            <tr
                              key={u.id}
                              className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-red-50 transition-colors`}
                            >
                              <td className="p-3 align-top">{u.username}</td>
                              <td className="p-3 align-top">
                                <span className="block max-w-[260px] truncate">{u.email}</span>
                              </td>
                              <td className="p-3 align-top">{u.first_name}</td>
                              <td className="p-3 align-top">{u.last_name}</td>
                              <td className="p-3 align-top">
                                <div className="flex flex-wrap gap-2">
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
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="p-6 text-center text-gray-500">
                              No hay usuarios disponibles
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tarjetas (solo móvil) */}
                <ul className="sm:hidden space-y-3 mt-3">
                  {usuarios.length > 0 ? (
                    usuarios.map((u) => (
                      <li key={u.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800">{u.username}</h4>
                          <span className="text-xs text-gray-500">ID: {u.id}</span>
                        </div>
                        <div className="text-sm text-gray-700 space-y-1">
                          <p><span className="font-medium">Correo:</span> {u.email}</p>
                          <p><span className="font-medium">Nombre:</span> {u.first_name}</p>
                          <p><span className="font-medium">Apellido:</span> {u.last_name}</p>
                        </div>
                        <div className="mt-3 flex flex-col gap-2">
                          <button
                            onClick={() => handleEdit(u)}
                            className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Eliminar
                          </button>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="text-center text-gray-500">No hay usuarios disponibles</li>
                  )}
                </ul>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
