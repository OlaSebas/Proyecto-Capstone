import { useState } from "react";

export default function CreateUser() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    is_admin: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8000/api/users/create/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    alert(data.message || data.error);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center p-6 bg-white shadow-md">
          <h2 className="text-3xl font-bold text-gray-800">Crear Usuario</h2>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              Inicio
            </button>
            <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              Cerrar Sesión
            </button>
          </div>
        </header>

        {/* Formulario centrado */}
        <main className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
              Crear Usuario
            </h2>

            <input
              type="text"
              name="username"
              placeholder="Username"
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-700"
              value={formData.username}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-700"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-700"
              value={formData.first_name}
              onChange={handleChange}
            />

            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-700"
              value={formData.last_name}
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-700"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <label className="flex items-center gap-2 mb-6 text-gray-700">
              <input
                type="checkbox"
                name="is_admin"
                checked={formData.is_admin}
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
    </div>
  );
}
