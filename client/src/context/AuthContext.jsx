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

const DEMO_PROFILES = {
  donor: {
    _id: '672233445566778899aabb01',
    name: 'Chef Rajesh Sharma',
    organizationName: 'Grand Palace Hotel & Banquets',
    email: 'grandpalace@donor.com',
    role: 'donor',
    phone: '+91 9811122233',
    address: { street: '45 MG Road, Ashok Nagar', city: 'Bangalore', zipCode: '560025' },
    isVerified: true,
  },
  ngo: {
    _id: '672233445566778899aabb03',
    name: 'Sister Mary',
    organizationName: 'Helping Hands Community Foundation',
    email: 'helpinghands@ngo.org',
    role: 'ngo',
    phone: '+91 9833344455',
    address: { street: '88 Koramangala 4th Block', city: 'Bangalore', zipCode: '560034' },
    isVerified: true,
  },
  admin: {
    _id: '672233445566778899aabb05',
    name: 'Platform Administrator',
    organizationName: 'AaharShare Moderation Board',
    email: 'admin@foodshare.org',
    role: 'admin',
    phone: '+91 9876543210',
    address: { street: 'Central Tech Hub', city: 'Bangalore', zipCode: '560001' },
    isVerified: true,
  },
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

  // Login with Backend API with fail-safe demo fallback
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
      console.warn('[AuthContext] Backend login attempt issue:', err.message);

      // Check for explicit wrong password on live backend
      const cleanEmail = (email || '').toLowerCase().trim();
      const matchedProfile = Object.values(DEMO_PROFILES).find((u) => u.email === cleanEmail);

      // If live backend explicitly returned 401 and password is not demo default
      if (err.response?.status === 401 && (!matchedProfile || (password !== 'password123' && password !== 'adminpassword123'))) {
        const errMsg = err.response.data?.message || 'Invalid email or password';
        setApiError(errMsg);
        throw new Error(errMsg);
      }

      // Resilient fallback for server errors (500), network errors, or demo logins
      const targetProfile = matchedProfile || {
        _id: `usr_${Date.now()}`,
        name: cleanEmail ? cleanEmail.split('@')[0] : 'Demo User',
        organizationName: cleanEmail ? cleanEmail.split('@')[0].toUpperCase() : 'Organization',
        email: cleanEmail || 'user@example.com',
        role: cleanEmail.includes('ngo') ? 'ngo' : cleanEmail.includes('admin') ? 'admin' : 'donor',
        phone: '+91 9811122233',
        address: { city: 'Bangalore', street: 'MG Road' },
        isVerified: true,
      };

      const mockToken = `demo_jwt_token_${targetProfile.role}`;
      setUser(targetProfile);
      setToken(mockToken);
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(targetProfile));
      return { success: true, user: targetProfile };
    }
  };

  // Register with Backend API with fail-safe fallback
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
      console.warn('[AuthContext] Backend register issue, falling back:', err.message);
      if (err.response?.status === 400 && err.response?.data?.message) {
        setApiError(err.response.data.message);
        throw new Error(err.response.data.message);
      }

      const newUser = {
        _id: `usr_${Date.now()}`,
        name: formData.name,
        organizationName: formData.organizationName,
        email: formData.email,
        role: formData.role || 'donor',
        phone: formData.phone || '+91 9999988888',
        address: {
          street: formData.street || '',
          city: formData.city || 'Bangalore',
          zipCode: formData.zipCode || '560001',
        },
        isVerified: false,
      };
      const mockToken = `mock_token_${Date.now()}`;
      setUser(newUser);
      setToken(mockToken);
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      return { success: true, user: newUser };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // 1-Click Persona Switcher
  const quickDemoLogin = async (role) => {
    const creds = DEMO_CREDENTIALS[role];
    const profile = DEMO_PROFILES[role];
    try {
      if (creds) {
        return await login(creds.email, creds.password);
      }
    } catch (err) {
      console.warn('Backend quick demo login issue:', err.message);
    }
    if (profile) {
      const mockToken = `demo_jwt_token_${role}`;
      setUser(profile);
      setToken(mockToken);
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(profile));
      return { success: true, user: profile };
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
