import { createBrowserRouter, Navigate } from 'react-router';
import { Login } from './pages/Login';
import { ResidentPortal } from './pages/ResidentPortal';
import { AdminDashboard } from './pages/AdminDashboard';
import { OfficerVerification } from './pages/OfficerVerification';
import { useAuth } from './contexts/AuthContext';

// Protected Route Component
function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole?: string }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Redirect to their appropriate dashboard
    if (user.role === 'Resident') return <Navigate to="/resident" replace />;
    if (user.role === 'Admin') return <Navigate to="/admin" replace />;
    if (user.role === 'Officer') return <Navigate to="/officer" replace />;
  }

  return <>{children}</>;
}

export const router = createBrowserRouter([
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
