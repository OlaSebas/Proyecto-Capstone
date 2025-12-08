import { Navigate } from "react-router-dom";

export default function SuperuserProtectedRoute({ children }) {
    const is_superuser = localStorage.getItem("is_superuser") === "true";
    
    if (!is_superuser) {
        return <Navigate to="/venta" replace />;
    }
    return children;
}