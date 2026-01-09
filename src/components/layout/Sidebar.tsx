import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCog,
  ClipboardList,
  FileText,
  Stethoscope,
  History,
  CreditCard,
  Receipt,
  LogOut,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Kelola Pasien', href: '/admin/pasien', icon: Users },
  { label: 'Kelola Dokter', href: '/admin/dokter', icon: UserCog },
  { label: 'Daftar Antrian', href: '/admin/antrian', icon: ClipboardList },
  { label: 'Laporan', href: '/admin/laporan', icon: FileText },
];

const dokterNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dokter', icon: LayoutDashboard },
  { label: 'Antrian Hari Ini', href: '/dokter/antrian', icon: ClipboardList },
  { label: 'Periksa Pasien', href: '/dokter/periksa', icon: Stethoscope },
  { label: 'Riwayat Pasien', href: '/dokter/riwayat', icon: History },
];

const kasirNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/kasir', icon: LayoutDashboard },
  { label: 'Tagihan', href: '/kasir/tagihan', icon: CreditCard },
  { label: 'Pembayaran', href: '/kasir/bayar', icon: Receipt },
  { label: 'Riwayat Transaksi', href: '/kasir/riwayat', icon: History },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getNavItems = (): NavItem[] => {
    switch (user?.role) {
      case 'admin':
        return adminNavItems;
      case 'dokter':
        return dokterNavItems;
      case 'kasir':
        return kasirNavItems;
      default:
        return [];
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'admin':
        return 'Administrator';
      case 'dokter':
        return 'Dokter';
      case 'kasir':
        return 'Kasir';
      default:
        return '';
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 sidebar-gradient">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary">
            <Activity className="h-6 w-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">Sentosa Lite</h1>
            <p className="text-xs text-sidebar-foreground/70">Sistem Klinik</p>
          </div>
        </div>

        {/* User Info */}
        <div className="border-b border-sidebar-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent text-sm font-semibold text-sidebar-accent-foreground">
              {user?.nama.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.nama}</p>
              <p className="text-xs text-sidebar-foreground/70">{getRoleLabel()}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-sidebar-border p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={logout}
          >
            <LogOut className="h-5 w-5" />
            <span>Keluar</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
