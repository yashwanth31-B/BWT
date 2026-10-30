import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { getErrorMessage, checkHealth } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Pre-seeded Credentials matching backend seeder for 1-Click Demo
const DEMO_CREDENTIALS = {
  donor: { email: 'grandpalace@donor.com', password: 'password123' },
  ngo: { email: 'helpinghands@ngo.org', password: 'password123' },
  admin: { email: 'admin@foodshare.org', password: 'adminpassword123' },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Load and verify current user from backend
  const loadUser = useCallback(async (jwtToken) => {
    try {
      const { data } = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsLiveApi(true);
        return data.user;
      }
    } catch (err) {
      console.warn('[AuthContext] Failed to fetch /auth/me:', err.message);
      // If token is invalid or expired, clear session
      if (err.response?.status === 401) {
        logout();
      }
    }
    return null;
  }, []);

  // Initialize Auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const online = await checkHealth();
      setIsLiveApi(online);

      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken) {
        setToken(storedToken);
        if (online) {
          await loadUser(storedToken);
        } else if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            localStorage.removeItem('user');
          }
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for auth-expired event dispatched by axios interceptor
    const handleAuthExpired = () => {
      logout();
      setApiError('Your session has expired. Please log in again.');
    };
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, [loadUser]);

  // Login with Backend API
  const login = async (email, password) => {
    setApiError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        const { token: jwtToken, user: userData } = res.data;
        setUser(userData);
        setToken(jwtToken);
        setIsLiveApi(true);
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, user: userData };
      }
    } catch (err) {
      const errMsg = getErrorMessage(err, 'Invalid email or password');
      setApiError(errMsg);
      throw new Error(errMsg);
    }
  };

  // Register with Backend API
  const register = async (formData) => {
    setApiError(null);
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data?.success) {
        const { token: jwtToken, user: userData } = res.data;
        setUser(userData);
        setToken(jwtToken);
        setIsLiveApi(true);
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, user: userData };
      }
    } catch (err) {
      const errMsg = getErrorMessage(err, 'Registration failed');
      setApiError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // 1-Click Persona Switcher: Authenticates against the real backend
  const quickDemoLogin = async (role) => {
    const creds = DEMO_CREDENTIALS[role];
    if (creds) {
      try {
        return await login(creds.email, creds.password);
      } catch (err) {
        console.error(`Demo login failed for ${role}:`, err.message);
        throw err;
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!user,
        loading,
        isLiveApi,
        apiError,
        setApiError,
        login,
        register,
        logout,
        quickDemoLogin,
        refreshUser: () => token && loadUser(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
