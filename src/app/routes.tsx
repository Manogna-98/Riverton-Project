import { useEffect } from 'react';
import { createHashRouter, Navigate } from 'react-router';
import { Login } from './pages/Login';
import { ResidentPortal } from './pages/ResidentPortal';
import { AdminDashboard } from './pages/AdminDashboard';
import { OfficerVerification } from './pages/OfficerVerification';
import { useAuth } from './contexts/AuthContext';

// Protected Route Component
function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole?: string }) {
  const { user, logout, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && allowedRole && user.role?.toLowerCase() !== allowedRole.toLowerCase()) {
      logout();
    }
  }, [user, allowedRole, logout, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && user.role?.toLowerCase() !== allowedRole.toLowerCase()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export const router = createHashRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/resident',
    element: (
      <ProtectedRoute allowedRole="Resident">
        <ResidentPortal />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRole="Admin">
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/officer',
    element: (
      <ProtectedRoute allowedRole="Officer">
        <OfficerVerification />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
