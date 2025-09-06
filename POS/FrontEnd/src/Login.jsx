import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Email: ${email}\nPassword: ${password}`);
  };

return (
  <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-200">
    <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10 mx-4">
      
      <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">
        Bienvenido
      </h2>
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 transition text-black placeholder-black"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 transition text-black placeholder-black"
          required
        />
        <button
          type="submit"
          className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
        >
          Entrar
        </button>
      </form>
      
      <p className="text-center text-gray-500 mt-4">
        ¿Olvidaste tu contraseña?{" "}
        <span className="text-red-500 font-semibold cursor-pointer">
          Recordar
        </span>
      </p>
      
    </div>
  </div>
);

}