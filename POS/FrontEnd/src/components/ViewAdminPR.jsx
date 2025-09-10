import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
    const is_staff = localStorage.getItem("is_staff") === "true";
    
    if (!is_staff) {
        return <Navigate to="/venta" replace />;
    }
    return children;
}
