import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../libs/api";
import { jwtDecode } from "jwt-decode";
import { AuthPayload } from "../contexts/AuthContext";
import { UserRole } from "../types/user";
import { useAuth } from "../contexts/AuthContext";
import { useSearchParams } from "react-router-dom";

interface LoginResponse {
  token?: string;
  message: string;
  code: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await apiFetch<LoginResponse>("login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (response.token) {
        login(response.token);
        const { role } = jwtDecode<AuthPayload>(response.token);
        if (redirect) {
          navigate(redirect);
        } else if (role === UserRole.STUDENT) {
          navigate("/question");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
