import React from "react";

export default function UserDeleteConfirmModal({
  open = false,
  title = "Confirmar eliminación",
  description = "¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.",
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  loading = false,
  onConfirm = () => {},
  onCancel = () => {},
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-delete-modal-title"
    >
      {/* backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      <div className="relative w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-rose-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-7 4h10"
                  />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <h3
                  id="user-delete-modal-title"
                  className="text-lg font-semibold text-gray-900"
                >
                  {title}
                </h3>
                <p className="mt-1 text-sm text-gray-600">{description}</p>
              </div>
            </div>

            <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-md bg-white border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                {cancelLabel}
              </button>

              <button
                type="button"
                onClick={onConfirm}
                className={`w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold text-white shadow-sm ${
                  loading
                    ? "bg-rose-300 cursor-wait"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
                disabled={loading}
              >
                {loading ? (
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
                    />
                    <path
                      d="M22 12a10 10 0 00-10-10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="opacity-75"
                    />
                  </svg>
                ) : null}
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}