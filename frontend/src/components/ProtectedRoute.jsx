// frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_DASHBOARDS } from '../utils/constants';
import Loader from './Loader';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader fullPage message="Verifying security credentials..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required, verify access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const fallbackPath = ROLE_DASHBOARDS[user.role] || '/';
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default ProtectedRoute;

