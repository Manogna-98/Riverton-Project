import { useEffect } from 'react';
import { createHashRouter, Navigate } from 'react-router';
import { Login } from './pages/Login';
import { ResidentPortal } from './pages/ResidentPortal';
import { AdminDashboard } from './pages/AdminDashboard';
import { OfficerVerification } from './pages/OfficerVerification';
import { useAuth } from './contexts/AuthContext';

// Protected Route Component
function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole?: string }) {
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user && allowedRole && user.role !== allowedRole) {
      logout();
    }
  }, [user, allowedRole, logout]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
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
