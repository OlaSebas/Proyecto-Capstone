import { useState, useMemo } from "react";
import { FileText, BarChart3, Search, Printer, ChevronDown, ChevronUp, ArrowRightLeft } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Sucursales simuladas
const sucursales = [
    { id: 1, nombre: "Sucursal Centro" },
    { id: 2, nombre: "Sucursal Norte" },
    { id: 3, nombre: "Sucursal Sur" },
];

// Datos simulados de ventas
const ventasSimuladas = [
    { id: 1, fecha: "2025-01-05", cliente: "Juan Pérez", total: 15000, metodo: "Crédito", sucursal: "Sucursal Centro" },
    { id: 2, fecha: "2025-02-12", cliente: "María López", total: 9800, metodo: "Efectivo", sucursal: "Sucursal Norte" },
    { id: 3, fecha: "2025-03-20", cliente: "Carlos Soto", total: 21000, metodo: "Débito", sucursal: "Sucursal Sur" },
    { id: 4, fecha: "2025-04-07", cliente: "Ana Martínez", total: 12500, metodo: "Crédito", sucursal: "Sucursal Centro" },
    { id: 5, fecha: "2025-05-15", cliente: "Luis Torres", total: 17500, metodo: "Efectivo", sucursal: "Sucursal Norte" },
    { id: 6, fecha: "2025-06-25", cliente: "Sofía Rojas", total: 20000, metodo: "Débito", sucursal: "Sucursal Sur" },
    { id: 7, fecha: "2025-07-03", cliente: "Miguel Ángel", total: 14500, metodo: "Crédito", sucursal: "Sucursal Centro" },
    { id: 8, fecha: "2025-08-10", cliente: "Camila Fuentes", total: 22000, metodo: "Efectivo", sucursal: "Sucursal Norte" },
    { id: 9, fecha: "2025-09-18", cliente: "Diego Navarro", total: 19500, metodo: "Débito", sucursal: "Sucursal Sur" },
    { id: 10, fecha: "2025-10-30", cliente: "Paula Vega", total: 16000, metodo: "Crédito", sucursal: "Sucursal Centro" },
];

// Datos simulados de POS
const posSimulados = [
    { id: 1, producto: "Pollo Entero", cantidad: 12, total: 60000, sucursal: "Sucursal Centro", fecha: "2025-01-05" },
    { id: 2, producto: "Bebidas", cantidad: 20, total: 20000, sucursal: "Sucursal Norte", fecha: "2025-02-12" },
    { id: 3, producto: "Papas Fritas", cantidad: 15, total: 15000, sucursal: "Sucursal Sur", fecha: "2025-03-20" },
    { id: 4, producto: "Pollo Entero", cantidad: 10, total: 50000, sucursal: "Sucursal Centro", fecha: "2025-04-07" },
    { id: 5, producto: "Bebidas", cantidad: 25, total: 25000, sucursal: "Sucursal Norte", fecha: "2025-05-15" },
    { id: 6, producto: "Papas Fritas", cantidad: 18, total: 18000, sucursal: "Sucursal Sur", fecha: "2025-06-25" },
    { id: 7, producto: "Pollo Entero", cantidad: 14, total: 70000, sucursal: "Sucursal Centro", fecha: "2025-07-03" },
    { id: 8, producto: "Bebidas", cantidad: 22, total: 22000, sucursal: "Sucursal Norte", fecha: "2025-08-10" },
    { id: 9, producto: "Papas Fritas", cantidad: 20, total: 20000, sucursal: "Sucursal Sur", fecha: "2025-09-18" },
    { id: 10, producto: "Pollo Entero", cantidad: 15, total: 75000, sucursal: "Sucursal Centro", fecha: "2025-10-30" },
];

export default function ReportesVentas() {
    // Tabs
    const [tab, setTab] = useState("reportes"); // reportes / comparar

    // Filtros principales
    const [sucursalFiltro, setSucursalFiltro] = useState("Todas");
    const [mesFiltro, setMesFiltro] = useState("");
    const [semanaFiltro, setSemanaFiltro] = useState("Todas");
    const [searchQuery, setSearchQuery] = useState("");
    const [mostrarVentas, setMostrarVentas] = useState(true);
    const [mostrarPOS, setMostrarPOS] = useState(true);
    const [tipoDashboard, setTipoDashboard] = useState("barras");

    // Comparar meses
    const [mes1, setMes1] = useState("1");
    const [mes2, setMes2] = useState("2");
    const [sucursalComparar, setSucursalComparar] = useState("Sucursal Centro");
    const [tipoDatoComparar, setTipoDatoComparar] = useState("total"); // total / cantidad

    // -------------------- Funciones --------------------
    const filtrarDatos = (data) => data.filter(d => {
        const fecha = new Date(d.fecha);
        const matchSucursal = sucursalFiltro === "Todas" || d.sucursal === sucursalFiltro;
        const matchMes = !mesFiltro || fecha.getMonth() + 1 === parseInt(mesFiltro);
        const matchSemana = semanaFiltro === "Todas" || Math.ceil(fecha.getDate() / 7) === parseInt(semanaFiltro);
        const matchSearch = searchQuery === "" || Object.values(d).some(val => String(val).toLowerCase().includes(searchQuery.toLowerCase()));
        return matchSucursal && matchMes && matchSemana && matchSearch;
    });

    const ventasFiltradas = filtrarDatos(ventasSimuladas);
    const posFiltradas = filtrarDatos(posSimulados);

    const resumen = {
        totalVentas: ventasFiltradas.length,
        ingresos: ventasFiltradas.reduce((sum, v) => sum + v.total, 0),
        promedio: ventasFiltradas.length ? Math.round(ventasFiltradas.reduce((sum, v) => sum + v.total, 0) / ventasFiltradas.length) : 0,
    };

    const dashboardData = ventasFiltradas.map(v => ({ label: v.fecha, valor: v.total }));

    const semanasDelMes = mesFiltro
        ? [1, 2, 3, 4].filter(semana =>
            ventasSimuladas.some(v => {
                const fecha = new Date(v.fecha);
                return fecha.getMonth() + 1 === parseInt(mesFiltro) && Math.ceil(fecha.getDate() / 7) === semana;
            })
        )
        : [];

    // ------------------- Comparar Meses -------------------
    const filtrarPorMesYSucursal = (mes, sucursal) =>
        ventasSimuladas.filter(v => new Date(v.fecha).getMonth() + 1 === parseInt(mes) && v.sucursal === sucursal);

    const dataMes1 = useMemo(() => filtrarPorMesYSucursal(mes1, sucursalComparar), [mes1, sucursalComparar]);
    const dataMes2 = useMemo(() => filtrarPorMesYSucursal(mes2, sucursalComparar), [mes2, sucursalComparar]);

    const agruparPorDia = (data) => {
        const grupos = {};
        data.forEach((v) => {
            const dia = new Date(v.fecha).getDate();
            if (!grupos[dia]) grupos[dia] = { dia, total: 0, cantidad: 0 };
            grupos[dia].total += v.total;
            grupos[dia].cantidad += 1;
        });
        return Object.values(grupos).sort((a, b) => a.dia - b.dia);
    };

    const datos1 = agruparPorDia(dataMes1);
    const datos2 = agruparPorDia(dataMes2);

    const diasUnicos = Array.from(new Set([...datos1.map(d => d.dia), ...datos2.map(d => d.dia)])).sort((a, b) => a - b);

    const dataComparativa = diasUnicos.map(dia => {
        const m1 = datos1.find(d => d.dia === dia)?.[tipoDatoComparar] || 0;
        const m2 = datos2.find(d => d.dia === dia)?.[tipoDatoComparar] || 0;
        return { dia, [`Mes ${mes1}`]: m1, [`Mes ${mes2}`]: m2 };
    });

    // ------------------- JSX -------------------
    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            {/* Tabs */}
            <div className="flex gap-4 mb-6">
                <button className={`px-4 py-2 rounded-t-lg font-semibold ${tab === "reportes" ? "bg-white border-t border-x border-gray-300" : "bg-gray-200"}`} onClick={() => setTab("reportes")}>Reportes</button>
                <button className={`px-4 py-2 rounded-t-lg font-semibold ${tab === "comparar" ? "bg-white border-t border-x border-gray-300" : "bg-gray-200"}`} onClick={() => setTab("comparar")}>Comparar Meses</button>
            </div>

            {tab === "reportes" && (
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Panel principal */}
                    <div className="flex-1">
                        {/* ------------------- Título y Botón PDF ------------------- */}
                        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                            <h1 className="text-3xl font-bold text-red-600 flex items-center gap-2"><FileText size={32} /> Reportes de Ventas</h1>
                            <button onClick={() => window.print()} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 shadow">
                                <Printer size={18} /> Generar Reporte
                            </button>
                        </div>

                        {/* ------------------- Filtros ------------------- */}
                        <div className="flex flex-wrap gap-4 mb-6">
                            <select value={sucursalFiltro} onChange={e => setSucursalFiltro(e.target.value)} className="border rounded-lg px-3 py-2">
                                <option value="Todas">Todas las sucursales</option>
                                {sucursales.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
                            </select>
                            <select value={mesFiltro} onChange={e => setMesFiltro(e.target.value)} className="border rounded-lg px-3 py-2">
                                <option value="">Todos los meses</option>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString("es", { month: "long" })}</option>
                                ))}
                            </select>
                            {mesFiltro && (
                                <select value={semanaFiltro} onChange={e => setSemanaFiltro(e.target.value)} className="border rounded-lg px-3 py-2">
                                    <option value="Todas">Todas las semanas</option>
                                    {semanasDelMes.map(sem => <option key={sem} value={sem}>Semana {sem}</option>)}
                                </select>
                            )}
                            <input type="text" placeholder="Buscar..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="border rounded-lg px-3 py-2 flex-1 min-w-[200px]" />
                            <select value={tipoDashboard} onChange={e => setTipoDashboard(e.target.value)} className="border rounded-lg px-3 py-2">
                                <option value="barras">Barras</option>
                                <option value="lineas">Líneas</option>
                                <option value="pastel">Pastel</option>
                            </select>
                        </div>

                        {/* ------------------- Tablas ------------------- */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* Ventas */}
                            <div className="bg-white rounded-xl shadow p-4 border-t-4 border-red-600">
                                <div className="flex justify-between items-center cursor-pointer mb-3" onClick={() => setMostrarVentas(!mostrarVentas)}>
                                    <h2 className="text-lg font-semibold text-red-600">Ventas Realizadas</h2>
                                    {mostrarVentas ? <ChevronUp /> : <ChevronDown />}
                                </div>
                                {mostrarVentas && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-gray-700">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-3 py-2 text-left">Fecha</th>
                                                    <th className="px-3 py-2 text-left">Cliente</th>
                                                    <th className="px-3 py-2 text-right">Total</th>
                                                    <th className="px-3 py-2 text-center">Método</th>
                                                    <th className="px-3 py-2 text-center">Sucursal</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ventasFiltradas.map(v => (
                                                    <tr key={v.id} className="border-b hover:bg-gray-50">
                                                        <td className="px-3 py-2">{v.fecha}</td>
                                                        <td className="px-3 py-2">{v.cliente}</td>
                                                        <td className="px-3 py-2 text-right">${v.total.toLocaleString()}</td>
                                                        <td className="px-3 py-2 text-center">{v.metodo}</td>
                                                        <td className="px-3 py-2 text-center">{v.sucursal}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* POS */}
                            <div className="bg-white rounded-xl shadow p-4 border-t-4 border-red-600">
                                <div className="flex justify-between items-center cursor-pointer mb-3" onClick={() => setMostrarPOS(!mostrarPOS)}>
                                    <h2 className="text-lg font-semibold text-red-600">Resumen de POS</h2>
                                    {mostrarPOS ? <ChevronUp /> : <ChevronDown />}
                                </div>
                                {mostrarPOS && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-gray-700">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-3 py-2 text-left">Producto</th>
                                                    <th className="px-3 py-2 text-center">Cantidad</th>
                                                    <th className="px-3 py-2 text-right">Total</th>
                                                    <th className="px-3 py-2 text-center">Sucursal</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {posFiltradas.map(p => (
                                                    <tr key={p.id} className="border-b hover:bg-gray-50">
                                                        <td className="px-3 py-2">{p.producto}</td>
                                                        <td className="px-3 py-2 text-center">{p.cantidad}</td>
                                                        <td className="px-3 py-2 text-right">${p.total.toLocaleString()}</td>
                                                        <td className="px-3 py-2 text-center">{p.sucursal}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ------------------- Dashboard ------------------- */}
                        <div className="bg-white rounded-xl shadow p-6 border-t-4 border-red-600 mb-6">
                            <h2 className="text-xl font-semibold text-red-600 mb-4 flex items-center gap-2"><BarChart3 /> Dashboard de Ventas</h2>
                            <div className="w-full h-80">
                                <ResponsiveContainer>
                                    {tipoDashboard === "barras" && (
                                        <BarChart data={dashboardData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="label" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="valor" fill="#dc2626" />
                                        </BarChart>
                                    )}
                                    {tipoDashboard === "lineas" && (
                                        <LineChart data={dashboardData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="label" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="valor" stroke="#dc2626" strokeWidth={3} />
                                        </LineChart>
                                    )}
                                    {tipoDashboard === "pastel" && (
                                        <PieChart>
                                            <Pie data={dashboardData} dataKey="valor" nameKey="label" outerRadius={80} fill="#dc2626" label>
                                                {dashboardData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={["#dc2626", "#f87171", "#fca5a5", "#fee2e2"][index % 4]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* ------------------- Resumen ------------------- */}
                        <div className="bg-white rounded-xl shadow p-6 border-t-4 border-red-600 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-red-50 p-4 rounded-lg text-center">
                                <h3 className="text-gray-500 font-semibold mb-2">Total Ventas</h3>
                                <p className="text-2xl font-bold text-red-600">{resumen.totalVentas}</p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg text-center">
                                <h3 className="text-gray-500 font-semibold mb-2">Ingresos</h3>
                                <p className="text-2xl font-bold text-red-600">${resumen.ingresos.toLocaleString()}</p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg text-center">
                                <h3 className="text-gray-500 font-semibold mb-2">Promedio por venta</h3>
                                <p className="text-2xl font-bold text-red-600">${resumen.promedio.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ------------------- Comparar Meses ------------------- */}
            {tab === "comparar" && (
                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-xl font-bold mb-4">Comparar Meses - {sucursalComparar}</h2>

                    {/* Filtros comparar */}
                    <div className="flex flex-wrap gap-4 mb-6 items-end">
                        <select value={sucursalComparar} onChange={e => setSucursalComparar(e.target.value)} className="border rounded-lg px-3 py-2">
                            {sucursales.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
                        </select>
                        <select value={mes1} onChange={e => setMes1(e.target.value)} className="border rounded-lg px-3 py-2">
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString("es", { month: "long" })}</option>
                            ))}
                        </select>
                        <select value={mes2} onChange={e => setMes2(e.target.value)} className="border rounded-lg px-3 py-2">
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString("es", { month: "long" })}</option>
                            ))}
                        </select>
                        <button onClick={() => setTipoDatoComparar(tipoDatoComparar === "total" ? "cantidad" : "total")} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                            <ArrowRightLeft /> Cambiar a {tipoDatoComparar === "total" ? "Cantidad" : "Total"}
                        </button>
                    </div>

                    {/* Dashboard comparativo */}
                    <div className="w-full h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dataComparativa} margin={{ top: 20, right: 30, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="dia" label={{ value: "Día", position: "bottom" }} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey={`Mes ${mes1}`} fill="#dc2626" radius={[4, 4, 0, 0]} />
                                <Bar dataKey={`Mes ${mes2}`} fill="#f87171" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}
