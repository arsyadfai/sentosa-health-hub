import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari pasien, dokter..."
                  className="pl-9 bg-muted/50 border-0"
                />
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                  3
                </span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
