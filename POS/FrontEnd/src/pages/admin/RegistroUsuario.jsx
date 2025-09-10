import { useState } from "react";

export default function CreateUser() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        is_admin: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch((`${apiUrl}register/`), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const data = await res.json();
        alert(data.message || data.error);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">Crear Usuario</h2>

                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    className="w-full p-3 mb-4 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full p-3 mb-4 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="first_name"
                    placeholder="First Name"
                    className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 bg-gray-200"
                    value={formData.first_name}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="last_name"
                    placeholder="Last Name"
                    className="w-full p-3 mb-4 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                    value={formData.last_name}
                    onChange={handleChange}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-full p-3 mb-4 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <label className="flex items-center gap-2 mb-6">
                    <input
                        type="checkbox"
                        name="is_admin"
                        checked={formData.is_admin}
                        onChange={handleChange}
                        className="h-4 w-4 accent-red-500"
                    />
                    <span>¿Es administrador?</span>
                </label>

                <button
                    type="submit"
                    className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition"
                >
                    Crear Usuario
                </button>
            </form>
        </div>
    );
}

