import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Banknote,
  ArrowLeft,
  CheckCircle2,
  Clipboard,
  AlertCircle,
} from "lucide-react";

export default function PagoTransferencia() {
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen } =
    useOutletContext?.() ?? { sidebarOpen: false, setSidebarOpen: () => {} };

  const [productos, setProductos] = useState([]);
  const [total, setTotal] = useState(0);
  const [nroBoleta, setNroBoleta] = useState("");
  const [fecha, setFecha] = useState("");
  const [transferenciaHecha, setTransferenciaHecha] = useState(false);
  const [alerta, setAlerta] = useState("");
  const [hora, setHora] = useState("");
  const [copiado, setCopiado] = useState(""); // toast de copiado

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

  // Reloj header
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setHora(
        now.toLocaleTimeString("es-CL", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

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
      value = value.toUpperCase().replace(/[^0-9K]/g, "").slice(0, 1);

    setForm({ ...form, [name]: value });
  };

  const formatearRUT = (rut, dv) => {
    if (!rut) return "";
    let rev = rut.split("").reverse().join("");
    let f =
      rev
        .match(/.{1,3}/g)
        ?.join(".")
        .split("")
        .reverse()
        .join("") || rut;
    return dv ? `${f}-${dv}` : f;
  };

  const validarRUT = (rut, dv) => {
    if (!rut || !dv) return false;
    let suma = 0,
      multiplo = 2;
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

      // 1) Perfil/sucursal
      const resProfile = await fetch(`${apiUrl}api/profile/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!resProfile.ok)
        throw new Error("No se pudo obtener el perfil del usuario");
      const perfil = await resProfile.json();
      const sucursalId = perfil.caja?.sucursal;
      if (!sucursalId)
        throw new Error("El usuario no tiene una sucursal asignada");

      // 2) Inventario
      const resInventario = await fetch(`${apiUrl}inventario/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!resInventario.ok)
        throw new Error("No se pudo obtener el inventario desde el servidor");
      const inventarios = await resInventario.json();

      // 3) Procesar items
      for (const item of carrito) {
        const itemsAProcesar = [];
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
        if (item.producto && Array.isArray(item.producto.productos)) {
          item.producto.productos.forEach((p) => {
            if (p.item) {
              if (p.eq_pollo !== null) {
                itemsAProcesar.push({
                  itemId: p.item,
                  cantidad:
                    (p.cantidad || 1) * (item.cantidad || 1) * p.eq_pollo,
                });
              } else {
                itemsAProcesar.push({
                  itemId: p.item,
                  cantidad: (p.cantidad || 1) * (item.cantidad || 1),
                });
              }
            }
          });
        }

        if (itemsAProcesar.length === 0) continue;

        // 4) Actualizar inventario
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
          }
        }
      }

      // 5) Limpiar y feedback
      setTransferenciaHecha(true);
      localStorage.removeItem("carrito");
      localStorage.removeItem("metodoPago");
      setTimeout(() => {
        setTransferenciaHecha(false);
        navigate("/");
      }, 4000);
    } catch (error) {
      console.error("❌ Error en la actualización de inventario:", error);
      setAlerta("No se pudo actualizar el inventario correctamente.");
    }
  };

  const copiarDatos = async (texto, label) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(`${label} copiado`);
      setTimeout(() => setCopiado(""), 1800);
    } catch {
      setCopiado("No se pudo copiar");
      setTimeout(() => setCopiado(""), 1800);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-white to-red-200">
      {/* HEADER que abre/cierra el sidebar */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Móvil */}
          <div className="block md:hidden py-3">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Abrir/Cerrar barra lateral"
              className="w-10 h-10 inline-flex items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              ☰
            </button>
            <div className="mt-2 flex items-center justify-center gap-2">
              <Banknote className="text-red-600" size={22} />
              <h1 className="text-xl font-extrabold text-gray-900">
                Pago por Transferencia
              </h1>
            </div>
            <span className="mt-1 block text-center text-gray-600 font-medium">
              {hora}
            </span>
          </div>

          {/* Desktop/Tablet */}
          <div className="hidden md:flex items-center justify-between py-4">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Abrir/Cerrar barra lateral"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              ☰
            </button>

            <div className="flex items-center gap-3">
              <Banknote className="text-red-600" size={26} />
              <h1 className="text-2xl font-extrabold text-gray-900">
                Pago por Transferencia
              </h1>
            </div>

            <span className="min-w-[120px] text-right text-gray-600 font-medium">
              {hora}
            </span>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        {/* Grid 1→2 cols; derecha centrada en md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* IZQUIERDA: boleta + detalle + total */}
          <section className="space-y-4">
            {/* Info Boleta */}
            <div className="bg-white/90 rounded-xl shadow border border-gray-200 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-700">
                <div className="flex justify-between sm:block">
                  <span className="font-semibold">N° Boleta:</span>
                  <span className="sm:block sm:mt-1">{nroBoleta}</span>
                </div>
                <div className="flex justify-between sm:block">
                  <span className="font-semibold">Fecha:</span>
                  <span className="sm:block sm:mt-1">{fecha}</span>
                </div>
                <div className="flex justify-between sm:block">
                  <span className="font-semibold">Método:</span>
                  <span className="sm:block sm:mt-1">Transferencia</span>
                </div>
              </div>
            </div>

            {/* Detalle productos */}
            <div className="bg-white/90 rounded-xl shadow border border-gray-200 overflow-hidden">
              {/* Tabla (sm+) */}
              <div className="hidden sm:block">
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

              {/* Cards (móvil) */}
              <ul className="sm:hidden divide-y divide-gray-200">
                {productos.length > 0 ? (
                  productos.map((item, i) => (
                    <li key={i} className="p-4">
                      <h4 className="font-semibold text-gray-900">
                        {item.producto?.nombre || item.producto?.descripcion || "-"}
                      </h4>
                      <div className="mt-1 text-sm text-gray-700 flex justify-between">
                        <span>Cant.: {item.cantidad}</span>
                        <span className="font-medium">
                          ${item.total?.toLocaleString() || "0"}
                        </span>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="p-4 text-center text-gray-500">Carrito vacío</li>
                )}
              </ul>
            </div>

            {/* Total */}
            <div className="bg-white/90 rounded-xl shadow border border-gray-200 p-4 flex items-center justify-between">
              <span className="font-semibold text-gray-700">Total:</span>
              <span className="text-xl font-extrabold text-gray-900">
                ${total.toLocaleString()}
              </span>
            </div>
          </section>

          {/* DERECHA: datos banco + cliente + acciones (centrada) */}
          <section className="md:self-center">
            <div className="bg-white/90 rounded-xl shadow border border-gray-200 p-4 sm:p-6">
              {/* Datos bancarios */}
              <div className="bg-red-50 rounded-lg p-4 border border-red-300 mb-5 text-sm text-gray-700">
                <h3 className="font-bold text-red-800 mb-2">
                  Datos para Transferencia:
                </h3>
                <p className="font-semibold">
                  <strong>Titular:</strong> {datosBanco.titular}{" "}
                  <button
                    type="button"
                    onClick={() => copiarDatos(datosBanco.titular, "Titular")}
                    className="inline-flex items-center gap-1 ml-2 text-red-600 hover:text-red-800"
                    title="Copiar titular"
                  >
                    <Clipboard size={16} />
                    Copiar
                  </button>
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
                  <button
                    type="button"
                    onClick={() =>
                      copiarDatos(datosBanco.numeroCuenta, "N° de cuenta")
                    }
                    className="inline-flex items-center gap-1 ml-2 text-red-600 hover:text-red-800"
                    title="Copiar número de cuenta"
                  >
                    <Clipboard size={16} />
                    Copiar
                  </button>
                </p>
                <p className="font-semibold">
                  <strong>Correo:</strong> {datosBanco.correo}
                </p>
              </div>

              {/* Alerta de validación/errores */}
              {alerta && (
                <div className="mb-4 flex items-center gap-2 bg-red-100 border border-red-400 text-red-800 rounded-lg py-3 px-4 shadow-sm">
                  <AlertCircle size={20} />
                  <span className="font-semibold">{alerta}</span>
                </div>
              )}

              {/* Toast de copiado */}
              {copiado && (
                <div className="mb-4 flex items-center justify-center gap-2 bg-gray-800 text-white rounded-lg py-2 px-3 text-sm">
                  <Clipboard size={16} />
                  <span>{copiado}</span>
                </div>
              )}

              {/* Confirmar */}
              <button
                onClick={confirmarTransferencia}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold shadow-md hover:scale-[1.02] hover:shadow-lg transition-transform duration-200"
              >
                <CheckCircle2 size={18} />
                Confirmar Transferencia
              </button>

              {/* Éxito */}
              {transferenciaHecha && (
                <div className="mt-4 flex items-center justify-center gap-2 bg-green-500 text-white font-semibold rounded-lg py-3 px-4 shadow-md">
                  <CheckCircle2 size={22} />
                  <span>Transferencia registrada con éxito</span>
                </div>
              )}

              {/* Pie + Volver */}
              <div className="mt-6 text-center text-gray-600 text-xs">
                Gracias por su compra
                <p className="italic mt-1">¡Vuelva pronto!</p>
              </div>

              <button
                onClick={() => navigate("/Carrito")}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200"
              >
                <ArrowLeft size={18} />
                Volver a métodos de pago
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Barra fija móvil opcional (si quieres mostrar Total) */}
      {/* 
      <div className="sm:hidden fixed inset-x-0 bottom-0 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-3">
          <div className="text-sm">
            <div className="text-gray-500 leading-none">Total</div>
            <div className="text-lg font-bold text-gray-900">${total.toLocaleString()}</div>
          </div>
        </div>
      </div>
      */}
    </div>
  );
}
