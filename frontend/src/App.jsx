// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ROLES } from './utils/constants';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Citizen Pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import ReportComplaint from './pages/citizen/ReportComplaint';
import MyComplaints from './pages/citizen/MyComplaints';

// Municipal Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import PendingComplaints from './pages/admin/PendingComplaints';
import ComplaintReview from './pages/admin/ComplaintReview';
import InProgressAssignments from './pages/admin/InProgressAssignments';
import OverdueAssignments from './pages/admin/OverdueAssignments';
import ResolvedAssignments from './pages/admin/ResolvedAssignments';

// Higher Authority Pages
import AuthorityDashboard from './pages/authority/AuthorityDashboard';
import DepartmentPerformance from './pages/authority/DepartmentPerformance';
import OverdueReports from './pages/authority/OverdueReports';
import AdministrativeActions from './pages/authority/AdministrativeActions';

// System Administrator Pages
import SysAdminDashboard from './pages/sysadmin/SysAdminDashboard';
import PendingStaff from './pages/sysadmin/PendingStaff';
import AllUsers from './pages/sysadmin/AllUsers';

// Inlined Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="d-flex align-items-center justify-content-center vh-100 bg-light p-4">
          <div className="card shadow-sm p-4 text-center" style={{ maxWidth: 500 }}>
            <h4 className="text-danger fw-bold mb-2">Something went wrong</h4>
            <p className="text-muted small mb-3">An unexpected error occurred while rendering the page.</p>
            {this.state.error && (
              <pre className="text-start bg-light p-2 small border rounded text-danger overflow-auto mb-3" style={{ maxHeight: 150 }}>
                {this.state.error.toString()}
              </pre>
            )}
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Toast Notification Container Component
const GlobalToast = () => {
  const { toast, clearToast } = useAuth();
  if (!toast) return null;

  return (
    <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
      <div className={`toast show align-items-center text-bg-${toast.type === 'error' ? 'danger' : toast.type === 'success' ? 'success' : 'primary'} border-0`} role="alert">
        <div className="d-flex">
          <div className="toast-body">{toast.message}</div>
          <button
            type="button"
            className="btn-close btn-close-white me-2 m-auto"
            onClick={clearToast}
            aria-label="Close"
          />
        </div>
      </div>
    </div>
  );
};

// Admin roles compatibility (support both 'ADMIN' and 'MUNICIPAL_ADMIN')
const ADMIN_ROLES = [ROLES.ADMIN, ROLES.MUNICIPAL_ADMIN, 'ADMIN', 'MUNICIPAL_ADMIN'];

export const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <GlobalToast />
          <Routes>
            {/* Public Portal Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Citizen Protected Routes */}
            <Route
              path="/citizen/dashboard"
              element={
                <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
                  <CitizenDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen/report"
              element={
                <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
                  <ReportComplaint />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen/complaints"
              element={
                <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
                  <MyComplaints />
                </ProtectedRoute>
              }
            />
            <Route path="/citizen/my-complaints" element={<Navigate to="/citizen/complaints" replace />} />

            {/* Municipal Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pending"
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <PendingComplaints />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/complaints/:id"
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <ComplaintReview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/review"
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <ComplaintReview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/in-progress"
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <InProgressAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/overdue"
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <OverdueAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/resolved"
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <ResolvedAssignments />
                </ProtectedRoute>
              }
            />

            {/* Higher Authority Protected Routes */}
            <Route
              path="/authority/dashboard"
              element={
                <ProtectedRoute allowedRoles={[ROLES.HIGHER_AUTHORITY]}>
                  <AuthorityDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/authority/departments"
              element={
                <ProtectedRoute allowedRoles={[ROLES.HIGHER_AUTHORITY]}>
                  <DepartmentPerformance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/authority/overdue"
              element={
                <ProtectedRoute allowedRoles={[ROLES.HIGHER_AUTHORITY]}>
                  <OverdueReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/authority/actions"
              element={
                <ProtectedRoute allowedRoles={[ROLES.HIGHER_AUTHORITY]}>
                  <AdministrativeActions />
                </ProtectedRoute>
              }
            />

            {/* System Administrator Protected Routes */}
            <Route
              path="/sysadmin/dashboard"
              element={
                <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN]}>
                  <SysAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sysadmin/pending-staff"
              element={
                <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN]}>
                  <PendingStaff />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sysadmin/users"
              element={
                <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN]}>
                  <AllUsers />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
