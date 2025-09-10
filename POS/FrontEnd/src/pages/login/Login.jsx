import { useState } from "react";
import logo from "../../img/logo.png";
import { Navigate } from "react-router-dom";


export default function Login() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al iniciar sesión");
      }

      // Guardamos el token en localStorage
      localStorage.setItem("token", data.token);

      console.log("Usuario logeado:", data.User);
      alert(`Bienvenido ${data.User.username}`);
      window.location.href = "/Venta";

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10 mx-4">

        {/* Logo o espacio de imagen */}
        <div className="flex justify-center mb-6">
          <img
            src={logo}

            alt="Logo Pollos Asados"
            className="w-24 h-24 object-contain"
          />
        </div>

        <h2 className="text-3xl font-bold text-center text-orange-600 mb-2">
          Danny Pollos
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Bienvenido al sistema POS
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 transition text-black placeholder-gray-500"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 transition text-black placeholder-gray-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
          >
            Entrar
          </button>
        </form>

        <p className="text-center text-gray-500 mt-4">
          ¿Olvidaste tu contraseña?{" "}
          <span className="text-orange-500 font-semibold cursor-pointer hover:underline">
            Recordar
          </span>
        </p>
      </div>
    </div>
  );
}
