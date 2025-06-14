import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../libs/api"; // your auth-checking API

export function useTokenValidationOnFocus() {
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      try {
        await apiFetch("/auth/validate-token"); // adjust your endpoint
      } catch (err) {
        console.warn("Token expired or invalid, redirecting...");
        navigate("/login"); // force logout
      }
    };

    const handleFocus = () => {
      console.log("Tab focused, checking token...");
      validateToken();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        handleFocus();
      }
    });

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [navigate]);
}
