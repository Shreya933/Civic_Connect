// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLES, ROLE_DASHBOARDS, initialAllUsers } from '../utils/constants';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null); // { type: 'success'|'error'|'info', message: '' }

  // Show auto-dismissing toast notifications
  const showToast = (message, type = 'info', duration = 4000) => {
    setToast({ message, type });
    if (duration > 0) {
      setTimeout(() => {
        setToast((current) => (current?.message === message ? null : current));
      }, duration);
    }
  };

  const clearToast = () => setToast(null);

  // Restore authenticated session from localStorage
  useEffect(() => {
    try {
      const storedToken =
        localStorage.getItem('token') ||
        localStorage.getItem('civic_token');
      const storedUser =
        localStorage.getItem('user') ||
        localStorage.getItem('civic_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Failed to parse stored authentication', err);
      localStorage.removeItem('token');
      localStorage.removeItem('civic_token');
      localStorage.removeItem('user');
      localStorage.removeItem('civic_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const setAuthSession = (authData) => {
    const userObj = authData.user || authData;
    const sessionUser = {
      user_id: userObj.id || userObj.user_id || authData.user_id || authData.id,
      id: userObj.id || userObj.user_id || authData.user_id || authData.id,
      name: userObj.fullName || userObj.full_name || userObj.name || authData.name || 'Civic User',
      full_name: userObj.fullName || userObj.full_name || userObj.name || authData.full_name || 'Civic User',
      email: userObj.email || authData.email || '',
      role: userObj.role || authData.role,
      department: userObj.department || authData.department || null,
    };

    setUser(sessionUser);
    setToken(authData.token);

    // Save tokens and user details
    localStorage.setItem('token', authData.token);
    localStorage.setItem('civic_token', authData.token);
    if (authData.refresh_token) {
      localStorage.setItem('refresh_token', authData.refresh_token);
    }
    localStorage.setItem('user', JSON.stringify(sessionUser));
    localStorage.setItem('civic_user', JSON.stringify(sessionUser));
  };

  // Citizen login
  const loginCitizen = async (credentials) => {
    try {
      const result = await authApi.loginCitizen(credentials);
      setAuthSession(result.data);
      showToast(`Welcome back, ${result.data.name || result.data.full_name}!`, 'success');
      return { success: true, role: result.data.role };
    } catch (err) {
      const msg = typeof err === 'string' ? err : err.message || 'Login failed';
      showToast(msg, 'error');
      throw err;
    }
  };

  // Staff login step 1 (requests OTP)
  const loginStaff = async (credentials) => {
    try {
      const result = await authApi.loginStaff(credentials);
      const devOtp = result.data?.devOtp;
      if (devOtp) {
        showToast(`Dev OTP Code: ${devOtp} (Development Mode)`, 'info', 8000);
      } else {
        showToast('OTP sent! Check your registered email or server console.', 'info');
      }
      return result.data;
    } catch (err) {
      const msg = typeof err === 'string' ? err : err.message || 'Staff login failed';
      showToast(msg, 'error');
      throw err;
    }
  };

  // Staff OTP verification
  const verifyStaffOtp = async (userId, otp, email = null) => {
    try {
      const result = await authApi.verifyOtp({ user_id: userId, email, otp });
      setAuthSession(result.data);
      const activeRole = result.data.user?.role || result.data.role;
      showToast(`Authenticated as ${activeRole}. Welcome!`, 'success');
      return { success: true, role: activeRole };
    } catch (err) {
      const msg = typeof err === 'string' ? err : err.message || 'Verification failed';
      showToast(msg, 'error');
      throw err;
    }
  };

  // Citizen registration
  const registerCitizen = async (formData) => {
    try {
      const result = await authApi.registerCitizen(formData);
      showToast('Registration successful! You may now sign in.', 'success');
      return result;
    } catch (err) {
      const msg = typeof err === 'string' ? err : err.message || 'Registration failed';
      showToast(msg, 'error');
      throw err;
    }
  };

  // Staff registration
  const registerStaff = async (formData) => {
    try {
      const result = await authApi.registerStaff(formData);
      showToast('Request submitted! System Administrator approval is required.', 'info', 6000);
      return result;
    } catch (err) {
      const msg = typeof err === 'string' ? err : err.message || 'Request failed';
      showToast(msg, 'error');
      throw err;
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('civic_token');
    localStorage.removeItem('user');
    localStorage.removeItem('civic_user');
    showToast('You have been signed out safely.', 'info');
  };

  // Demo Role Quick-Switching (for evaluation / presentation testing)
  const switchDemoRole = (targetRole) => {
    const demoUser = initialAllUsers.find((u) => u.role === targetRole || (targetRole === 'MUNICIPAL_ADMIN' && u.role === 'ADMIN')) || {
      id: 'usr-demo-' + targetRole.toLowerCase(),
      full_name: `Demo ${targetRole}`,
      email: `${targetRole.toLowerCase()}@civicconnect.gov.in`,
      role: targetRole,
    };

    const sessionData = {
      user_id: demoUser.id,
      name: demoUser.full_name,
      full_name: demoUser.full_name,
      email: demoUser.email,
      role: targetRole,
      department: demoUser.department,
      token: `demo-token-${targetRole.toLowerCase()}-live`,
    };

    setAuthSession(sessionData);
    showToast(`Switched active profile to ${targetRole}`, 'info');
    return ROLE_DASHBOARDS[targetRole] || '/';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!token && !!user,
        loading,
        toast,
        showToast,
        clearToast,
        loginCitizen,
        loginStaff,
        verifyStaffOtp,
        registerCitizen,
        registerStaff,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
