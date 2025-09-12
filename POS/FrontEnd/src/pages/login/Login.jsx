import { useState } from "react";
import logo from "../../img/logo.png";


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
      const res = await fetch(`${apiUrl}api/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al iniciar sesión");
      }

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
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">
      {/* Contenedor principal, ahora ocupa todo el alto y ancho */}
      <div className="w-full sm:w-11/12 md:w-2/3 lg:w-1/2 xl:w-1/3 bg-white rounded-2xl shadow-2xl p-8 sm:p-12 mx-4 flex flex-col justify-center">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src={logo}
            alt="Logo Pollos Asados"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
          />
        </div>

        {/* Título */}
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-orange-600 mb-2">
          Danny Pollos
        </h2>
        <p className="text-center text-gray-600 mb-8 text-sm sm:text-base">
          Bienvenido al sistema POS
        </p>

        {/* Formulario */}
        <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
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

          {error && (
            <p className="text-red-500 text-center text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
          >
            {loading ? "Cargando..." : "Entrar"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-500 mt-4 text-sm">
          ¿Olvidaste tu contraseña?{" "}
          <span className="text-orange-500 font-semibold cursor-pointer hover:underline">
            Recuperar
          </span>
        </p>
      </div>
    </div>
  );
}
