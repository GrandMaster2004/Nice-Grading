# Implementation Reference - Before & After

## File 1: src/utils/api.js

### BEFORE

```javascript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const token = localStorage.getItem("token"); // ❌ Using localStorage

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
```

### AFTER

```javascript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const token = getToken(); // ✅ Use sessionStorage

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
      // ✅ Auto-clear invalid tokens
      if (response.status === 401) {
        removeToken();
        removeUser();
      }
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// ✅ Get token from sessionStorage (session-based auth)
export const getToken = () => sessionStorage.getItem("auth_token");

// ✅ Set token in sessionStorage
export const setToken = (token) => {
  if (token) {
    sessionStorage.setItem("auth_token", token);
  }
};

// ✅ Remove token from sessionStorage
export const removeToken = () => sessionStorage.removeItem("auth_token");

export const getUserRole = () => {
  const user = getUser();
  return user?.role || null; // ✅ Derive from user object
};

export const setUserRole = (role) => {
  // Role is now derived from user object, no separate storage needed
};

export const getUser = () => {
  const user = sessionStorage.getItem("auth_user"); // ✅ New key
  return user ? JSON.parse(user) : null;
};

export const setUser = (user) => {
  if (user) {
    sessionStorage.setItem("auth_user", JSON.stringify(user)); // ✅ New key
  }
};

export const removeUser = () => {
  sessionStorage.removeItem("auth_user"); // ✅ New key
};
```

**Key Changes:**

- ❌ Removed: `localStorage` usage
- ✅ Added: 401 error handling to auto-clear invalid tokens
- ✅ Changed: Token key from "token" → "auth_token"
- ✅ Changed: User key from "user" → "auth_user"
- ✅ Derived: Role from user object instead of separate storage

---

## File 2: src/hooks/useAuth.js

### BEFORE

```javascript
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

  // ❌ Simple initialization, no error handling
  useEffect(() => {
    const cachedUser = sessionStorageManager.getUser();
    const token = getToken();

    // Only set user if both cached data and token exist
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

      // ❌ Redundant storage calls
      setToken(data.token);
      saveUser(data.user);
      sessionStorageManager.setUser(data.user);
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

      // ❌ Redundant storage calls
      setToken(data.token);
      saveUser(data.user);
      sessionStorageManager.setUser(data.user);
      setUserRole(data.user.role);
      setUser(data.user);

      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    // ❌ Incomplete cleanup
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
    [user, isInitializing, error],
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
```

### AFTER

```javascript
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
  removeToken,
  removeUser as clearUser,
  getUser,
} from "../utils/api.js";
import { sessionStorageManager } from "../utils/cache.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Robust initialization with error handling
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = getToken();
        const cachedUser = getUser();

        // Only restore auth if both token and user exist in sessionStorage
        if (token && cachedUser) {
          setUser(cachedUser);
        } else {
          // Clear both if either is missing (corrupted state)
          removeToken();
          clearUser();
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
        // Clear auth on initialization error
        removeToken();
        clearUser();
      } finally {
        // Always finish initializing, even if restoration failed
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  const register = async (name, email, password) => {
    setError(null);
    try {
      const data = await apiCall("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      // ✅ Clean, single flow
      setToken(data.token);
      saveUser(data.user);
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

      // ✅ Clean, single flow
      setToken(data.token);
      saveUser(data.user);
      setUser(data.user);

      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    // ✅ Safe, targeted cleanup
    removeToken();
    clearUser();
    sessionStorageManager.clear();
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
    [user, isInitializing, error],
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
```

**Key Changes:**

- ✅ Added: `removeToken`, `removeUser`, `getUser` imports
- ✅ Improved: `useEffect` initialization with try-catch
- ✅ Removed: Redundant `setUserRole()` calls
- ✅ Removed: Duplicate `sessionStorageManager.setUser()`
- ✅ Simplified: Login/register to single clean flow
- ✅ Improved: Logout with targeted cleanup
- ✅ Added: Error handling for corrupted auth state

---

## No Changes Needed - These Are Already Optimal

### src/components/ProtectedRoute.jsx

✅ Already correctly checks `isInitializing` to prevent flicker
✅ Already redirects unauthorized users to login
✅ No changes required

### src/pages/Auth.jsx

✅ Already uses `useAuth` hook correctly
✅ Already handles auth errors properly
✅ No changes required

### src/hooks/useSubmissions.js

✅ Already uses `apiCall` which now uses sessionStorage
✅ Already has submission caching logic
✅ No changes required

### src/main.jsx

✅ Already wraps app with `AuthProvider`
✅ No changes required

---

## Testing Checklist

- [ ] Verify fresh page load restores auth from sessionStorage
- [ ] Verify loading spinner shown only on app init, not on route changes
- [ ] Verify navigation between pages is instant (no API calls)
- [ ] Verify login redirects to dashboard instantly
- [ ] Verify logout clears all auth data
- [ ] Verify 401 response auto-clears token
- [ ] Verify ProtectedRoute still prevents unauthorized access
- [ ] Verify admin role still works correctly
- [ ] Verify refresh page preserves session
- [ ] Verify closing tab clears sessionStorage
