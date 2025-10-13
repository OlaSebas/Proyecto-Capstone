import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Wallet, Calculator, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";

export default function PagoEfectivo() {
    const apiUrl = import.meta.env.VITE_API_URL;
    const { id } = useParams(); // ✅ ID de la venta
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [total, setTotal] = useState(0);
    const [montoPagado, setMontoPagado] = useState("");
    const [vuelto, setVuelto] = useState(null);
    const [nroBoleta, setNroBoleta] = useState("");
    const [fecha, setFecha] = useState("");
    const [pagoExitoso, setPagoExitoso] = useState(false);
    const [error, setError] = useState("");

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
        setTotal(subtotal);
    }, []);

    // Función para actualizar el estado de la venta
    const actualizarVenta = async (estado, metodo_pago = null) => {
        try {
            const venta = { id, estado };
            if (metodo_pago) venta.metodo_pago = metodo_pago;

            const response = await fetch(`${apiUrl}api/ventas/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(venta),
            });

            if (!response.ok) throw new Error(`Error al actualizar la venta: ${JSON.stringify(venta)}`);

            console.log("✅ Venta actualizada correctamente");
        } catch (error) {
            console.error("❌ Error en la actualización de la venta:", error);
        }
    };

    const restarInventario = async (carrito) => {
        try {
            const token = localStorage.getItem("token");

            // 🔹 Obtener sucursal del usuario
            const resProfile = await fetch(`${apiUrl}api/profile/`, {
                headers: { Authorization: `Token ${token}` },
            });

            if (!resProfile.ok) throw new Error("No se pudo obtener el perfil del usuario");
            const perfil = await resProfile.json();
            const sucursalId = perfil.caja?.sucursal;
            if (!sucursalId) throw new Error("El usuario no tiene sucursal asignada");
            

            // 🔹 Obtener inventario de la sucursal
            const resInventario = await fetch(`${apiUrl}inventario/`, {
                headers: { Authorization: `Token ${token}` },
            });
            if (!resInventario.ok) throw new Error("No se pudo obtener inventario");
            const inventarios = await resInventario.json();

            // 🔹 Construir lista de items a procesar
            for (const item of carrito) {
                const itemsAProcesar = [];
                // Productos normales
                if (item.producto?.item) {
                    if (item.producto.eq_pollo !== null) {
                        itemsAProcesar.push({
                            itemId: item.producto.item,
                            cantidad: item.cantidad * item.producto.eq_pollo,
                        });
                    } else {
                    itemsAProcesar.push({
                        itemId: item.producto.item,
                        cantidad: item.cantidad,
                    });
                }
                }
                console.log("Item a procesar:", itemsAProcesar);

                // Productos dentro de promociones
                if (item.producto && Array.isArray(item.producto.productos)) {
                    item.producto.productos.forEach((p) => {
                        if (p.item) {  
                            if (p.eq_pollo !== null) {
                                itemsAProcesar.push({
                                    itemId: p.item,
                                    cantidad: (p.cantidad || 1) * (item.cantidad || 1) * p.eq_pollo,})}
                            else{
                            itemsAProcesar.push({
                                itemId: p.item,
                                cantidad: (p.cantidad || 1) * (item.cantidad || 1),
                            });}
                        }
                    });
                }
                console.log("Items a procesar de promociones:", itemsAProcesar);

            // 🔹 Actualizar stock en backend
            for (const ip of itemsAProcesar) {
                    const inv = inventarios.find(
                        (inv) => inv.item?.id === ip.itemId && inv.sucursal === sucursalId
                    );
                    if (!inv) {
                        console.warn(
                            `No se encontró inventario para item ${ip.itemId} en sucursal ${sucursalId}`
                        );
                        continue;
                    }

                const resUpdate = await fetch(`${apiUrl}inventario/update/${inv.id}/`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                    body: JSON.stringify({ cantidad_vendida: ip.cantidad }),
                });

                if (!resUpdate.ok) {
                    console.error(`❌ Error actualizando inventario ${inv.id}`);
                }}
    }}    
    catch (err) {
            console.error("❌ Error al restar inventario:", err);
        }
    };

    const calcularVuelto = async () => {
        if (productos.length === 0) {
            setError("No hay productos para pagar.");
            await actualizarVenta(3); // ANULADO
            return;
        }

        const pagado = parseFloat(montoPagado);
        if (isNaN(pagado) || pagado < total) {
            setError("El monto pagado debe ser mayor o igual al total.");
            await actualizarVenta(3); // ANULADO
            return;
        }

        setError("");
        const vueltoCalculado = pagado - total;
        setVuelto(vueltoCalculado);
        setPagoExitoso(true);

        // 🔹 Restar inventario
        await restarInventario(productos);

        // ✅ Actualizar venta a PAGADA (estado 2, método 2)
        await actualizarVenta(2, 2);

        // Vaciar carrito
        localStorage.removeItem("carrito");
        localStorage.removeItem("metodoPago");

        // Reiniciar mensaje después de 4s
        setTimeout(() => {
            setPagoExitoso(false);
            navigate("/"); // redirigir al inicio o donde quieras
        }, 4000);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-100 via-white to-red-200 p-6">
            <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-200">
                {/* Encabezado */}
                <div className="flex flex-col items-center text-center mb-6">
                    <Wallet size={40} className="text-red-500 mb-2" />
                    <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                        Pago en Efectivo — Venta #{id}
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
                        <span>Efectivo</span>
                    </div>
                </div>

                {/* Tabla productos */}
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

                {/* Total */}
                <div className="flex justify-between font-bold text-lg text-gray-800 mb-6">
                    <span>Total:</span>
                    <span>${total.toLocaleString()}</span>
                </div>

                {/* Monto pagado */}
                <div className="mb-4">
                    <label className="block mb-1 text-gray-700 font-medium">Monto recibido:</label>
                    <input
                        type="number"
                        value={montoPagado}
                        onChange={(e) => setMontoPagado(e.target.value)}
                        placeholder="Ej: 10000"
                        className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
                    />
                </div>

                {/* Error visual */}
                {error && (
                    <div className="mb-4 flex items-center justify-center gap-2 bg-red-100 border border-red-400 text-red-800 rounded-lg py-3 px-4 shadow-sm animate-fade-in">
                        <AlertTriangle size={20} />
                        <span className="font-semibold">{error}</span>
                    </div>
                )}

                {/* Botón Calcular */}
                <button
                    onClick={calcularVuelto}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold shadow-md hover:scale-[1.02] hover:shadow-lg transition-transform duration-200"
                >
                    <Calculator size={18} />
                    Calcular Vuelto
                </button>

                {/* Vuelto */}
                {vuelto !== null && (
                    <div className="mt-6 bg-green-100 border border-green-400 text-green-800 rounded-lg p-4 text-center font-bold text-lg shadow-sm animate-fade-in">
                        Vuelto: ${vuelto.toLocaleString()}
                    </div>
                )}

                {/* Pago exitoso */}
                {pagoExitoso && (
                    <div className="mt-4 flex items-center justify-center gap-2 bg-green-500 text-white font-semibold rounded-lg py-3 px-4 animate-bounce shadow-md">
                        <CheckCircle2 size={22} />
                        <span> Pago completado con éxito</span>
                    </div>
                )}

                {/* Volver */}
                <button
                    onClick={() => navigate("/metodoPago/" + id)}
                    className="mt-8 w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200"
                >
                    <ArrowLeft size={18} />
                    Volver a métodos de pago
                </button>
            </div>
        </div>
    );
}
