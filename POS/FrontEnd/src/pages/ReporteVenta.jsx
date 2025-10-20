import { useEffect, useState, useMemo } from "react";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    Tooltip, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer
} from "recharts";
import { Menu, ChevronDown, ChevronUp, DollarSign, Package, Star } from "lucide-react";

export default function ReporteVentas({ toggleSidebar }) {
    const apiUrl = "http://127.0.0.1:8000/";
    const token = localStorage.getItem("token");

    const [ventas, setVentas] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [sucursalSeleccionada, setSucursalSeleccionada] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [error, setError] = useState(null);
    const [hora, setHora] = useState(new Date());

    const [tablaAbierta, setTablaAbierta] = useState(true);
    const [dashboardLineaAbierto, setDashboardLineaAbierto] = useState(true);
    const [dashboardVendedorAbierto, setDashboardVendedorAbierto] = useState(true);
    const [dashboardSucursalAbierto, setDashboardSucursalAbierto] = useState(true);

    const [tipoDashboardLinea, setTipoDashboardLinea] = useState("linea");
    const [tipoDashboardVendedor, setTipoDashboardVendedor] = useState("barra");
    const [tipoDashboardSucursal, setTipoDashboardSucursal] = useState("pastel");

    const [periodoVentas, setPeriodoVentas] = useState("diaria");
    const [semanaSeleccionada, setSemanaSeleccionada] = useState("");

    const COLORS = ["#B91C1C", "#EF4444", "#F87171", "#DC2626", "#FCA5A5", "#B91C1C", "#F87171", "#DC2626"];

    useEffect(() => { const interval = setInterval(() => setHora(new Date()), 1000); return () => clearInterval(interval); }, []);

    useEffect(() => {
        const cargarSucursales = async () => {
            try {
                const res = await fetch(`${apiUrl}inventario/sucursales/`, { headers: { Authorization: `Token ${token}` } });
                if (!res.ok) throw new Error("No se pudieron cargar sucursales");
                const data = await res.json();
                setSucursales(Array.isArray(data) ? data : []);
            } catch (err) { console.error(err); setError("Error al cargar sucursales"); }
        };
        cargarSucursales();
    }, [token]);

    useEffect(() => {
        const fetchVentas = async () => {
            try {
                const res = await fetch(`${apiUrl}api/venta_list/`, { headers: { Authorization: `Token ${token}` } });
                if (!res.ok) throw new Error("Error cargando ventas");
                const data = await res.json();
                setVentas(Array.isArray(data) ? data : []);
            } catch (err) { console.error(err); setError("Error cargando ventas"); }
        };
        fetchVentas();
    }, [token]);

    const ventasFiltradas = useMemo(() => {
        return ventas.filter(v => {
            const fechaVenta = new Date(v.fecha);
            const cumpleSucursal = !sucursalSeleccionada || v.usuario?.caja?.sucursal === Number(sucursalSeleccionada);
            const cumpleFechaInicio = !fechaInicio || fechaVenta >= new Date(fechaInicio);
            const cumpleFechaFin = !fechaFin || fechaVenta <= new Date(fechaFin);

            let cumpleSemana = true;
            if (periodoVentas === "diaria" && semanaSeleccionada) {
                const fecha = new Date(v.fecha);
                const primerDiaMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
                const semana = Math.ceil((fecha.getDate() + primerDiaMes.getDay()) / 7);
                cumpleSemana = semana === Number(semanaSeleccionada);
            }

            return cumpleSucursal && cumpleFechaInicio && cumpleFechaFin && cumpleSemana;
        });
    }, [ventas, sucursalSeleccionada, fechaInicio, fechaFin, periodoVentas, semanaSeleccionada]);

    const totalVendido = ventasFiltradas.reduce((sum, v) => sum + (v.total || 0), 0);
    const totalProductos = ventasFiltradas.reduce((sum, v) => sum + (v.productos?.reduce((a, b) => a + b.cantidad, 0) || 0), 0);

    const productoMasVendido = useMemo(() => {
        const contador = {};
        ventasFiltradas.forEach(v => v.productos?.forEach(p => { contador[p.nombre] = (contador[p.nombre] || 0) + p.cantidad; }));
        const ordenado = Object.entries(contador).sort((a, b) => b[1] - a[1]);
        return ordenado[0] ? `${ordenado[0][0]} (${ordenado[0][1]} unidades)` : "-";
    }, [ventasFiltradas]);

    const dataPeriodo = useMemo(() => {
        const agrupado = {};
        ventasFiltradas.forEach(v => {
            const fecha = new Date(v.fecha);
            let key;
            if (periodoVentas === "diaria") key = fecha.toLocaleDateString("es-CL");
            if (periodoVentas === "mensual") key = `${fecha.getMonth() + 1}-${fecha.getFullYear()}`;
            agrupado[key] = (agrupado[key] || 0) + v.total;
        });
        return Object.entries(agrupado).map(([periodo, total]) => ({ periodo, total }));
    }, [ventasFiltradas, periodoVentas]);

    const dataPorSucursal = useMemo(() => {
        const agrupado = {};
        ventasFiltradas.forEach(v => {
            const suc = v.usuario?.caja?.sucursal || "Desconocida";
            agrupado[suc] = (agrupado[suc] || 0) + v.total;
        });
        return Object.entries(agrupado).map(([id, total]) => {
            const sucursalNombre = sucursales.find(s => s.id === Number(id))?.descripcion || `Sucursal ${id}`;
            return { sucursal: sucursalNombre, total };
        });
    }, [ventasFiltradas, sucursales]);

    const dataApilada = useMemo(() => {
        const agrupado = {};
        const sucursalesNombres = sucursales.map(s => s.descripcion);
        ventasFiltradas.forEach(v => {
            const vendedor = v.usuario?.username || "Desconocido";
            const sucursalNombre = sucursales.find(s => s.id === v.usuario?.caja?.sucursal)?.descripcion || "Desconocida";
            if (!agrupado[vendedor]) agrupado[vendedor] = {};
            agrupado[vendedor][sucursalNombre] = (agrupado[vendedor][sucursalNombre] || 0) + v.total;
        });
        return Object.entries(agrupado).map(([vendedor, sucursalesObj]) => {
            const obj = { vendedor };
            sucursalesNombres.forEach(s => obj[s] = sucursalesObj[s] || 0);
            return obj;
        });
    }, [ventasFiltradas, sucursales]);

    const semanasDelMes = useMemo(() => {
        const fechas = [];
        const now = new Date();
        const primerDia = new Date(now.getFullYear(), now.getMonth(), 1);
        const ultimoDia = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        let semana = 1;
        for (let d = primerDia.getDate(); d <= ultimoDia.getDate(); d++) {
            const fecha = new Date(now.getFullYear(), now.getMonth(), d);
            const diaSemana = fecha.getDay();
            if (diaSemana === 0 && d !== 1) semana++;
            fechas.push({ dia: d, semana });
        }
        const totalSemanas = Math.max(...fechas.map(f => f.semana));
        return Array.from({ length: totalSemanas }, (_, i) => i + 1);
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <header className="bg-white shadow px-4 sm:px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={toggleSidebar} className="text-gray-700 hover:text-gray-900 p-2 rounded-md">
                        <Menu size={24} />
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Reporte de Ventas</h1>
                </div>
                <div className="text-gray-600 font-mono">{hora.toLocaleTimeString()}</div>
            </header>

            <main className="flex-1 p-6 space-y-6">

                {/* FILTROS */}
                <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl shadow">
                    <div>
                        <label className="text-sm font-medium text-gray-600">Sucursal</label>
                        <select className="w-full border p-2 rounded-lg" value={sucursalSeleccionada} onChange={e => setSucursalSeleccionada(e.target.value)}>
                            <option value="">Todas</option>
                            {sucursales.map(s => <option key={s.id} value={s.id}>{s.descripcion}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Desde</label>
                        <input type="date" className="w-full border p-2 rounded-lg" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Hasta</label>
                        <input type="date" className="w-full border p-2 rounded-lg" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
                    </div>
                    <div className="flex items-end gap-2">
                        <button className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700" onClick={() => { setSucursalSeleccionada(""); setFechaInicio(""); setFechaFin(""); }}>
                            Limpiar filtros
                        </button>
                    </div>
                </div>

                {/* RESUMEN */}
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-r from-red-600 to-red-400 text-white rounded-xl p-4 shadow flex items-center gap-4 transition-transform hover:scale-105">
                        <DollarSign size={32} />
                        <div>
                            <p className="text-sm">Total Vendido</p>
                            <p className="text-xl font-bold">${totalVendido.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-red-500 to-red-300 text-white rounded-xl p-4 shadow flex items-center gap-4 transition-transform hover:scale-105">
                        <Package size={32} />
                        <div>
                            <p className="text-sm">Productos Vendidos</p>
                            <p className="text-xl font-bold">{totalProductos}</p>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-red-400 to-red-200 text-white rounded-xl p-4 shadow flex items-center gap-4 transition-transform hover:scale-105">
                        <Star size={32} />
                        <div>
                            <p className="text-sm">Producto Más Vendido</p>
                            <p className="text-xl font-bold">{productoMasVendido}</p>
                        </div>
                    </div>
                </div>

                {/* DASHBOARDS */}
                {/* Ventas Diarias/Mensuales */}
                <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="flex justify-between items-center cursor-pointer" onClick={() => setDashboardLineaAbierto(!dashboardLineaAbierto)}>
                        <h2 className="font-semibold text-lg">Ventas {periodoVentas === "diaria" ? "Diarias" : "Mensuales"}</h2>
                        {dashboardLineaAbierto ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </div>
                    {dashboardLineaAbierto && (
                        <div>
                            <div className="flex gap-4 mt-2 flex-wrap items-center">
                                <select className="border p-2 rounded-lg" value={periodoVentas} onChange={e => setPeriodoVentas(e.target.value)}>
                                    <option value="diaria">Diaria</option>
                                    <option value="mensual">Mensual</option>
                                </select>
                                {periodoVentas === "diaria" && (
                                    <select className="border p-2 rounded-lg" value={semanaSeleccionada} onChange={e => setSemanaSeleccionada(e.target.value)}>
                                        <option value="">Todas las semanas</option>
                                        {semanasDelMes.map(s => <option key={s} value={s}>Semana {s}</option>)}
                                    </select>
                                )}
                                <select className="border p-2 rounded-lg" value={tipoDashboardLinea} onChange={e => setTipoDashboardLinea(e.target.value)}>
                                    <option value="linea">Línea</option>
                                    <option value="barra">Barra</option>
                                    <option value="pastel">Pastel</option>
                                </select>
                            </div>
                            <div className="mt-4" style={{ width: "100%", height: 300 }}>
                                {tipoDashboardLinea === "linea" && <ResponsiveContainer width="100%" height="100%"><LineChart data={dataPeriodo}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="periodo" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="total" stroke="#B91C1C" /></LineChart></ResponsiveContainer>}
                                {tipoDashboardLinea === "barra" && <ResponsiveContainer width="100%" height="100%"><BarChart data={dataPeriodo}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="periodo" /><YAxis /><Tooltip /><Legend /><Bar dataKey="total" fill="#B91C1C" /></BarChart></ResponsiveContainer>}
                                {tipoDashboardLinea === "pastel" && <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={dataPeriodo} dataKey="total" nameKey="periodo" cx="50%" cy="50%" outerRadius={100} label>{dataPeriodo.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Ventas por Vendedor */}
                <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="flex justify-between items-center cursor-pointer" onClick={() => setDashboardVendedorAbierto(!dashboardVendedorAbierto)}>
                        <h2 className="font-semibold text-lg">Ventas por Vendedor y Sucursal</h2>
                        {dashboardVendedorAbierto ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </div>
                    {dashboardVendedorAbierto && (
                        <div className="mt-4">
                            <select className="border p-2 rounded-lg mb-4" value={tipoDashboardVendedor} onChange={e => setTipoDashboardVendedor(e.target.value)}>
                                <option value="linea">Línea</option>
                                <option value="barra">Barra</option>
                                <option value="pastel">Pastel</option>
                            </select>
                            <div style={{ width: "100%", height: 300 }}>
                                {tipoDashboardVendedor === "barra" && <ResponsiveContainer width="100%" height="100%"><BarChart data={dataApilada}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="vendedor" /><YAxis /><Tooltip /><Legend />{sucursales.map((s, i) => <Bar key={s.id} dataKey={s.descripcion} stackId="a" fill={COLORS[i % COLORS.length]} />)}</BarChart></ResponsiveContainer>}
                                {tipoDashboardVendedor === "linea" && <ResponsiveContainer width="100%" height="100%"><LineChart data={dataApilada}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="vendedor" /><YAxis /><Tooltip /><Legend />{sucursales.map((s, i) => <Line key={s.id} dataKey={s.descripcion} stroke={COLORS[i % COLORS.length]} />)}</LineChart></ResponsiveContainer>}
                                {tipoDashboardVendedor === "pastel" && <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={dataApilada} dataKey={sucursales[0]?.descripcion} nameKey="vendedor" cx="50%" cy="50%" outerRadius={100} label>{dataApilada.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Ventas por Sucursal */}
                <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="flex justify-between items-center cursor-pointer" onClick={() => setDashboardSucursalAbierto(!dashboardSucursalAbierto)}>
                        <h2 className="font-semibold text-lg">Ventas por Sucursal</h2>
                        {dashboardSucursalAbierto ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </div>
                    {dashboardSucursalAbierto && (
                        <div className="mt-4">
                            <select className="border p-2 rounded-lg mb-4" value={tipoDashboardSucursal} onChange={e => setTipoDashboardSucursal(e.target.value)}>
                                <option value="linea">Línea</option>
                                <option value="barra">Barra</option>
                                <option value="pastel">Pastel</option>
                            </select>
                            <div style={{ width: "100%", height: 300 }}>
                                {tipoDashboardSucursal === "pastel" && <ResponsiveContainer
                                    width="100%" height="100%"><PieChart>
                                        <Pie data={dataPorSucursal} dataKey="total" nameKey="sucursal" cx="50%" cy="50%" outerRadius={100} label>
                                            {dataPorSucursal.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart></ResponsiveContainer>}

                                {tipoDashboardSucursal === "linea" && <ResponsiveContainer width="100%" height="100%"><LineChart data={dataPorSucursal}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="sucursal" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="total" stroke="#B91C1C" />
                                </LineChart></ResponsiveContainer>}

                                {tipoDashboardSucursal === "barra" && <ResponsiveContainer width="100%" height="100%"><BarChart data={dataPorSucursal}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="sucursal" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="total" fill="#B91C1C" />
                                </BarChart></ResponsiveContainer>}
                            </div>
                        </div>
                    )}
                </div>

                {/* TABLA DETALLE VENTAS COLAPSABLE */}
                <div className="bg-white rounded-xl p-4 shadow-md overflow-x-auto">
                    <div className="flex justify-between items-center cursor-pointer" onClick={() => setTablaAbierta(!tablaAbierta)}>
                        <h2 className="font-semibold mb-2 text-lg">Detalle de Ventas Individuales</h2>
                        {tablaAbierta ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </div>

                    {tablaAbierta && (
                        <table className="min-w-full text-sm text-left border mt-2">
                            <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                    <th className="p-2 border">ID</th>
                                    <th className="p-2 border">Vendedor</th>
                                    <th className="p-2 border">Sucursal</th>
                                    <th className="p-2 border">Fecha</th>
                                    <th className="p-2 border">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ventasFiltradas.map((v) => (
                                    <tr key={v.id} className="hover:bg-gray-50">
                                        <td className="p-2 border">{v.id}</td>
                                        <td className="p-2 border">{v.usuario?.username || "Desconocido"}</td>
                                        <td className="p-2 border">{sucursales.find((s) => s.id === v.usuario?.caja?.sucursal)?.descripcion || "Desconocida"}</td>
                                        <td className="p-2 border">{new Date(v.fecha).toLocaleString("es-CL")}</td>
                                        <td className="p-2 border">${v.total?.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {error && <p className="text-red-500 font-semibold">{error}</p>}

            </main>
        </div>
    );
}
