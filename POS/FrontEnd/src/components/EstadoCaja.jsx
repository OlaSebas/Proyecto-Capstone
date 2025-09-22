import { Link, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";

export default function EstadoCaja() {
const apiUrl = import.meta.env.VITE_API_URL;
const [cajaAbierta, setCajaAbierta] = useState(false);
const token = localStorage.getItem("token");

useEffect(() => {
    const fetchEstadoCaja = async () => {
        try {
            const response = await fetch(`${apiUrl}api/sesion_activa/`, {
                headers: {
                    Authorization: `Token ${token}`
                }
            });
            const data = await response.json();
            setCajaAbierta(data.abierta);
        } catch (error) {
            console.error("Error fetching estado de caja:", error);
        }
    };
    fetchEstadoCaja();
},[]);

    return cajaAbierta;
}
