import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";

export default function PagoCredito() {
    const apiUrl = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [totalBase, setTotalBase] = useState(0);
    const [totalFinal, setTotalFinal] = useState(0);
    const [cuotas, setCuotas] = useState(1);
    const [montoCuota, setMontoCuota] = useState(0);
    const [nombreTitular, setNombreTitular] = useState("");
    const [numeroTarjeta, setNumeroTarjeta] = useState("");
    const [fechaExp, setFechaExp] = useState("");
    const [cvv, setCvv] = useState("");
    const [fecha, setFecha] = useState("");
    const [nroBoleta, setNroBoleta] = useState("");
    const [pagoExitoso, setPagoExitoso] = useState(false);
    const [error, setError] = useState("");

    // Carga del carrito y boleta
    useEffect(() => {
        const hoy = new Date();
        const fechaStr = hoy.toLocaleString("es-CL", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
        setFecha(fechaStr);
        setNroBoleta(`B-${Math.floor(100000 + Math.random() * 900000)}`);

        const carritoLocal = JSON.parse(localStorage.getItem("carrito")) || [];
        setProductos(carritoLocal);
        const subtotal = carritoLocal.reduce((sum, item) => sum + (item.total || 0), 0);
        setTotalBase(subtotal);
        setTotalFinal(subtotal);
    }, []);

    // Cálculo dinámico según cuotas y recargo
    useEffect(() => {
        let recargo = 0;
        if (cuotas === 3) recargo = 0.05;
        if (cuotas === 6) recargo = 0.1;
        if (cuotas === 12) recargo = 0.2;

        const nuevoTotal = totalBase + totalBase * recargo;
        setTotalFinal(nuevoTotal);
        setMontoCuota((nuevoTotal / cuotas).toFixed(2));
    }, [cuotas, totalBase]);

    // Función para restar inventario
    const restarInventario = async (carrito) => {
        try {
            const token = localStorage.getItem("token");

            // Obtener sucursal del usuario
            const resProfile = await fetch(`${apiUrl}api/profile/`, {
                headers: { Authorization: `Token ${token}` },
            });
            if (!resProfile.ok) throw new Error("No se pudo obtener el perfil del usuario");
            const perfil = await resProfile.json();
            const sucursalId = perfil.caja?.sucursal;
            if (!sucursalId) throw new Error("El usuario no tiene sucursal asignada");

            // Obtener inventario
            const resInventario = await fetch(`${apiUrl}inventario/`, {
                headers: { Authorization: `Token ${token}` },
            });
            if (!resInventario.ok) throw new Error("No se pudo obtener inventario");
            const inventarios = await resInventario.json();

            for (const item of carrito) {
                const itemsAProcesar = [];

                // Productos normales
                if (item.producto?.item) {
                    itemsAProcesar.push({
                        itemId: item.producto.item,
                        cantidad: item.cantidad,
                    });
                }

                // Productos dentro de promociones
                if (item.producto && Array.isArray(item.producto.productos)) {
                    item.producto.productos.forEach((p) => {
                        if (p.item) {
                            itemsAProcesar.push({
                                itemId: p.item,
                                cantidad: (p.cantidad || 1) * (item.cantidad || 1),
                            });
                        }
                    });
                }

                // Actualizar stock
                for (const ip of itemsAProcesar) {
                    const inv = inventarios.find(
                        (inv) => inv.item?.id === ip.itemId && inv.sucursal === sucursalId
                    );
                    if (!inv) {
                        console.warn(`No se encontró inventario para item ${ip.itemId} en sucursal ${sucursalId}`);
                        continue;
                    }

                    const nuevaCantidad = (inv.cantidad_vendida || 0) + ip.cantidad;

                    const resUpdate = await fetch(`${apiUrl}inventario/update/${inv.id}/`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Token ${token}`,
                        },
                        body: JSON.stringify({ cantidad_vendida: nuevaCantidad }),
                    });

                    if (!resUpdate.ok) {
                        console.error(`❌ Error actualizando inventario ${inv.id}`);
                    }
                }
            }
        } catch (err) {
            console.error("❌ Error al restar inventario:", err);
        }
    };

    const procesarPago = async () => {
        if (productos.length === 0) {
            setError("No hay productos para pagar.");
            return;
        }

        if (!nombreTitular.trim() || !numeroTarjeta.trim() || !fechaExp.trim() || !cvv.trim()) {
            setError("Debe completar todos los campos de la tarjeta.");
            return;
        }

        if (numeroTarjeta.length < 12 || numeroTarjeta.length > 19) {
            setError("El número de tarjeta debe tener entre 12 y 19 dígitos.");
            return;
        }

        if (!/^\d{2}\/\d{2}$/.test(fechaExp)) {
            setError("La fecha de expiración debe tener el formato MM/AA.");
            return;
        }

        if (cvv.length < 3 || cvv.length > 4) {
            setError("El CVV debe tener 3 o 4 dígitos.");
            return;
        }

        // Restar inventario
        await restarInventario(productos);

        // Simula pago exitoso
        setError("");
        setPagoExitoso(true);
        localStorage.removeItem("carrito");
        localStorage.removeItem("metodoPago");

        setTimeout(() => {
            setPagoExitoso(false);
            navigate("/");
        }, 4000);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-100 via-white to-red-200 p-6">
            <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-200">
                {/* Encabezado */}
                <div className="flex flex-col items-center text-center mb-6">
                    <CreditCard size={40} className="text-red-500 mb-2" />
                    <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                        Pago con Crédito
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">Danny Pollos</p>
                </div>

                {/* Info Boleta */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                    <div className="flex justify-between text-sm text-gray-700">
                        <span className="font-semibold">N° Boleta:</span>
                        <span>{nroBoleta}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-700">
                        <span className="font-semibold">Fecha:</span>
                        <span>{fecha}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-700">
                        <span className="font-semibold">Método:</span>
                        <span>Crédito</span>
                    </div>
                </div>

                {/* Detalle productos */}
                <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 border-b border-gray-300">
                            <tr>
                                <th className="py-2 px-3 text-left text-gray-600">Producto</th>
                                <th className="py-2 px-3 text-center text-gray-600">Cant.</th>
                                <th className="py-2 px-3 text-right text-gray-600">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productos.length > 0 ? (
                                productos.map((item, i) => (
                                    <tr key={i} className="border-b last:border-none text-gray-700">
                                        <td className="py-2 px-3">
                                            {item.producto?.nombre || item.producto?.descripcion || "-"}
                                        </td>
                                        <td className="text-center">{item.cantidad}</td>
                                        <td className="text-right">${item.total?.toLocaleString() || "0"}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center py-3 text-gray-500">
                                        Carrito vacío
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Subtotal */}
                <div className="flex justify-between font-semibold text-gray-700 mb-2">
                    <span>Subtotal:</span>
                    <span>${totalBase.toLocaleString()}</span>
                </div>

                {/* Selección de cuotas */}
                <div className="mb-3">
                    <label className="block mb-1 text-gray-700 font-medium">Seleccionar cuotas:</label>
                    <select
                        value={cuotas}
                        onChange={(e) => setCuotas(Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                    >
                        <option value={1}>1 cuota (sin recargo)</option>
                        <option value={3}>3 cuotas (+5%)</option>
                        <option value={6}>6 cuotas (+10%)</option>
                        <option value={12}>12 cuotas (+20%)</option>
                    </select>
                </div>

                {/* Monto por cuota */}
                <div className="bg-gray-100 p-3 rounded-lg mb-4 text-center text-gray-700">
                    <p>
                        Cada cuota: <span className="font-bold text-red-600">${montoCuota}</span>
                    </p>
                    <p className="text-sm text-gray-500">Total con recargo: ${totalFinal.toLocaleString()}</p>
                </div>

                {/* Datos tarjeta */}
                <div className="mb-4">
                    <label className="block mb-1 text-gray-700 font-medium">Nombre del titular:</label>
                    <input
                        type="text"
                        value={nombreTitular}
                        onChange={(e) => setNombreTitular(e.target.value)}
                        placeholder="Ej: Juan Pérez"
                        className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-1 text-gray-700 font-medium">Número de tarjeta:</label>
                    <input
                        type="number"
                        value={numeroTarjeta}
                        onChange={(e) => setNumeroTarjeta(e.target.value)}
                        placeholder="Ej: 4111111111111111"
                        className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                    />
                </div>

                <div className="flex gap-3 mb-4">
                    <div className="flex-1">
                        <label className="block mb-1 text-gray-700 font-medium">Fecha Exp. (MM/AA):</label>
                        <input
                            type="text"
                            value={fechaExp}
                            onChange={(e) => setFechaExp(e.target.value)}
                            placeholder="Ej: 08/27"
                            className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                        />
                    </div>
                    <div className="w-1/3">
                        <label className="block mb-1 text-gray-700 font-medium">CVV:</label>
                        <input
                            type="number"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            placeholder="Ej: 123"
                            className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                        />
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 flex items-center justify-center gap-2 bg-red-100 border border-red-400 text-red-800 rounded-lg py-3 px-4 shadow-sm animate-fade-in">
                        <AlertTriangle size={20} />
                        <span className="font-semibold">{error}</span>
                    </div>
                )}

                {/* Botón pagar */}
                <button
                    onClick={procesarPago}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold shadow-md hover:scale-[1.02] hover:shadow-lg transition-transform duration-200"
                >
                    <CheckCircle2 size={18} />
                    Confirmar Pago
                </button>

                {/* Éxito */}
                {pagoExitoso && (
                    <div className="mt-6 flex items-center justify-center gap-2 bg-green-500 text-white font-semibold rounded-lg py-3 px-4 animate-bounce shadow-md">
                        <CheckCircle2 size={22} />
                        <span> Pago realizado con éxito</span>
                    </div>
                )}

                {/* Pie */}
                <div className="mt-6 text-center text-gray-600 text-xs">
                    Gracias por su compra
                    <p className="italic mt-1">¡Vuelva pronto!</p>
                </div>

                {/* Botón volver */}
                <button
                    onClick={() => navigate("/Carrito")}
                    className="mt-8 w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200"
                >
                    <ArrowLeft size={18} />
                    Volver a métodos de pago
                </button>
            </div>
        </div>
    );
}
