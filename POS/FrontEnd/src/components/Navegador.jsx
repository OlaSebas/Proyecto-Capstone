import { Link } from "react-router-dom";
import Login from "../login";
import Venta from "../pages/Venta"; 

export function Navegador() {
    return (
        <nav className="bg-pink-500 p-6">
            <ul className="flex space-x-6">
                <li>
                    <Link to="/Login">
                        Login
                    </Link>
                </li>
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
            </ul>
        </nav>
    );
}
export default Navegador;