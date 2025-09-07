import { useState } from "react";
import logo from "./img/logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Email: ${email}\nPassword: ${password}`);
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
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
