import { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/auth";
import { getToken, setUnauthorizedHandler } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [restoring, setRestoring] = useState(true);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setNotice("Tu sesión expiró");
    });
    (async () => {
      try {
        if (await getToken()) setUser(await authApi.fetchCurrentUser());
      } catch {
        setUser(null);
      } finally {
        setRestoring(false);
      }
    })();
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = async (email, password) => {
    setNotice(null);
    setUser(await authApi.login(email, password));
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setNotice(null);
  };

  const esAdmin = user?.rol === "administrador";

  return (
    <AuthContext.Provider value={{ user, esAdmin, restoring, notice, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
