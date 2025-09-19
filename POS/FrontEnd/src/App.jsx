import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/login/Login";
import Layout from "./components/Layout";
import Venta from "./pages/Venta";
import Producto from "./pages/Producto";
import InventarioStock from "./pages/InventarioStock";
import Home from "./pages/Home";
import Carrito from "./pages/Carrito";
import MetodoPago from "./pages/MetodoPago";
import { Navegador } from "./components/Navegador";
import ProtectedRoute from "./components/protectedRoute";
import ViewAdminPR from "./components/ViewAdminPR";
import RegistroUsuario from "./pages/admin/RegistroUsuario";
import AgregarProducto from "./pages/AgregarProducto";
import AgregarPromocion from "./pages/AgregarPromocion";
import PedidosDelivery from "./pages/PedidosDelivery";
import Proveedores from "./pages/Proveedor";
import './App.css';
import Sucursal from "./pages/Sucursal";
import InventarioSuc from "./pages/InventarioSuc";
import SucursalForm from "./pages/formularios/SucursalForm";
import SucursalEdit from "./pages/editor/SucursalEdit";
import { View } from "lucide-react";


function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        {/* Ruta raíz: va al login si no hay token */}
        <Route path="/" element={!token ? <Navigate to="/Login" replace /> : <Navigate to="/Home" replace />} />

        {/* LOGIN: si ya hay sesión, redirige a Home */}
        <Route path="/Login" element={!token ? <Login /> : <Navigate to="/Home" replace />} />

        {/* Rutas protegidas con Layout */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/Home" element={<Home />} />
          <Route path="/Venta" element={<Venta />} />
          <Route path="/Producto" element={<Producto />} />
          <Route path="/InventarioStock" element={<InventarioStock />} />
          <Route path="/RegistroUsuario" element={<ViewAdminPR><RegistroUsuario /></ViewAdminPR>} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path= "/Sucursal" element={<ViewAdminPR><Sucursal /></ViewAdminPR>} />
          <Route path="/inventarioSuc/:sucursalId" element={<InventarioSuc />} />
          <Route path="/sucursalForm" element={<ViewAdminPR><SucursalForm /></ViewAdminPR>} />
          <Route path="/sucursalEdit/:id" element={<ViewAdminPR><SucursalEdit /></ViewAdminPR>} />
          <Route path="/MetodoPago" element={<MetodoPago />} />
          <Route path="/AgregarProducto" element={<ViewAdminPR><AgregarProducto /></ViewAdminPR>} />
          <Route path="/AgregarPromocion" element={<ViewAdminPR><AgregarPromocion /></ViewAdminPR>} />
          <Route path="/PedidosDelivery" element={<PedidosDelivery />} />
          <Route path="/proveedor" element={<Proveedores />} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
