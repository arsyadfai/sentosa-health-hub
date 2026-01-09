import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, ShieldCheck, Stethoscope, CreditCard, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const roles: { value: UserRole; label: string; icon: React.ElementType; description: string }[] = [
  { value: 'admin', label: 'Admin', icon: ShieldCheck, description: 'Kelola sistem klinik' },
  { value: 'dokter', label: 'Dokter', icon: Stethoscope, description: 'Periksa pasien' },
  { value: 'kasir', label: 'Kasir', icon: CreditCard, description: 'Kelola pembayaran' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password, selectedRole);
      if (success) {
        toast.success('Login berhasil!');
        navigate(`/${selectedRole}`);
      } else {
        toast.error('Email atau password salah');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat login');
    } finally {
      setIsLoading(false);
    }
  };

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
              {/* Role Selector */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Pilih Role</Label>
                <div className="grid grid-cols-3 gap-3">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setSelectedRole(role.value)}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200',
                        selectedRole === role.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      )}
                    >
                      <role.icon
                        className={cn(
                          'h-6 w-6',
                          selectedRole === role.value ? 'text-primary' : 'text-muted-foreground'
                        )}
                      />
                      <span className="text-sm font-medium">{role.label}</span>
                    </button>
                  ))}
                </div>
              </div>

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
                {isLoading ? 'Memproses...' : 'Masuk'}
              </Button>

              {/* Demo Credentials */}
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Demo:</span> Gunakan password{' '}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">demo123</code>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
