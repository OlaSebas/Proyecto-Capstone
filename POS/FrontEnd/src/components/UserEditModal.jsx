import { useEffect, useState } from "react";
import { Pencil, X } from "lucide-react";

export default function UserEditModal({
  open = false,
  user = null, // { id, first_name, last_name, username, is_staff, is_superuser }
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

  // Verificar permisos del usuario actual
  const isSuperuser = localStorage.getItem("is_superuser") === "true";
  const isStaff = localStorage.getItem("is_staff") === "true";

  // Verificar si puede editar este usuario
  const puedeEditar = () => {
    if (!user) return false;
    if (isSuperuser) {
      // Superuser puede editar a TODOS (incluyendo otros superusers)
      return true;
    }
    if (isStaff) {
      // Admin solo puede editar usuarios normales (is_staff=false, is_superuser=false)
      return !user.is_staff && !user.is_superuser;
    }
    return false;
  };

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

    if (!puedeEditar()) {
      setLocalError("No tienes permiso para editar este usuario.");
      return;
    }

    if (!currentPassword) {
      setLocalError("Debe ingresar tu contraseña actual para confirmar.");
      return;
    }

    if (newPassword && newPassword !== newPasswordConfirm) {
      setLocalError("Las nuevas contraseñas no coinciden.");
      return;
    }

    if (newPassword && newPassword.length < 8) {
      setLocalError("La contraseña debe tener al menos 8 caracteres.");
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
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Pencil className="w-6 h-6 text-blue-600" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 id="user-edit-modal-title" className="text-lg sm:text-xl font-semibold text-gray-900">
                  {title}
                </h3>
                <p className="mt-1 text-sm sm:text-base text-gray-600">
                  Edita nombre, apellido y/o contraseña. Para confirmar ingresa tu contraseña actual.
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

            {!puedeEditar() ? (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm font-medium">
                  No tienes permiso para editar este usuario.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-4 sm:mt-6 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full mt-1 p-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-700"
                      placeholder="Nombre"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Apellido</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full mt-1 p-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-700"
                      placeholder="Apellido"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nueva contraseña (opcional)</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full mt-1 p-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-700"
                      placeholder="Nueva contraseña"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Repetir nueva contraseña</label>
                    <input
                      type="password"
                      value={newPasswordConfirm}
                      onChange={(e) => setNewPasswordConfirm(e.target.value)}
                      className="w-full mt-1 p-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-700"
                      placeholder="Repetir nueva contraseña"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contraseña actual (obligatoria)</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full mt-1 p-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-700"
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
                      loading ? "bg-blue-400 cursor-wait opacity-75" : "bg-blue-600 hover:bg-blue-700"
                    } shadow-sm`}
                  >
                    {loading && (
                      <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" fill="none" />
                        <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" fill="none" />
                      </svg>
                    )}
                    {confirmLabel}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}