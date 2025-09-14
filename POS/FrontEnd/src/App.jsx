import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/login/Login";
import Layout from "./components/Layout";
import Venta from "./pages/Venta";
import Producto from "./pages/Producto";
import InventarioStock from "./pages/InventarioStock";
import Home from "./pages/Home";
import Carrito from "./pages/Carrito";
import { Navegador } from "./components/Navegador";
import ProtectedRoute from "./components/protectedRoute";
import ViewAdminPR from "./components/ViewAdminPR";
import RegistroUsuario from "./pages/admin/RegistroUsuario";
import './App.css';


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
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
