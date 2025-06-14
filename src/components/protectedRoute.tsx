import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Role } from "../types/user";

interface Props {
  allowedRoles: Role[];
  children: ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: Props) {
  //   const navigate = useNavigate();
  const { token, role, isAuthReady } = useAuth();
  const location = useLocation();
  console.log("masuk protected", token, role);
  if (!isAuthReady) {
    return null; // or a loading spinner
  }

  if (!token) {
    console.log("masuk protected no token");
    return <Navigate to={`/login?redirect=${location.pathname}`} />;
    // return <Navigate to="/login" replace />;
  }
  if (!role || !allowedRoles.includes(role)) {
    console.log("masuk protected no role or not allowed");
    // logged in but not authorized
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
}
