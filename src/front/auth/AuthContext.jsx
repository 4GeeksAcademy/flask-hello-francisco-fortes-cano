import { createContext, useContext, useState, useCallback } from 'react';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('token'));
  const login = (value) => { sessionStorage.setItem('token', value); setToken(value); };
  const logout = useCallback(() => { sessionStorage.removeItem('token'); setToken(null); }, []);
  return <AuthContext.Provider value={{ token, login, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
