import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/session`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data?.user ?? data))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email_address: email, password }),
    });
    if (!res.ok) throw new Error("Email o contraseña incorrectos");
    const data = await res.json();
    setUser(data?.user ?? data);
    return data;
  };

  const register = async (email, password, passwordConfirmation) => {
    const res = await fetch(`${API_URL}/registration`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email_address: email,
        password,
        password_confirmation: passwordConfirmation,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.errors?.join(", ") || "No se pudo crear la cuenta");
    }
    const data = await res.json();
    setUser(data?.user ?? data);
    return data;
  };

  const logout = async () => {
    await fetch(`${API_URL}/session`, { method: "DELETE", credentials: "include" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, checking, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
