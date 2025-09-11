import { Link, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";

export function Layout() {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [nombre, setNombre] = useState("");

    useEffect(() => {
        const fetchNombre = async () => {
            try {
                const response = await fetch(`${apiUrl}profile/`, {
                    headers: {
                        Authorization: `Token ${localStorage.getItem("token")}`,
                    },
                });
                const data = await response.json();
                setNombre(data.first_name);
                localStorage.setItem("is_staff", data.is_staff);
            } catch (error) {
                console.error("Error al cargar perfil:", error);
            }
        };
        fetchNombre();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/Login";
    };

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-red-500 text-white p-6 flex flex-col">
                <h2 className="text-2xl font-bold mb-6">Danny Pollos</h2>
                <nav className="flex flex-col gap-4 text-lg">
                    <Link to="/Home" className="hover:text-white-200">Inicio</Link>
                    <Link to="/Venta" className="hover:text-white-200">Venta</Link>
                    <Link to="/Producto" className="hover:text-white-200">Producto</Link>
                    <Link to="/InventarioStock" className="hover:text-white-200">Inventario Stock</Link>
                    <Link to="/RegistroUsuario" className="hover:text-white-200">Registro Usuario</Link>
                    <span className="mt-4">{nombre}</span>
                    <button
                        onClick={handleLogout}
                        className="mt-auto bg-white text-white-500 py-2 rounded hover:bg-gray-200"
                    >
                        Logout
                    </button>
                </nav>
            </aside>

            {/* Contenido principal */}
            <main className="flex-1 bg-gray-100 min-h-screen">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;
