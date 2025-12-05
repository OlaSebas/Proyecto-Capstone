import { useState } from "react";
import logo from "../../img/logo.png";

export default function Login() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // nuevo estado para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);

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

      // Guardar token
      localStorage.setItem("token", data.token);

      // Guardar sesión de caja si existe
      if (data.User.caja) {
        const cajaId = data.User.caja.id;
        localStorage.setItem("caja", cajaId);
        console.info(`Caja asignada: ${cajaId}`);

        // Abrir sesión de caja
        try {
          const resSesion = await fetch(`${apiUrl}api/sesion_create/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${data.token}`,
            },
            body: JSON.stringify({ caja: cajaId, monto_inicial: 0 }),
          });

          if (!resSesion.ok) {
            const errorData = await resSesion.json();
            console.error("❌ Error al abrir sesión de caja:", errorData);
          } else {
            const sesion = await resSesion.json();
            localStorage.setItem("sesionCaja", sesion.id);
            console.log("✅ Sesión de caja abierta:", sesion);
          }
        } catch (err) {
          console.error("⚠️ Error en la petición de sesión de caja:", err);
        }
      } else {
        localStorage.removeItem("caja"); // Usuario sin caja → admin/global
      }

      console.log("✅ Usuario logeado:", data.User);

      // Cache temporal de productos y promociones (no bloqueante)
      try {
        const [productosRes, promocionesRes] = await Promise.all([
          fetch(`${apiUrl}inventario/productos/`, {
            method: "GET",
            headers: { Authorization: `Token ${data.token}` },
          }),
          fetch(`${apiUrl}inventario/promociones/`, {
            method: "GET",
            headers: { Authorization: `Token ${data.token}` },
          }),
        ]);

        const productos = await productosRes.json();
        const promociones = await promocionesRes.json();

        sessionStorage.setItem("productosCache", JSON.stringify(productos));
        sessionStorage.setItem("promocionesCache", JSON.stringify(promociones));

        console.log("🧠 Cache creado:", {
          productos: productos.length,
          promociones: promociones.length,
        });
      } catch (cacheError) {
        console.warn("⚠️ No se pudieron cargar productos/promociones al cache:", cacheError);
      }

      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">
      {/* Contenedor principal */}
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
          Bienvenido al sistema POS
        </h2>
        <p className="text-center text-gray-600 mb-8 text-sm sm:text-base">
          Ingresa tus credenciales
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

          {/* input de contraseña con botón ojo */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 transition text-black placeholder-gray-500 pr-12"
              required
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
            >
              {showPassword ? (
                /* eye-off */
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.016.156-1.99.45-2.91M3 3l18 18" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.94 10.94a3 3 0 104.24 4.24M9.88 5.5A9.97 9.97 0 0112 5c5.523 0 10 4.477 10 10 0 1.016-.156 1.99-.45 2.91" />
                </svg>
              ) : (
                /* eye */
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              )}
            </button>
          </div>

          {error && <p className="text-red-500 text-center text-sm">{error}</p>}

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
