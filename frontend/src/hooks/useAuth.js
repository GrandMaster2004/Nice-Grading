import {
  createContext,
  createElement,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import {
  apiCall,
  getToken,
  setToken,
  setUser as saveUser,
  setUserRole,
} from "../utils/api.js";
import { sessionStorageManager } from "../utils/cache.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cachedUser = sessionStorageManager.getUser();
    const token = getToken();

    if (cachedUser && token) {
      setUser(cachedUser);
    }
    setIsInitializing(false);
  }, []);

  const register = async (name, email, password) => {
    setError(null);
    try {
      const data = await apiCall("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      setToken(data.token);
      saveUser(data.user);
      setUserRole(data.user.role);
      setUser(data.user);

      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await apiCall("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setToken(data.token);
      saveUser(data.user);
      setUserRole(data.user.role);
      setUser(data.user);

      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    sessionStorageManager.clear();
    localStorage.clear();
    setUser(null);
  };

  const isAuthenticated = !!user && !!getToken();
  const isAdmin = user?.role === "admin";

  const value = useMemo(
    () => ({
      user,
      isInitializing,
      error,
      register,
      login,
      logout,
      isAuthenticated,
      isAdmin,
    }),
    [
      user,
      isInitializing,
      error,
      register,
      login,
      logout,
      isAuthenticated,
      isAdmin,
    ],
  );

  return createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
