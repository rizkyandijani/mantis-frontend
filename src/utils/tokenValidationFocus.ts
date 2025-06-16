// src/utils/tokenValidationFocus.ts
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../libs/api";
import { useAuth } from "../contexts/AuthContext";

export function useTokenValidationOnFocus() {
  const navigate = useNavigate();
  const { token, logout } = useAuth(); // ✅ get logout + token

  useEffect(() => {
    const validateToken = async () => {
      if (!token) return; // ✅ skip if user is already logged out

      try {
        console.log("Validating token...");
        await apiFetch("auth/validate-token");
      } catch (err) {
        console.warn("Token expired or invalid. Logging out...");
        logout({manual: false}); // ✅ clean up context and localStorage
        navigate("/login"); // optionally include redirect param here
      }
    };

    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        validateToken();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [navigate, token, logout]);
}
