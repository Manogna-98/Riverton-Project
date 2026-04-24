import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Car, AlertCircle, Lock, Mail, Shield } from 'lucide-react';
import { motion } from 'motion/react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string>('Resident');
  const [error, setError] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const { login, loading: authLoading } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoggingIn(true);
    const result = await login(email, password, role);
    setIsLoggingIn(false);

    if (result.success) {
      // Navigate based on role
      if (role === 'Resident') {
        navigate('/resident');
      } else if (role === 'Admin') {
        navigate('/admin');
      } else if (role === 'Officer') {
        navigate('/officer');
      }
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Password recovery email sent to ' + email);
    setShowRecovery(false);
  };

  if (showRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center space-y-4">
              <motion.div 
                className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Lock className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-2xl">Reset Password</CardTitle>
                <CardDescription className="text-base mt-2">
                  Enter your email to receive password reset instructions
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRecovery} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recovery-email" className="text-base">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="recovery-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  <Button type="submit" className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Send Reset Link
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full h-12"
                    onClick={() => setShowRecovery(false)}
                  >
                    Back to Login
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const roleIcons = {
    Resident: '👤',
    Admin: '⚙️',
    Officer: '👮'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
          <CardHeader className="text-center space-y-4 pb-6">
            <motion.div 
              className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Car className="h-10 w-10 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                CityPark
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Smart Parking Permit Management
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-base font-medium">User Type</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role" className="h-12 text-base">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{roleIcons[role as keyof typeof roleIcons]}</span>
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Resident">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">👤</span>
                        <span>Resident</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Admin">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">⚙️</span>
                        <span>Admin</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Officer">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">👮</span>
                        <span>Officer</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert variant="destructive" className="border-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <div className="space-y-3 pt-2">
                <Button 
                  type="submit" 
                  disabled={isLoggingIn || authLoading} 
                  className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                >
                  <Shield className="h-5 w-5 mr-2" />
                  {isLoggingIn ? 'Signing In...' : 'Sign In'}
                </Button>

              </div>
            </form>

            <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <p className="font-semibold text-sm text-blue-900 mb-3 flex items-center gap-2">
                <span className="text-lg">🔑</span>
                Demo Credentials:
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                  <span className="text-base">👤</span>
                  <span className="text-gray-700">resident_abc132@email.com / password123</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                  <span className="text-base">⚙️</span>
                  <span className="text-gray-700">admin1@riverton.gov / admin123</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                  <span className="text-base">👮</span>
                  <span className="text-gray-700">officer1@riverton.gov / officer123</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}