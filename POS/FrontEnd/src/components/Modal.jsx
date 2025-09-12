import { useState } from "react";

export default function Modal({ text, isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-80 max-w-sm text-center">
                <p className="mb-6 text-gray-800">{text}</p>
                <button
                    onClick={onClose}
                    className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
                >
                    Aceptar
                </button>
            </div>
        </div>
    );
}
