import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import './App.css';
import Login from "./pages/login/Login";
import Layout from "./components/Layout";
import Venta from "./pages/Venta";
import ReporteVenta from "./pages/admin/ReporteVenta";
import Producto from "./pages/Producto";
import InventarioStock from "./pages/InventarioStock";
import Home from "./pages/Home";
import Carrito from "./pages/Carrito";
import MetodoPago from "./pages/MetodoPago";
import ProtectedRoute from "./components/protectedRoute";
import ViewAdminPR from "./components/ViewAdminPR";
import RegistroUsuario from "./pages/admin/RegistroUsuario";
import AgregarProducto from "./pages/formularios/AgregarProducto";
import AgregarPromocion from "./pages/formularios/AgregarPromocion";
import PedidosDelivery from "./pages/PedidosDelivery";
import Proveedores from "./pages/Proveedor";
import Sucursal from "./pages/Sucursal";

import SucursalForm from "./pages/formularios/SucursalForm";
import SucursalEdit from "./pages/editor/SucursalEdit";
import Efectivo from "./pages/metodos/Efectivo";
import Debito from "./pages/metodos/Debito";
import Credito from "./pages/metodos/Credito";
import Transferencia from "./pages/metodos/Transferencia";
import Dashboard from "./pages/admin/DashBoard";


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
          <Route path="/sucursalForm" element={<ViewAdminPR><SucursalForm /></ViewAdminPR>} />
          <Route path="/sucursalEdit/:id" element={<ViewAdminPR><SucursalEdit /></ViewAdminPR>} />
          <Route path="/AgregarProducto" element={<ViewAdminPR><AgregarProducto /></ViewAdminPR>} />
          <Route path="/AgregarPromocion" element={<ViewAdminPR><AgregarPromocion /></ViewAdminPR>} />
          <Route path="/PedidosDelivery" element={<PedidosDelivery />} />
          <Route path="/proveedor" element={<Proveedores />} />
          <Route path="/MetodoPago/:id" element={<MetodoPago />} />
          <Route path="/Efectivo/:id" element={<Efectivo />} />
          <Route path="/Debito/:id" element={<Debito />} />
          <Route path="/Credito/:id" element={<Credito />} />
          <Route path="/Transferencia/:id" element={<Transferencia />} />
          <Route path="/ReporteVenta" element={<ViewAdminPR><ReporteVenta /></ViewAdminPR>} />
          <Route path="/Dashboard" element={<ViewAdminPR><Dashboard /></ViewAdminPR>} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
