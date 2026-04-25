import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { LogOut, Car, Menu } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('login_timestamp');
    navigate('/', { replace: true });
  };

  if (loading) return null;
  if (!user) return null;

  const roleColors: Record<string, string> = {
    resident: 'bg-blue-100 text-blue-700',
    admin: 'bg-purple-100 text-purple-700',
    officer: 'bg-green-100 text-green-700'
  };

  const safeRole = (user.role || '').toLowerCase();
  const displayRole = safeRole.charAt(0).toUpperCase() + safeRole.slice(1);

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <Car className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                RUPP
              </h1>
              <p className="text-xs text-gray-500">Parking Management System</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block ${roleColors[safeRole]}`}>
                {displayRole}
                </p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm" className="shadow-sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 border-t pt-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className={`text-xs font-medium px-2 py-1 rounded-full inline-block mt-1 ${roleColors[safeRole]}`}>
                {displayRole}
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}