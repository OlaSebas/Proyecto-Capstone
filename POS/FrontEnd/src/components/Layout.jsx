import { Link, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Home,
  ClipboardList,
  UserPlus,
  LogOut,
  HousePlus,
  PackagePlus,
  Package2,
  LayoutDashboard,
} from "lucide-react";

export function Layout() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [_nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [isStaff, setIsStaff] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const response = await fetch(`${apiUrl}api/profile/`, {
          headers: { Authorization: `Token ${localStorage.getItem("token")}` },
        });
        if (!response.ok) throw new Error("Error al obtener el perfil");
        const data = await response.json();

        localStorage.removeItem("is_staff");
        setNombre(data.first_name || "");
        setUsuario(data.username || "");
        setIsStaff(Boolean(data.is_staff));
        localStorage.setItem("is_staff", JSON.stringify(data.is_staff));
      } catch (error) {
        console.error("Error al cargar perfil:", error);
      }
    };
    fetchPerfil();
  }, [apiUrl]);

  const handleLogout = async() => {
    try {
      const response = await fetch(`${apiUrl}api/logout/`, {
        method: "POST",
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error("Error al obtener el perfil");
      const data = await response.json();
      localStorage.removeItem("token");
      localStorage.removeItem("is_staff");
      window.location.href = "/Login";
    }
    catch {
      
    }
    
  };

  return (
    /* 🔧 Usamos dvh + overflow para que en teléfono horizontal haya scroll */
    <div className="flex min-h-dvh md:min-h-screen overflow-y-auto md:overflow-y-visible">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 h-dvh overflow-y-auto
        bg-gradient-to-b from-red-600 via-red-500 to-red-400
        text-white p-6 flex flex-col transform transition-transform duration-300 z-40
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-extrabold tracking-wide">Danny Pollos</h2>
        </div>

        <nav className="flex flex-col gap-3 text-lg flex-1">
          <Link
            to="/Home"
            className="flex items-center justify-center gap-3 bg-white text-red-600 py-3 rounded-lg hover:bg-gray-200 transition font-semibold"
          >
            <Home size={20} /> Inicio
          </Link>

          {isStaff && (
            <>
              <Link
                to="/Sucursal"
                className="flex items-center justify-center gap-3 bg-white text-red-600 py-3 rounded-lg hover:bg-gray-200 transition font-semibold"
              >
                <HousePlus size={20} /> Sucursal/Inventario
              </Link>

              <Link
                to="/AgregarProducto"
                className="flex items-center justify-center gap-3 bg-white text-red-600 py-3 rounded-lg hover:bg-gray-200 transition font-semibold"
              >
                <PackagePlus size={20} /> Gestión Producto
              </Link>

              <Link
                to="/AgregarPromocion"
                className="flex items-center justify-center gap-3 bg-white text-red-600 py-3 rounded-lg hover:bg-gray-200 transition font-semibold"
              >
                <Package2 size={20} /> Gestión Promoción
              </Link>

              <Link
                to="/ReporteVenta"
                className="flex items-center justify-center gap-3 bg-white text-red-600 py-3 rounded-lg hover:bg-gray-200 transition font-semibold"
              >
                <ClipboardList size={20} /> Reporte de Ventas
              </Link>

              <Link
                to="/RegistroUsuario"
                className="flex items-center justify-center gap-3 bg-white text-red-600 py-3 rounded-lg hover:bg-gray-200 transition font-semibold"
              >
                <UserPlus size={20} /> Registro Usuario
              </Link>

              <Link
                to="/Dashboard"
                className="flex items-center justify-center gap-3 bg-white text-red-600 py-3 rounded-lg hover:bg-gray-200 transition font-semibold"
              >
                <LayoutDashboard size={20} /> Dashboard
              </Link>
            </>
          )}
        </nav>

        <div className="mt-auto">
          <span className="block mb-3 text-sm opacity-90">
            Hola, Colega <span className="font-semibold">{usuario}</span>
          </span>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white text-red-600 py-3 rounded-lg hover:bg-gray-200 transition font-semibold"
          >
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Overlay (solo móvil) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenido principal */}
      <div
        className={`flex-1 flex flex-col min-h-dvh md:min-h-screen bg-gray-100 transition-all duration-300 
        ${sidebarOpen ? "md:ml-64" : "md:ml-0"}`}
      >
        {/* 🔧 Permitimos scroll dentro del área de contenido (clave en landscape) */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet context={{ sidebarOpen, setSidebarOpen }} />
        </main>
      </div>
    </div>
  );
}

export default Layout;
