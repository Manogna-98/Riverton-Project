import { RouterProvider } from 'react-router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppRoutes />
        <Toaster />
      </DataProvider>
    </AuthProvider>
  );
}
