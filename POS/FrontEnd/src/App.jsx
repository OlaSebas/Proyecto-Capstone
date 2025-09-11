import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/login/Login";
import Layout from "./components/Layout";
import Venta from "./pages/Venta";
import Producto from "./pages/Producto";
import InventarioStock from "./pages/InventarioStock";
import Home from "./pages/Home";
import { Navegador } from "./components/Navegador";
import ProtectedRoute from "./components/protectedRoute";
import ViewAdminPR from "./components/ViewAdminPR";
import RegistroUsuario from "./pages/admin/RegistroUsuario";
import './app.css';


function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      {/* El navegador solo debería mostrarse si estás logueado */}
      {/*{token && <Navegador />}*/}

      <Routes>
        {/* LOGIN: si ya hay sesión, no lo dejo entrar */}
        <Route
          path="/Login" element={!token ? <Login /> : <Navigate to="/Venta" replace />}
        />

        {/* RUTAS PROTEGIDAS */}
        <Route
          path="/" element={
            <ProtectedRoute> <Layout /> </ProtectedRoute>
          }>
          <Route
            path="/Venta" element={
              <ProtectedRoute> <Venta /> </ProtectedRoute>
            }/>
          <Route
            path="/Producto" element={
              <ProtectedRoute> <Producto /> </ProtectedRoute>
            }/>
          <Route
            path="/InventarioStock" element={
              <ProtectedRoute> <InventarioStock /> </ProtectedRoute>
            }/>
          <Route
            path="/Home" element={
              <ProtectedRoute> <Home /> </ProtectedRoute>
            }/>
          <Route
            path="/RegistroUsuario" element={
              <ViewAdminPR> <ProtectedRoute> <RegistroUsuario /> </ProtectedRoute> </ViewAdminPR>
            }/>

              {/* Agregar mas paginas */}

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/Login" replace />} />
        </Route>
      </Routes>
    </Router >
  );
}

export default App;
