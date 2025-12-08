import { useEffect, useState } from "react";
import { DollarSign, X } from "lucide-react";

export default function CerrarCajaModal({
  open = false,
  title = "Cerrar Caja",
  confirmLabel = "Cerrar Caja",
  cancelLabel = "Cancelar",
  loading = false,
  onConfirm = async (montoCierre) => {},
  onCancel = () => {},
}) {
  const [montoCierre, setMontoCierre] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!open) {
      setMontoCierre("");
      setLocalError("");
    }
  }, [open]);

  const handleConfirm = () => {
    setLocalError("");

    if (!montoCierre || parseFloat(montoCierre) < 0) {
      setLocalError("Debe ingresar un monto válido.");
      return;
    }

    onConfirm(parseFloat(montoCierre));
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Solo permite números y punto decimal
    if (/^\d*\.?\d*$/.test(value) || value === "") {
      setMontoCierre(value);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cerrar-caja-modal-title"
    >
      {/* backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      {/* panel */}
      <div className="relative w-full max-w-full sm:max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>

              <div className="flex-1 min-w-0">
                <h3
                  id="cerrar-caja-modal-title"
                  className="text-lg sm:text-xl font-semibold text-gray-900"
                >
                  {title}
                </h3>
                <p className="mt-1 text-sm sm:text-base text-gray-600">
                  Ingresa el monto final para cerrar la sesión de caja.
                </p>
              </div>

              <button
                type="button"
                onClick={onCancel}
                className="text-gray-500 hover:text-gray-700 ml-2"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 sm:mt-6 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Monto de cierre
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={montoCierre}
                  onChange={handleInputChange}
                  className="w-full mt-1 p-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-gray-700"
                  placeholder="Agregue el monto final"
                  required
                />
              </div>

              {localError && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-100 px-3 py-2 rounded">
                  {localError}
                </div>
              )}
            </div>

            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-md bg-white border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 shadow-sm disabled:opacity-50"
                disabled={loading}
              >
                {cancelLabel}
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className={`w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold text-white transition ${
                  loading
                    ? "bg-green-400 cursor-wait opacity-75"
                    : "bg-green-600 hover:bg-green-700"
                } shadow-sm`}
              >
                {loading && (
                  <svg
                    className="w-4 h-4 mr-2 animate-spin"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-25"
                      fill="none"
                    />
                    <path
                      d="M22 12a10 10 0 00-10-10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="opacity-75"
                      fill="none"
                    />
                  </svg>
                )}
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}