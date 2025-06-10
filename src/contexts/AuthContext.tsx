import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { Role } from "../types/user";

export interface AuthPayload {
  sub: string;
  role: Role;
  exp: number;
}

interface AuthContextType {
  token: string | null;
  role: Role | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isAuthReady, setAuthReady] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("authToken");
    if (t) {
      try {
        const { role: r, exp } = jwtDecode<AuthPayload>(t);
        if (Date.now() / 1000 < exp) {
          setToken(t);
          setRole(r);
        } else {
          localStorage.removeItem("authToken");
        }
      } catch {
        localStorage.removeItem("authToken");
      }
    }
    setAuthReady(true);
  }, []);

  const login = (t: string) => {
    localStorage.setItem("authToken", t);
    const { role: r } = jwtDecode<AuthPayload>(t);
    console.log("cek role in auth login", r);
    setToken(t);
    setRole(r);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
