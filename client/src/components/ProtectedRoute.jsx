// ProtectedRoute.jsx
import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth0();

    if (isLoading) return <div>Loading...</div>;

    return isAuthenticated ? children : <Navigate to="/" replace />;
};
