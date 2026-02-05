const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const getToken = () => localStorage.getItem("token");
export const setToken = (token) => localStorage.setItem("token", token);
export const removeToken = () => localStorage.removeItem("token");

export const getUserRole = () => localStorage.getItem("userRole");
export const setUserRole = (role) => localStorage.setItem("userRole", role);

export const getUser = () => {
  const user = sessionStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const setUser = (user) =>
  sessionStorage.setItem("user", JSON.stringify(user));
export const removeUser = () => sessionStorage.removeItem("user");
