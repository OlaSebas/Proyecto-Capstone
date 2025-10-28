import { useEffect, useState, useMemo } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Tooltip, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts";
import { Menu, ChevronDown, ChevronUp, DollarSign, Package, Star, ArrowLeft, ArrowRight } from "lucide-react";
import { useOutletContext, useNavigate } from "react-router-dom";

export default function ReporteVentas({ toggleSidebar }) {
    const apiUrl = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    const [ventas, setVentas] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [sucursalSeleccionada, setSucursalSeleccionada] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [error, setError] = useState(null);
    const [hora, setHora] = useState("");
    const { sidebarOpen, setSidebarOpen } = useOutletContext();

    const [tablaAbierta, setTablaAbierta] = useState(true);
    const [dashboardLineaAbierto, setDashboardLineaAbierto] = useState(true);
    const [dashboardVendedorAbierto, setDashboardVendedorAbierto] = useState(true);
    const [dashboardSucursalAbierto, setDashboardSucursalAbierto] = useState(true);

    const [tipoDashboardLinea, setTipoDashboardLinea] = useState("linea");
    const [tipoDashboardVendedor, setTipoDashboardVendedor] = useState("barra");
    const [tipoDashboardSucursal, setTipoDashboardSucursal] = useState("pastel");

    const [periodoVentas, setPeriodoVentas] = useState("diaria");
    const [semanaSeleccionada, setSemanaSeleccionada] = useState("");

    const [estadoVentasTabla, setEstadoVentasTabla] = useState(2); // 0=Todas, 1=Pendientes, 2=Pagadas, 3=Anuladas

    const [paginaActual, setPaginaActual] = useState(1);
    const VENTAS_POR_PAGINA = 10;

    const COLORS = ["#B91C1C", "#EF4444", "#F87171", "#DC2626", "#FCA5A5", "#B91C1C", "#F87171", "#DC2626"];

    // Reloj en vivo
    useEffect(() => {
        const actualizarHora = () => {
            const now = new Date();
            setHora(
                now.toLocaleTimeString("es-CL", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                })
            );
        };
        actualizarHora();
        const intervalo = setInterval(actualizarHora, 1000);
        return () => clearInterval(intervalo);
    }, []);

    useEffect(() => {
        const cargarSucursales = async () => {
            try {
                const res = await fetch(`${apiUrl}inventario/sucursales/`, {
                    headers: { Authorization: `Token ${token}` },
                });
                if (!res.ok) throw new Error("No se pudieron cargar sucursales");
                const data = await res.json();
                setSucursales(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
                setError("Error al cargar sucursales");
            }
        };
        cargarSucursales();
    }, [token]);

    useEffect(() => {
        const fetchVentas = async () => {
            try {
                const res = await fetch(`${apiUrl}api/venta_list/`, {
                    headers: { Authorization: `Token ${token}` },
                });
                if (!res.ok) throw new Error("Error cargando ventas");
                const data = await res.json();
                setVentas(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
                setError("Error cargando ventas");
            }
        };
        fetchVentas();
    }, [token]);

    // Filtro para tabla de ventas individuales
    const ventasFiltradasTabla = useMemo(() => {
        return ventas.filter((v) => {
            if (estadoVentasTabla !== 0 && v.estado !== estadoVentasTabla) return false;

            const fechaVenta = new Date(v.fecha);
            const cumpleSucursal =
                !sucursalSeleccionada || v.usuario?.caja?.sucursal === Number(sucursalSeleccionada);
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
    }, [ventas, sucursalSeleccionada, fechaInicio, fechaFin, periodoVentas, semanaSeleccionada, estadoVentasTabla]);

    // Filtro para dashboards (solo ventas pagadas dentro del rango de fechas)
    const ventasFiltradasDashboards = useMemo(() => {
        return ventas.filter((v) => {
            if (v.estado !== 2) return false; // solo ventas pagadas

            const fechaVenta = new Date(v.fecha);
            const cumpleSucursal =
                !sucursalSeleccionada || v.usuario?.caja?.sucursal === Number(sucursalSeleccionada);
            const cumpleFechaInicio = !fechaInicio || fechaVenta >= new Date(fechaInicio);
            const cumpleFechaFin = !fechaFin || fechaVenta <= new Date(fechaFin);

            return cumpleSucursal && cumpleFechaInicio && cumpleFechaFin;
        });
    }, [ventas, sucursalSeleccionada, fechaInicio, fechaFin]);


    const totalVendido = ventasFiltradasDashboards.reduce((sum, v) => sum + (v.total || 0), 0);
    const totalProductos = ventasFiltradasDashboards.reduce(
        (sum, v) => sum + (v.detalles?.reduce((a, b) => a + Number(b.cantidad || 0), 0) || 0),
        0
    );

    const productoMasVendido = useMemo(() => {
        const contador = {};
        ventasFiltradasDashboards.forEach((v) =>
            v.detalles?.forEach((p) => {
                contador[p.producto] = (contador[p.producto] || 0) + Number(p.cantidad || 0);
            })
        );
        const ordenado = Object.entries(contador).sort((a, b) => b[1] - a[1]);
        return ordenado[0]
            ? `Producto ${ordenado[0][0]} (${ordenado[0][1]} unidades)`
            : "-";
    }, [ventasFiltradasDashboards]);

    const dataPeriodo = useMemo(() => {
        const agrupado = {};
        ventasFiltradasDashboards.forEach((v) => {
            const fecha = new Date(v.fecha);
            let key;
            if (periodoVentas === "diaria") key = fecha.toISOString().split("T")[0];
            if (periodoVentas === "mensual") key = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`;
            agrupado[key] = (agrupado[key] || 0) + v.total;
        });
        return Object.entries(agrupado)
            .sort((a, b) => new Date(a[0]) - new Date(b[0]))
            .map(([periodo, total]) => ({ periodo, total }));
    }, [ventasFiltradasDashboards, periodoVentas]);

    const dataPorSucursal = useMemo(() => {
        const agrupado = {};
        ventasFiltradasDashboards.forEach((v) => {
            const suc = v.usuario?.caja?.sucursal || "Desconocida";
            agrupado[suc] = (agrupado[suc] || 0) + v.total;
        });
        return Object.entries(agrupado).map(([id, total]) => {
            const sucursalNombre =
                sucursales.find((s) => s.id === Number(id))?.descripcion || `Sucursal ${id}`;
            return { sucursal: sucursalNombre, total };
        });
    }, [ventasFiltradasDashboards, sucursales]);

    const dataApilada = useMemo(() => {
        const agrupado = {};
        const sucursalesNombres = sucursales.map((s) => s.descripcion);
        ventasFiltradasDashboards.forEach((v) => {
            const vendedor = v.usuario?.username || "Desconocido";
            const sucursalNombre =
                sucursales.find((s) => s.id === v.usuario?.caja?.sucursal)?.descripcion ||
                "Desconocida";
            if (!agrupado[vendedor]) agrupado[vendedor] = {};
            agrupado[vendedor][sucursalNombre] =
                (agrupado[vendedor][sucursalNombre] || 0) + v.total;
        });
        return Object.entries(agrupado).map(([vendedor, sucursalesObj]) => {
            const obj = { vendedor };
            sucursalesNombres.forEach((s) => (obj[s] = sucursalesObj[s] || 0));
            return obj;
        });
    }, [ventasFiltradasDashboards, sucursales]);

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
        const totalSemanas = Math.max(...fechas.map((f) => f.semana));
        return Array.from({ length: totalSemanas }, (_, i) => i + 1);
    }, []);

    // Paginación tabla
    const totalPaginas = Math.ceil(ventasFiltradasTabla.length / VENTAS_POR_PAGINA);
    const ventasPagina = ventasFiltradasTabla.slice(
        (paginaActual - 1) * VENTAS_POR_PAGINA,
        paginaActual * VENTAS_POR_PAGINA
    );

    const cambiarPagina = (incremento) => {
        setPaginaActual((prev) => {
            const nueva = prev + incremento;
            if (nueva < 1) return 1;
            if (nueva > totalPaginas) return totalPaginas;
            return nueva;
        });
    };

    const colorFila = (estado) => {
        if (estado === 1) return "bg-yellow-100";
        if (estado === 2) return "bg-green-100";
        if (estado === 3) return "bg-red-100";
        return "";
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            {/* Header */}
            <header className="flex justify-between items-center bg-white shadow px-6 py-4">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                    ☰
                </button>
                <h2 className="text-3xl font-bold text-gray-800 flex-1 text-center">
                    Reporte de Ventas
                </h2>
                <span className="text-gray-600 font-medium">{hora}</span>
            </header>

            <main className="flex-1 p-6 space-y-6">
                {/* FILTROS */}
                <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl shadow">
                    <div>
                        <label className="text-sm font-medium text-gray-600">Sucursal</label>
                        <select
                            className="w-full border p-2 rounded-lg"
                            value={sucursalSeleccionada}
                            onChange={(e) => setSucursalSeleccionada(e.target.value)}
                        >
                            <option value="">Todas</option>
                            {sucursales.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.descripcion}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Desde</label>
                        <input
                            type="date"
                            className="w-full border p-2 rounded-lg"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Hasta</label>
                        <input
                            type="date"
                            className="w-full border p-2 rounded-lg"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                        />
                    </div>
                    <div className="flex items-end gap-2">
                        <button
                            className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                            onClick={() => {
                                setSucursalSeleccionada("");
                                setFechaInicio("");
                                setFechaFin("");
                                setPaginaActual(1);
                            }}
                        >
                            Limpiar Filtros
                        </button>
                    </div>
                </div>

                {/* RESUMEN */}
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-r from-red-800 to-red-600 text-white rounded-xl p-4 shadow flex items-center gap-4 transition-transform hover:scale-105">
                        <DollarSign size={32} />
                        <div>
                            <p className="text-sm">Total Vendido</p>
                            <p className="text-xl font-bold">${totalVendido.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-red-600 to-red-400 text-white rounded-xl p-4 shadow flex items-center gap-4 transition-transform hover:scale-105">
                        <Package size={32} />
                        <div>
                            <p className="text-sm">Cantidad de Productos Vendidos</p>
                            <p className="text-xl font-bold">{totalProductos}</p>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-red-700 to-red-500 text-white rounded-xl p-4 shadow flex items-center gap-4 transition-transform hover:scale-105">
                        <Star size={32} />
                        <div>
                            <p className="text-sm">TOP Producto</p>
                            <p className="text-xl font-bold">{productoMasVendido}</p>
                        </div>
                    </div>
                </div>

                {/* DASHBOARDS */}
                {/* Ventas Diarias/Mensuales */}
                <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="flex justify-between items-center cursor-pointer">
                        <div className="flex items-center gap-4">
                            <h2 className="font-semibold text-lg">Ventas {periodoVentas === "diaria" ? "Diarias" : "Mensuales"}</h2>
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
                        <button onClick={() => setDashboardLineaAbierto(!dashboardLineaAbierto)} className="p-1 rounded hover:bg-gray-200">
                            {dashboardLineaAbierto ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                        </button>
                    </div>
                    {dashboardLineaAbierto && (
                        <div className="mt-4" style={{ width: "100%", height: 300 }}>
                            {tipoDashboardLinea === "linea" && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={dataPeriodo}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="periodo" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="total" stroke="#B91C1C" />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                            {tipoDashboardLinea === "barra" && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dataPeriodo}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="periodo" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="total" fill="#B91C1C" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                            {tipoDashboardLinea === "pastel" && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={dataPeriodo} dataKey="total" nameKey="periodo" cx="50%" cy="50%" outerRadius={100} label>
                                            {dataPeriodo.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    )}
                </div>

                {/* Ventas por Vendedor */}
                <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="flex justify-between items-center cursor-pointer">
                        <div className="flex items-center gap-4">
                            <h2 className="font-semibold text-lg">Ventas por Vendedor y Sucursal</h2>
                            <select className="border p-2 rounded-lg" value={tipoDashboardVendedor} onChange={e => setTipoDashboardVendedor(e.target.value)}>
                                <option value="linea">Línea</option>
                                <option value="barra">Barra</option>
                                <option value="pastel">Pastel</option>
                            </select>
                        </div>
                        <button onClick={() => setDashboardVendedorAbierto(!dashboardVendedorAbierto)} className="p-1 rounded hover:bg-gray-200">
                            {dashboardVendedorAbierto ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                        </button>
                    </div>
                    {dashboardVendedorAbierto && (
                        <div className="mt-4" style={{ width: "100%", height: 300 }}>
                            {tipoDashboardVendedor === "barra" && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dataApilada}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="vendedor" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        {sucursales.map((s, i) => <Bar key={s.id} dataKey={s.descripcion} stackId="a" fill={COLORS[i % COLORS.length]} />)}
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                            {tipoDashboardVendedor === "linea" && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={dataApilada}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="vendedor" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        {sucursales.map((s, i) => <Line key={s.id} dataKey={s.descripcion} stroke={COLORS[i % COLORS.length]} />)}
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                            {tipoDashboardVendedor === "pastel" && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={dataApilada} dataKey={sucursales[0]?.descripcion} nameKey="vendedor" cx="50%" cy="50%" outerRadius={100} label>
                                            {dataApilada.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    )}
                </div>

                {/* Ventas por Sucursal */}
                <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="flex justify-between items-center cursor-pointer">
                        <div className="flex items-center gap-4">
                            <h2 className="font-semibold text-lg">Ventas por Sucursal</h2>
                            <select className="border p-2 rounded-lg" value={tipoDashboardSucursal} onChange={e => setTipoDashboardSucursal(e.target.value)}>
                                <option value="linea">Línea</option>
                                <option value="barra">Barra</option>
                                <option value="pastel">Pastel</option>
                            </select>
                        </div>
                        <button onClick={() => setDashboardSucursalAbierto(!dashboardSucursalAbierto)} className="p-1 rounded hover:bg-gray-200">
                            {dashboardSucursalAbierto ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                        </button>
                    </div>
                    {dashboardSucursalAbierto && (
                        <div className="mt-4" style={{ width: "100%", height: 300 }}>
                            {tipoDashboardSucursal === "pastel" && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={dataPorSucursal} dataKey="total" nameKey="sucursal" cx="50%" cy="50%" outerRadius={100} label>
                                            {dataPorSucursal.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                            {tipoDashboardSucursal === "linea" && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={dataPorSucursal}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="sucursal" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="total" stroke="#B91C1C" />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                            {tipoDashboardSucursal === "barra" && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dataPorSucursal}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="sucursal" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="total" fill="#B91C1C" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    )}
                </div>

                {/* TABLA DETALLE VENTAS */}
                <div className="bg-white rounded-xl p-4 shadow-md overflow-x-auto">
                    <div className="flex justify-between items-center">
                        {/* Grupo izquierdo: Título + filtro */}
                        <div className="flex items-center gap-4">
                            <h2
                                className="font-semibold mb-2 text-lg cursor-pointer"
                            >
                                Detalle de Ventas Individuales
                            </h2>

                            {/* FILTRO DE ESTADO PARA TABLA */}
                            <select
                                className="border p-2 rounded-lg"
                                value={estadoVentasTabla}
                                onChange={(e) => {
                                    setEstadoVentasTabla(Number(e.target.value));
                                    setPaginaActual(1);
                                }}
                            >
                                <option value={0}>Todas</option>
                                <option value={1}>Pendientes</option>
                                <option value={2}>Pagadas</option>
                                <option value={3}>Anuladas</option>
                            </select>
                        </div>

                        {/* Grupo derecho: botones */}
                        <div className="flex gap-2 items-center">
                            <button
                                onClick={() => cambiarPagina(-1)}
                                disabled={paginaActual === 1}
                                className="p-1 rounded hover:bg-gray-200"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <span className="text-sm">
                                {paginaActual} / {totalPaginas}
                            </span>
                            <button
                                onClick={() => cambiarPagina(1)}
                                disabled={paginaActual === totalPaginas}
                                className="p-1 rounded hover:bg-gray-200"
                            >
                                <ArrowRight size={20} />
                            </button>

                            <button
                                onClick={() => setTablaAbierta(!tablaAbierta)}
                                className="p-1 rounded hover:bg-gray-200"
                            >
                                {tablaAbierta ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                        </div>
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
                                    <th className="p-2 border">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ventasPagina.map((v) => (
                                    <tr key={v.id} className={`${colorFila(v.estado)} hover:bg-gray-200`}>
                                        <td className="p-2 border">{v.id}</td>
                                        <td className="p-2 border">{v.usuario?.username || "Desconocido"}</td>
                                        <td className="p-2 border">
                                            {sucursales.find((s) => s.id === v.usuario?.caja?.sucursal)?.descripcion ||
                                                "Desconocida"}
                                        </td>
                                        <td className="p-2 border">{new Date(v.fecha).toLocaleString("es-CL")}</td>
                                        <td className="p-2 border">${v.total?.toLocaleString()}</td>
                                        <td className="p-2 border">
                                            {v.estado === 1 ? "Pendiente" : v.estado === 2 ? "Pagada" : "Anulada"}
                                        </td>
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