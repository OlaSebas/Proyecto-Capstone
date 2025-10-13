import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Banknote,
    ArrowLeft,
    CheckCircle2,
    Clipboard,
    AlertCircle,
} from "lucide-react";

export default function PagoTransferencia() {
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [total, setTotal] = useState(0);
    const [nroBoleta, setNroBoleta] = useState("");
    const [fecha, setFecha] = useState("");
    const [transferenciaHecha, setTransferenciaHecha] = useState(false);
    const [alerta, setAlerta] = useState("");
    const apiUrl = import.meta.env.VITE_API_URL;

    const [form, setForm] = useState({
        nombre: "",
        rut: "",
        dv: "",
    });

    const datosBanco = {
        titular: "DANNY POLLOS SPA",
        rut: "76.123.456-7",
        banco: "Banco Estado",
        tipoCuenta: "Cuenta Corriente",
        numeroCuenta: "123456789012",
        correo: "pagos@dannypollos.cl",
    };

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

        const subtotal = carritoLocal.reduce(
            (sum, item) => sum + (item.total || 0),
            0
        );
        setTotal(subtotal);
    }, []);

    const handleChange = (e) => {
        let { name, value } = e.target;

        if (name === "rut") value = value.replace(/\D/g, "").slice(0, 8);
        if (name === "dv")
            value = value
                .toUpperCase()
                .replace(/[^0-9K]/g, "")
                .slice(0, 1);

        setForm({ ...form, [name]: value });
    };

    const formatearRUT = (rut, dv) => {
        if (!rut) return "";
        let revRut = rut.split("").reverse().join("");
        let rutFormateado =
            revRut
                .match(/.{1,3}/g)
                ?.join(".")
                .split("")
                .reverse()
                .join("") || rut;
        return dv ? `${rutFormateado}-${dv}` : rutFormateado;
    };

    const validarRUT = (rut, dv) => {
        if (!rut || !dv) return false;
        let suma = 0;
        let multiplo = 2;
        for (let i = rut.length - 1; i >= 0; i--) {
            suma += parseInt(rut.charAt(i)) * multiplo;
            multiplo = multiplo < 7 ? multiplo + 1 : 2;
        }
        let dvEsperado = 11 - (suma % 11);
        dvEsperado =
            dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : dvEsperado.toString();
        return dv.toUpperCase() === dvEsperado;
    };

    const validarFormulario = () => {
        if (productos.length === 0) {
            setAlerta("No hay productos en el carrito para pagar.");
            return false;
        }
        if (!form.nombre) {
            setAlerta("Debes ingresar tu nombre completo.");
            return false;
        }
        if (!form.rut || !form.dv) {
            setAlerta("Debes ingresar tu RUT y dígito verificador.");
            return false;
        }
        if (!validarRUT(form.rut, form.dv)) {
            setAlerta("El RUT ingresado no es válido.");
            return false;
        }
        setAlerta("");
        return true;
    };

    const confirmarTransferencia = async () => {
        if (!validarFormulario()) return;

        try {
            const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
            const token = localStorage.getItem("token");

            // 1️⃣ Obtener sucursal
            const resProfile = await fetch(`${apiUrl}api/profile/`, {
                headers: { Authorization: `Token ${token}` },
            });
            if (!resProfile.ok)
                throw new Error("No se pudo obtener el perfil del usuario");
            const perfil = await resProfile.json();
            const sucursalId = perfil.caja?.sucursal;
            if (!sucursalId)
                throw new Error("El usuario no tiene una sucursal asignada");

            // 2️⃣ Obtener inventarios
            const resInventario = await fetch(`${apiUrl}inventario/`, {
                headers: { Authorization: `Token ${token}` },
            });
            if (!resInventario.ok)
                throw new Error("No se pudo obtener el inventario desde el servidor");
            const inventarios = await resInventario.json();

            // 3️⃣ Recorrer productos y promociones
            // 3️⃣ Recorrer productos y promociones
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

                // Si no hay items a procesar, saltar este item
                if (itemsAProcesar.length === 0) {
                    console.warn("⚠️ Producto sin item válido o promoción vacía:", item);
                    continue;
                }

                // 4️⃣ Actualizar inventario
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

                    const resUpdate = await fetch(
                        `${apiUrl}inventario/update/${inv.id}/`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Token ${token}`,
                            },
                            body: JSON.stringify({ cantidad_vendida: ip.cantidad }),
                        }
                    );

                    if (!resUpdate.ok) {
                        console.error(`❌ Error al actualizar inventario ${inv.id}`);
                    } else {
                        const data = await resUpdate.json();
                        console.log(
                            `✅ Inventario actualizado: nuevo stock → ${data.nuevo_stock}`
                        );
                    }
                }
            }

            // 5️⃣ Limpiar carrito y continuar
            setTransferenciaHecha(true);
            localStorage.removeItem("carrito");
            localStorage.removeItem("metodoPago");
            setTimeout(() => { setTransferenciaHecha(false); navigate("/") }, 4000);
        } catch (error) {
            console.error("❌ Error en la actualización de inventario:", error);
            alert("No se pudo actualizar el inventario correctamente");
        }
    };

    const copiarDatos = (texto) => {
        navigator.clipboard.writeText(texto);
        alert("Datos copiados al portapapeles");
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-100 via-white to-red-200 p-6">
            <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-200">
                {/* Encabezado */}
                <div className="flex flex-col items-center text-center mb-6">
                    <Banknote size={40} className="text-red-600 mb-2" />
                    <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                        Pago por Transferencia
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
                        <span>Transferencia Bancaria</span>
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
                                    <tr
                                        key={i}
                                        className="border-b last:border-none text-gray-700"
                                    >
                                        <td className="py-2 px-3">
                                            {item.producto?.nombre ||
                                                item.producto?.descripcion ||
                                                "-"}
                                        </td>
                                        <td className="text-center">{item.cantidad}</td>
                                        <td className="text-right">
                                            ${item.total?.toLocaleString() || "0"}
                                        </td>
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

                {/* Datos bancarios */}
                <div className="bg-red-50 rounded-lg p-4 border border-red-300 mb-4 text-sm text-gray-700">
                    <h3 className="font-bold text-red-800 mb-2">
                        Datos para Transferencia:
                    </h3>
                    <p className="font-semibold">
                        <strong>Titular:</strong> {datosBanco.titular}{" "}
                        <Clipboard
                            className="inline ml-2 cursor-pointer text-red-600 hover:text-red-800"
                            size={16}
                            onClick={() => copiarDatos(datosBanco.titular)}
                        />
                    </p>
                    <p className="font-semibold">
                        <strong>RUT:</strong> {datosBanco.rut}
                    </p>
                    <p className="font-semibold">
                        <strong>Banco:</strong> {datosBanco.banco}
                    </p>
                    <p className="font-semibold">
                        <strong>Tipo de cuenta:</strong> {datosBanco.tipoCuenta}
                    </p>
                    <p className="font-semibold">
                        <strong>N° de cuenta:</strong> {datosBanco.numeroCuenta}{" "}
                        <Clipboard
                            className="inline ml-2 cursor-pointer text-red-600 hover:text-red-800"
                            size={16}
                            onClick={() => copiarDatos(datosBanco.numeroCuenta)}
                        />
                    </p>
                    <p className="font-semibold">
                        <strong>Correo:</strong> {datosBanco.correo}
                    </p>
                </div>

                {/* Datos del cliente */}
                <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-3 text-gray-700">
                        Ingresa tus datos:
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            placeholder="Ej: Juan Pérez"
                            className="border p-2 rounded-md w-full"
                        />
                        <div className="flex gap-2">
                            <input
                                type="text"
                                name="rut"
                                value={form.rut}
                                onChange={handleChange}
                                placeholder="12345678"
                                className="border p-2 rounded-md w-3/4"
                            />
                            <input
                                type="text"
                                name="dv"
                                value={form.dv}
                                onChange={handleChange}
                                placeholder="K"
                                className="border p-2 rounded-md w-1/4"
                            />
                        </div>
                        <div className="col-span-2 text-gray-600 text-sm">
                            Formato RUT: {formatearRUT(form.rut, form.dv)}
                        </div>
                    </div>
                </div>

                {/* Alertas */}
                {alerta && (
                    <div className="mb-4 flex items-center gap-2 bg-red-500 text-white font-semibold rounded-lg py-2 px-4 animate-pulse">
                        <AlertCircle size={20} />
                        <span>{alerta}</span>
                    </div>
                )}

                {/* Confirmar pago */}
                <button
                    onClick={confirmarTransferencia}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold shadow-md hover:scale-[1.02] hover:shadow-lg transition-transform duration-200"
                >
                    <CheckCircle2 size={18} />
                    Confirmar Transferencia
                </button>

                {/* Mensaje de éxito */}
                {transferenciaHecha && (
                    <div className="mt-4 flex items-center justify-center gap-2 bg-green-500 text-white font-semibold rounded-lg py-3 px-4 animate-bounce shadow-md">
                        <CheckCircle2 size={22} />
                        <span> Transferencia registrada con éxito</span>
                    </div>
                )}

                {/* Pie */}
                <div className="mt-6 text-center text-gray-600 text-xs">
                    <p className="italic mt-1">Gracias por su compra</p>
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
