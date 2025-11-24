import { useEffect, useState, useMemo } from "react";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Tooltip,
    CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer
} from "recharts";
import {
    Menu, ChevronDown, ChevronUp, DollarSign, Package, Star,
    ArrowLeft, ArrowRight
} from "lucide-react";
import { useOutletContext} from "react-router-dom";

export default function ReporteVentas() {
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
    const [_semanaSeleccionada, _setSemanaSeleccionada] = useState("");

    const [estadoVentasTabla, setEstadoVentasTabla] = useState(2);
    const [paginaActual, setPaginaActual] = useState(1);
    const VENTAS_POR_PAGINA = 15;

    // Nueva paleta de colores
    const COLORS = [
        "#2563EB", // azul principal
        "#16A34A", // verde
        "#F59E0B", // mostaza
        "#9333EA", // púrpura
        "#F97316", // naranjo
        "#0EA5E9", // celeste
        "#E11D48", // fucsia
        "#10B981", // verde esmeralda
        "#64748B", // gris azulado
        "#B91C1C", // rojo profundo
    ];

    //  Reloj
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
    }, [token, apiUrl]);

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
    }, [token, apiUrl]);

    const ventasFiltradasTabla = useMemo(() => {
        return ventas.filter((v) => {
            if (estadoVentasTabla !== 0 && v.estado !== estadoVentasTabla) return false;
            const fechaVenta = new Date(v.fecha);
            const cumpleSucursal =
                !sucursalSeleccionada || v.usuario?.caja?.sucursal === Number(sucursalSeleccionada);
            const cumpleFechaInicio = !fechaInicio || fechaVenta >= new Date(fechaInicio);
            const cumpleFechaFin = !fechaFin || fechaVenta <= new Date(fechaFin);
            return cumpleSucursal && cumpleFechaInicio && cumpleFechaFin;
        });
    }, [ventas, sucursalSeleccionada, fechaInicio, fechaFin, estadoVentasTabla]);

    const ventasFiltradasDashboards = useMemo(() => {
        return ventas.filter((v) => {
            if (v.estado !== 2) return false;
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
            ? ("Producto " + ordenado[0][0]) + ` (${ordenado[0][1]} unidades)`
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

    const totalPaginas = Math.ceil(ventasFiltradasTabla.length / VENTAS_POR_PAGINA);
    const ventasPagina = ventasFiltradasTabla.slice(
        (paginaActual - 1) * VENTAS_POR_PAGINA,
        paginaActual * VENTAS_POR_PAGINA
    );

    const cambiarPagina = (inc) =>
        setPaginaActual((p) => Math.min(Math.max(p + inc, 1), totalPaginas));

    const _colorFila = (estado) =>
        estado === 1
            ? "bg-yellow-100"
            : estado === 2
            ? "bg-green-100"
            : estado === 3
            ? "bg-red-100"
            : "";

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            {/* Header */}
            {/* Header responsive */}
            <header className="bg-white shadow">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                {/* Móvil: botón en pastilla + título + hora */}
                <div className="block md:hidden py-3">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Abrir/Cerrar barra lateral"
                    className="w-full h-10 inline-flex items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                    ☰
                </button>

                <h2 className="mt-3 text-center text-2xl font-extrabold text-gray-900">
                    Reporte de Ventas
                </h2>
                <span className="mt-1 block text-center text-gray-600 font-medium">
                    {hora}
                </span>
                </div>

                {/* Desktop/Tablet: botón izq + título centro + hora der */}
                <div className="hidden md:flex items-center justify-between py-4">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Abrir/Cerrar barra lateral"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                    ☰
                </button>

                <h2 className="flex-1 px-3 text-center text-3xl font-extrabold text-gray-900">
                    Reporte de Ventas
                </h2>

                <span className="min-w-[120px] text-right text-gray-600 font-medium">
                    {hora}
                </span>
                </div>
            </div>
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
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
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
                    <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-xl p-4 shadow flex items-center gap-4 transition-transform hover:scale-105">
                        <DollarSign size={32} />
                        <div>
                            <p className="text-sm">Total Vendido</p>
                            <p className="text-xl font-bold">${totalVendido.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-700 to-green-500 text-white rounded-xl p-4 shadow flex items-center gap-4 transition-transform hover:scale-105">
                        <Package size={32} />
                        <div>
                            <p className="text-sm">Cantidad de Productos Vendidos</p>
                            <p className="text-xl font-bold">{totalProductos}</p>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-700 to-purple-500 text-white rounded-xl p-4 shadow flex items-center gap-4 transition-transform hover:scale-105">
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
                    <h2 className="font-semibold text-lg">
                        Ventas {periodoVentas === "diaria" ? "Diarias" : "Mensuales"}
                    </h2>
                    <select
                        className="border p-2 rounded-lg"
                        value={periodoVentas}
                        onChange={(e) => setPeriodoVentas(e.target.value)}
                    >
                        <option value="diaria">Diaria</option>
                        <option value="mensual">Mensual</option>
                    </select>
                    <select
                        className="border p-2 rounded-lg"
                        value={tipoDashboardLinea}
                        onChange={(e) => setTipoDashboardLinea(e.target.value)}
                    >
                        <option value="linea">Línea</option>
                        <option value="barra">Barra</option>
                        <option value="pastel">Pastel</option>
                    </select>
                    </div>
                    <button
                    onClick={() => setDashboardLineaAbierto(!dashboardLineaAbierto)}
                    className="p-1 rounded hover:bg-gray-200"
                    >
                    {dashboardLineaAbierto ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </button>
                </div>

                {dashboardLineaAbierto && (
                    <div className="mt-4" style={{ width: "100%", height: 300 }}>
                    {/* === GRÁFICO DE LÍNEA === */}
                    {tipoDashboardLinea === "linea" && (
                        <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dataPeriodo}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="periodo" />
                            <YAxis />
                            <Tooltip />
                            <Legend
                            layout="horizontal"
                            align="center"
                            verticalAlign="bottom"
                            content={({ payload }) => (
                                <ul className="flex flex-wrap justify-center mt-4">
                                {payload.map((entry, index) => (
                                    <li
                                    key={`item-${index}`}
                                    className="flex flex-col items-center mx-4 text-sm"
                                    >
                                    <div className="flex items-center gap-1">
                                        <span
                                        className="inline-block w-3 h-3 rounded-sm"
                                        style={{ backgroundColor: entry.color }}
                                        ></span>
                                        <span className="font-medium text-gray-800">
                                        {entry.value}
                                        </span>
                                    </div>
                                    <span className="text-gray-500 text-xs">
                                        $
                                        {dataPeriodo.reduce(
                                        (sum, v) => sum + (v.total || 0),
                                        0
                                        ).toLocaleString("es-CL")}
                                    </span>
                                    </li>
                                ))}
                                </ul>
                            )}
                            />
                            <Line
                            type="monotone"
                            dataKey="total"
                            stroke="#2563EB"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            />
                        </LineChart>
                        </ResponsiveContainer>
                    )}

                    {/* === GRÁFICO DE BARRA === */}
                    {tipoDashboardLinea === "barra" && (
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dataPeriodo}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="periodo" />
                            <YAxis />
                            <Tooltip />
                            <Legend
                            layout="horizontal"
                            align="center"
                            verticalAlign="bottom"
                            content={() => (
                                <div className="flex flex-col items-center mt-4 text-sm">
                                <span className="font-semibold text-gray-800">
                                    Totales de ventas
                                </span>
                                <span className="text-gray-500 text-xs">
                                    $
                                    {dataPeriodo
                                    .reduce((sum, v) => sum + (v.total || 0), 0)
                                    .toLocaleString("es-CL")}
                                </span>
                                </div>
                            )}
                            />
                            <Bar dataKey="total" fill="#2563EB" radius={[6, 6, 0, 0]} />
                        </BarChart>
                        </ResponsiveContainer>
                    )}

                    {/* === GRÁFICO DE PASTEL === */}
                    {tipoDashboardLinea === "pastel" && (
                        <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                            data={dataPeriodo}
                            dataKey="total"
                            nameKey="periodo"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                            >
                            {dataPeriodo.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                            </Pie>
                            <Tooltip />
                            <Legend
                            layout="horizontal"
                            align="center"
                            verticalAlign="bottom"
                            content={({ payload }) => (
                                <ul className="flex flex-wrap justify-center mt-4">
                                {payload.map((entry, index) => (
                                    <li
                                    key={`item-${index}`}
                                    className="flex flex-col items-center mx-4 text-sm"
                                    >
                                    <div className="flex items-center gap-1">
                                        <span
                                        className="inline-block w-3 h-3 rounded-sm"
                                        style={{ backgroundColor: entry.color }}
                                        ></span>
                                        <span className="font-medium text-gray-800">
                                        {entry.value}
                                        </span>
                                    </div>
                                    <span className="text-gray-500 text-xs">
                                        $
                                        {dataPeriodo[index]
                                        ? dataPeriodo[index].total.toLocaleString("es-CL")
                                        : 0}
                                    </span>
                                    </li>
                                ))}
                                </ul>
                            )}
                            />
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
                    <h2 className="font-semibold text-lg">Ventas por Vendedor</h2>
                    <select
                        className="border p-2 rounded-lg"
                        value={tipoDashboardVendedor}
                        onChange={(e) => setTipoDashboardVendedor(e.target.value)}
                    >
                        <option value="barra">Barra</option>
                        <option value="linea">Línea</option>
                        <option value="pastel">Pastel</option>
                    </select>
                    </div>
                    <button
                    onClick={() => setDashboardVendedorAbierto(!dashboardVendedorAbierto)}
                    className="p-1 rounded hover:bg-gray-200"
                    >
                    {dashboardVendedorAbierto ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </button>
                </div>

                {dashboardVendedorAbierto && (
                    <div className="mt-4" style={{ width: "100%", height: 300 }}>

                    {/* === GRÁFICO DE BARRA === */}
                    {tipoDashboardVendedor === "barra" && (
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dataApilada}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="vendedor" />
                            <YAxis />
                            <Tooltip />
                            <Legend
                            layout="horizontal"
                            align="center"
                            verticalAlign="bottom"
                            content={({ payload }) => (
                                <ul className="flex flex-wrap justify-center mt-4">
                                {payload.map((entry, index) => (
                                    <li
                                    key={`item-${index}`}
                                    className="flex flex-col items-center mx-4 text-sm"
                                    >
                                    <div className="flex items-center gap-1">
                                        <span
                                        className="inline-block w-3 h-3 rounded-sm"
                                        style={{ backgroundColor: entry.color }}
                                        ></span>
                                        <span className="font-medium text-gray-800">
                                        {entry.value}
                                        </span>
                                    </div>
                                    <span className="text-gray-500 text-xs">
                                        $
                                        {dataApilada.reduce(
                                        (sum, v) => sum + (v[entry.value] || 0),
                                        0
                                        ).toLocaleString("es-CL")}
                                    </span>
                                    </li>
                                ))}
                                </ul>
                            )}
                            />
                            {sucursales.map((s, i) => (
                            <Bar
                                key={s.id}
                                dataKey={s.descripcion}
                                stackId="a"
                                fill={COLORS[i % COLORS.length]}
                            />
                            ))}
                        </BarChart>
                        </ResponsiveContainer>
                    )}

                    {/* === GRÁFICO DE LÍNEA === */}
                    {tipoDashboardVendedor === "linea" && (
                        <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dataApilada}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="vendedor" />
                            <YAxis />
                            <Tooltip />
                            <Legend
                            layout="horizontal"
                            align="center"
                            verticalAlign="bottom"
                            content={({ payload }) => (
                                <ul className="flex flex-wrap justify-center mt-4">
                                {payload.map((entry, index) => (
                                    <li
                                    key={`item-${index}`}
                                    className="flex flex-col items-center mx-4 text-sm"
                                    >
                                    <div className="flex items-center gap-1">
                                        <span
                                        className="inline-block w-3 h-3 rounded-sm"
                                        style={{ backgroundColor: entry.color }}
                                        ></span>
                                        <span className="font-medium text-gray-800">
                                        {entry.value}
                                        </span>
                                    </div>
                                    <span className="text-gray-500 text-xs">
                                        $
                                        {dataApilada.reduce(
                                        (sum, v) => sum + (v[entry.value] || 0),
                                        0
                                        ).toLocaleString("es-CL")}
                                    </span>
                                    </li>
                                ))}
                                </ul>
                            )}
                            />
                            {sucursales.map((s, i) => (
                            <Line
                                key={s.id}
                                dataKey={s.descripcion}
                                stroke={COLORS[i % COLORS.length]}
                                strokeWidth={2.5}
                            />
                            ))}
                        </LineChart>
                        </ResponsiveContainer>
                    )}

                    {/* === GRÁFICO DE PASTEL === */}
                    {tipoDashboardVendedor === "pastel" && (
                        <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                            data={dataApilada.map((v) => ({
                                vendedor: v.vendedor,
                                total: sucursales.reduce(
                                (sum, s) => sum + (v[s.descripcion] || 0),
                                0
                                ),
                            }))}
                            dataKey="total"
                            nameKey="vendedor"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                            >
                            {dataApilada.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                            </Pie>
                            <Tooltip />
                            <Legend
                            layout="horizontal"
                            align="center"
                            verticalAlign="bottom"
                            content={({ payload }) => (
                                <ul className="flex flex-wrap justify-center mt-4">
                                {payload.map((entry, index) => (
                                    <li
                                    key={`item-${index}`}
                                    className="flex flex-col items-center mx-4 text-sm"
                                    >
                                    <div className="flex items-center gap-1">
                                        <span
                                        className="inline-block w-3 h-3 rounded-sm"
                                        style={{ backgroundColor: entry.color }}
                                        ></span>
                                        <span className="font-medium text-gray-800">
                                        {entry.value}
                                        </span>
                                    </div>
                                    <span className="text-gray-500 text-xs">
                                        $
                                        {dataApilada[index]
                                        ? sucursales
                                            .reduce(
                                                (sum, s) =>
                                                sum +
                                                (dataApilada[index][s.descripcion] || 0),
                                                0
                                            )
                                            .toLocaleString("es-CL")
                                        : 0}
                                    </span>
                                    </li>
                                ))}
                                </ul>
                            )}
                            />
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
                    <select
                        className="border p-2 rounded-lg"
                        value={tipoDashboardSucursal}
                        onChange={(e) => setTipoDashboardSucursal(e.target.value)}
                    >
                        <option value="pastel">Pastel</option>
                        <option value="linea">Línea</option>
                        <option value="barra">Barra</option>
                    </select>
                    </div>
                    <button
                    onClick={() => setDashboardSucursalAbierto(!dashboardSucursalAbierto)}
                    className="p-1 rounded hover:bg-gray-200"
                    >
                    {dashboardSucursalAbierto ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </button>
                </div>

                {dashboardSucursalAbierto && (
                    <div className="mt-4" style={{ width: "100%", height: 300 }}>
                    {/* === GRÁFICO DE PASTEL === */}
                    {tipoDashboardSucursal === "pastel" && (
                        <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                            data={dataPorSucursal}
                            dataKey="total"
                            nameKey="sucursal"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                            >
                            {dataPorSucursal.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                            </Pie>
                            <Tooltip />
                            <Legend
                            layout="horizontal"
                            align="center"
                            verticalAlign="bottom"
                            content={({ payload }) => (
                                <ul className="flex flex-wrap justify-center mt-4">
                                {payload.map((entry, index) => (
                                    <li
                                    key={`item-${index}`}
                                    className="flex flex-col items-center mx-4 text-sm"
                                    >
                                    <div className="flex items-center gap-1">
                                        <span
                                        className="inline-block w-3 h-3 rounded-sm"
                                        style={{ backgroundColor: entry.color }}
                                        ></span>
                                        <span className="font-medium text-gray-800">{entry.value}</span>
                                    </div>
                                    <span className="text-gray-500 text-xs">
                                        ${dataPorSucursal[index]?.total?.toLocaleString("es-CL") || 0}
                                    </span>
                                    </li>
                                ))}
                                </ul>
                            )}
                            />
                        </PieChart>
                        </ResponsiveContainer>
                    )}

                    {/* === GRÁFICO DE LÍNEA === */}
                    {tipoDashboardSucursal === "linea" && (
                        <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dataPorSucursal}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="sucursal" />
                            <YAxis />
                            <Tooltip />
                            <Legend
                            layout="horizontal"
                            align="center"
                            verticalAlign="bottom"
                            content={({ payload }) => (
                                <ul className="flex flex-wrap justify-center mt-4">
                                {payload.map((entry, index) => (
                                    <li
                                    key={`item-${index}`}
                                    className="flex flex-col items-center mx-4 text-sm"
                                    >
                                    <div className="flex items-center gap-1">
                                        <span
                                        className="inline-block w-3 h-3 rounded-sm"
                                        style={{ backgroundColor: entry.color }}
                                        ></span>
                                        <span className="font-medium text-gray-800">{entry.value}</span>
                                    </div>
                                    <span className="text-gray-500 text-xs">
                                        ${dataPorSucursal[index]?.total?.toLocaleString("es-CL") || 0}
                                    </span>
                                    </li>
                                ))}
                                </ul>
                            )}
                            />
                            <Line
                            type="monotone"
                            dataKey="total"
                            stroke="#16A34A"
                            strokeWidth={3}
                            />
                        </LineChart>
                        </ResponsiveContainer>
                    )}
                    {/* === GRÁFICO DE BARRA === */}
                    {tipoDashboardSucursal === "barra" && (
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dataPorSucursal}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="sucursal" />
                            <YAxis />
                            <Tooltip />
                            <Legend
                            layout="horizontal"
                            align="center"
                            verticalAlign="bottom"
                            content={({ payload }) => (
                                <ul className="flex flex-wrap justify-center mt-4">
                                {payload.map((entry, index) => (
                                    <li
                                    key={`item-${index}`}
                                    className="flex flex-col items-center mx-4 text-sm"
                                    >
                                    <div className="flex items-center gap-1">
                                        <span
                                        className="inline-block w-3 h-3 rounded-sm"
                                        style={{ backgroundColor: entry.color }}
                                        ></span>
                                        <span className="font-medium text-gray-800">{entry.value}</span>
                                    </div>
                                    <span className="text-gray-500 text-xs">
                                        ${dataPorSucursal[index]?.total?.toLocaleString("es-CL") || 0}
                                    </span>
                                    </li>
                                ))}
                                </ul>
                            )}
                            />
                            <Bar dataKey="total" fill="#16A34A" />
                        </BarChart>
                        </ResponsiveContainer>
                    )}
                    </div>
                )}
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg overflow-x-auto border border-gray-200">
                    {/* Encabezado de controles */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                        <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                            Detalle de Ventas
                        </h2>
                        <select
                            className="border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
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

                        <div className="flex gap-2 items-center">
                        <button
                            onClick={() => cambiarPagina(-1)}
                            disabled={paginaActual === 1}
                            className="p-2 rounded-md hover:bg-gray-100 transition disabled:opacity-40"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <span className="text-sm font-medium text-gray-600">
                            Página {paginaActual} / {totalPaginas}
                        </span>
                        <button
                            onClick={() => cambiarPagina(1)}
                            disabled={paginaActual === totalPaginas}
                            className="p-2 rounded-md hover:bg-gray-100 transition disabled:opacity-40"
                        >
                            <ArrowRight size={20} />
                        </button>
                        <button
                            onClick={() => setTablaAbierta(!tablaAbierta)}
                            className="p-2 rounded-md hover:bg-gray-100 transition"
                        >
                            {tablaAbierta ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        </div>
                    </div>

                    {/* Tabla */}
                    {tablaAbierta && (
                        <table className="min-w-full text-sm text-left border-collapse rounded-lg overflow-hidden">
                        <thead className="bg-gradient-to-r from-red-700 to-red-500 text-white uppercase text-xs tracking-wider">
                            <tr>
                            <th className="px-4 py-3 text-center">ID</th>
                            <th className="px-4 py-3">Vendedor</th>
                            <th className="px-4 py-3">Sucursal</th>
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3 text-right">Total</th>
                            <th className="px-4 py-3 text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ventasPagina.length === 0 ? (
                            <tr>
                                <td
                                colSpan={6}
                                className="text-center text-gray-500 py-6 italic"
                                >
                                No hay ventas registradas.
                                </td>
                            </tr>
                            ) : (
                            ventasPagina.map((v, i) => (
                                <tr
                                key={v.id}
                                className={`${
                                    i % 2 === 0 ? "bg-gray-50" : "bg-white"
                                } hover:bg-red-50 transition border-b border-gray-200`}
                                >
                                <td className="px-4 py-3 text-center font-medium text-gray-700">
                                    {v.id}
                                </td>
                                <td className="px-4 py-3 text-gray-800">
                                    {v.usuario?.username || "Desconocido"}
                                </td>
                                <td className="px-4 py-3 text-gray-700">
                                    {sucursales.find(
                                    (s) => s.id === v.usuario?.caja?.sucursal
                                    )?.descripcion || "Desconocida"}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {new Date(v.fecha).toLocaleString("es-CL")}
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-800">
                                    ${v.total?.toLocaleString("es-CL")}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span
                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                        v.estado === 1
                                        ? "bg-yellow-100 text-yellow-800"
                                        : v.estado === 2
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                    >
                                    {v.estado === 1
                                        ? "Pendiente"
                                        : v.estado === 2
                                        ? "Pagada"
                                        : "Anulada"}
                                    </span>
                                </td>
                                </tr>
                            ))
                            )}
                        </tbody>
                        </table>
                    )}
                    </div>


                {error && <p className="text-red-500 font-semibold">{error}</p>}
            </main>
        </div>
    );
}

                
