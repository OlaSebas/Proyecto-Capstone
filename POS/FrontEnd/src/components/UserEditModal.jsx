import { useEffect, useState } from "react";

export default function UserEditModal({
  open = false,
  user = null, // { id, first_name, last_name, username }
  title = "Editar usuario",
  confirmLabel = "Guardar",
  cancelLabel = "Cancelar",
  loading = false,
  onConfirm = async (payload) => {},
  onCancel = () => {},
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (open && user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
    } else if (!open) {
      setFirstName("");
      setLastName("");
      setNewPassword("");
      setNewPasswordConfirm("");
      setCurrentPassword("");
      setLocalError("");
    }
  }, [open, user]);

  const handleConfirm = () => {
    setLocalError("");
    if (!currentPassword) {
      setLocalError("Debe ingresar la contraseña actual para confirmar.");
      return;
    }
    if (newPassword && newPassword !== newPasswordConfirm) {
      setLocalError("Las nuevas contraseñas no coinciden.");
      return;
    }
    const payload = {
      id: user?.id,
      first_name: firstName,
      last_name: lastName,
      new_password: newPassword || null,
      current_password: currentPassword,
    };
    onConfirm(payload);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-edit-modal-title"
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      <div className="relative w-full max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 21a8 8 0 0114 0" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <h3 id="user-edit-modal-title" className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Edita nombre, apellido y/o contraseña. Para confirmar ingresa tu contraseña actual.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full mt-1 p-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 bg-white text-gray-700"
                  placeholder="Nombre"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Apellido</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full mt-1 p-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 bg-white text-gray-700"
                  placeholder="Apellido"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nueva contraseña (opcional)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full mt-1 p-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 bg-white text-gray-700"
                  placeholder="Nueva contraseña"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Repetir nueva contraseña</label>
                <input
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  className="w-full mt-1 p-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 bg-white text-gray-700"
                  placeholder="Repetir nueva contraseña"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña actual (obligatoria)</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full mt-1 p-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 bg-white text-gray-700"
                  placeholder="Contraseña actual"
                  required
                />
              </div>

              {localError && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-100 px-3 py-2 rounded">
                  {localError}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-white border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 shadow-sm"
                disabled={loading}
              >
                {cancelLabel}
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold text-white ${
                  loading ? "bg-gray-400 cursor-wait opacity-75" : "bg-gray-900 hover:bg-gray-800"
                } shadow-sm`}
              >
                {loading && (
                  <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
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