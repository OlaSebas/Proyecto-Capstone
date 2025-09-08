import { Link } from "react-router-dom";
import Login from "../pages/login/Login";
import Venta from "../pages/Venta";
import { useState, useEffect } from "react";


export function Navegador() {
    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/Login";
    };
    const [nombre, setNombre] = useState("");
    useEffect(() => {
        const fetchNombre = async () => {
            const response = await fetch("http://127.0.0.1:8000/api/profile/", {
                headers: {
                    Authorization: `Token ${localStorage.getItem("token")}`,
                },
            });
            const data = await response.json();
            setNombre(data.first_name);
        };
        fetchNombre();
    }, []);
    return (
        <nav className="bg-pink-500 p-6">
            <ul className="flex space-x-6">
                <li>
                    <Link to="/Venta">
                        Venta
                    </Link>
                </li>
                <li>
                    <Link to="/Producto">
                        Producto
                    </Link>
                </li>
                <li>
                    <Link to="/InventarioStock">
                        Inventario Stock
                    </Link>
                </li>
                <li>
                    <span>{nombre}</span>
                </li>
                <li>
                    <button onClick={handleLogout}>Logout</button>
                </li>
            </ul>
        </nav>
    );
}
export default Navegador;