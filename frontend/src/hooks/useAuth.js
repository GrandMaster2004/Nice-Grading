import { useState, useEffect } from "react";
import {
  apiCall,
  getToken,
  setToken,
  setUser as saveUser,
  setUserRole,
} from "../utils/api.js";
import { sessionStorageManager } from "../utils/cache.js";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cachedUser = sessionStorageManager.getUser();
    const token = getToken();

    if (cachedUser && token) {
      setUser(cachedUser);
    }
    setLoading(false);
  }, []);

  const register = async (name, email, password) => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorageManager.clear();
    localStorage.clear();
    setUser(null);
  };

  const isAuthenticated = !!user && !!getToken();
  const isAdmin = user?.role === "admin";

  return {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated,
    isAdmin,
  };
};
