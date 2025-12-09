import React from "react";
import { CheckCircle2 } from "lucide-react";

export default function SuccessModal({
  open = false,
  title = "¡Operación exitosa!",
  description = "La operación se completó correctamente.",
  confirmLabel = "Aceptar",
  onConfirm = () => {},
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
    >
      {/* backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onConfirm}
      />

      {/* panel */}
      <div className="relative w-full max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 id="success-modal-title" className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{description}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onConfirm}
                className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-sm"
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}