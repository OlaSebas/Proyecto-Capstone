import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Login from './login'
import Venta from './pages/Venta'
import Producto from './pages/Producto'
import InventarioStock from './pages/InventarioStock'
import {Navegador} from './components/Navegador'

function App() {
<<<<<<< Updated upstream
  return <Login />;
=======
  return (
    <Router>
      <Navegador />
      <Routes>
        <Route path="/Login" element={<Login />} />
        <Route path="/Venta" element={<Venta />} />
        <Route path="/Producto" element={<Producto />} />
        <Route path="/InventarioStock" element={<InventarioStock />} />
      </Routes>
    </Router>
  );
>>>>>>> Stashed changes
}

export default App;
