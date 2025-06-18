// src/pages/RoleRedirectPage.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // adjust if your hook is elsewhere

export default function RoleRedirectPage() {
  const { token, role } = useAuth(); // assume it gives { role: 'student' | 'admin' | etc }

  if (!token) return <Navigate to="/login" />;

  // Role-based redirection logic
  switch (role) {
    case "admin":
    case "instructor":
      return <Navigate to="/dashboard" />;
    case "student":
      return <Navigate to="/student/my-maintenance" />;
    default:
      return <Navigate to="/unauthorized" />;
  }
}
