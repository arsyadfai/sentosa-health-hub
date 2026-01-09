import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      navigate(`/${user.role}`);
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success('Login berhasil!');
        // Navigation will be handled by useEffect
      } else {
        toast.error(result.error || 'Email atau password salah');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat login');
    } finally {
      setIsLoading(false);
    }
  };

  const setupDemoAccounts = async () => {
    setIsSettingUp(true);
    try {
      const { data, error } = await supabase.functions.invoke('setup-demo-accounts');
      
      if (error) {
        toast.error('Gagal membuat akun demo');
        console.error(error);
      } else {
        toast.success('Akun demo berhasil dibuat!');
        console.log('Demo accounts setup:', data);
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
      console.error(error);
    } finally {
      setIsSettingUp(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 medical-gradient flex-col justify-between p-12 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/20 backdrop-blur">
            <Activity className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Sentosa Lite</h1>
            <p className="text-sm text-primary-foreground/80">Sistem Informasi Klinik</p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-bold leading-tight">
            Manajemen Klinik
            <br />
            <span className="text-primary-foreground/90">Modern & Terintegrasi</span>
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            Kelola rawat jalan, rekam medis, dan billing dalam satu sistem yang mudah digunakan.
          </p>
          <div className="flex gap-4">
            <div className="rounded-xl bg-primary-foreground/10 backdrop-blur px-4 py-3">
              <p className="text-2xl font-bold">1000+</p>
              <p className="text-sm text-primary-foreground/80">Pasien Terdaftar</p>
            </div>
            <div className="rounded-xl bg-primary-foreground/10 backdrop-blur px-4 py-3">
              <p className="text-2xl font-bold">15</p>
              <p className="text-sm text-primary-foreground/80">Dokter Aktif</p>
            </div>
            <div className="rounded-xl bg-primary-foreground/10 backdrop-blur px-4 py-3">
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-sm text-primary-foreground/80">Layanan</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-primary-foreground/60">
          © 2024 Sentosa Lite. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary lg:hidden">
              <Activity className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">Selamat Datang</CardTitle>
            <CardDescription>Masuk ke akun Anda untuk melanjutkan</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@sentosa.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Masuk'
                )}
              </Button>

              {/* Demo Credentials */}
              <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                <p className="text-sm font-medium text-foreground text-center">Akun Demo:</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Admin:</span>
                    <code className="text-xs">admin@sentosa.id / admin123</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Dokter:</span>
                    <code className="text-xs">dokter@sentosa.id / dokter123</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Kasir:</span>
                    <code className="text-xs">kasir@sentosa.id / kasir123</code>
                  </div>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  className="w-full mt-2"
                  onClick={setupDemoAccounts}
                  disabled={isSettingUp}
                >
                  {isSettingUp ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Membuat akun...
                    </>
                  ) : (
                    'Buat Akun Demo'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
