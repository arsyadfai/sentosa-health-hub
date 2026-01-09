import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const stats = [
  { title: 'Pendapatan Hari Ini', value: 'Rp 4.5 Jt', icon: TrendingUp, variant: 'success' as const, trend: { value: 15, isPositive: true } },
  { title: 'Transaksi Lunas', value: 18, icon: CheckCircle, variant: 'primary' as const },
  { title: 'Menunggu Bayar', value: 5, icon: Clock, variant: 'warning' as const },
  { title: 'Total Transaksi', value: 23, icon: CreditCard, variant: 'info' as const },
];

const pendingPayments = [
  { id: '1', nomorAntrian: 'A-021', namaPasien: 'Ahmad Fauzi', total: 350000, waktu: '10:30' },
  { id: '2', nomorAntrian: 'A-019', namaPasien: 'Bella Safitri', total: 275000, waktu: '10:00' },
  { id: '3', nomorAntrian: 'A-018', namaPasien: 'Cahyo Nugroho', total: 450000, waktu: '09:45' },
  { id: '4', nomorAntrian: 'A-016', namaPasien: 'Diana Putri', total: 200000, waktu: '09:15' },
  { id: '5', nomorAntrian: 'A-015', namaPasien: 'Eko Prasetyo', total: 525000, waktu: '09:00' },
];

const recentTransactions = [
  { id: '1', namaPasien: 'Fitri Handayani', total: 300000, metode: 'Tunai', status: 'Lunas' },
  { id: '2', namaPasien: 'Gilang Ramadhan', total: 425000, metode: 'QRIS', status: 'Lunas' },
  { id: '3', namaPasien: 'Hesti Wulandari', total: 175000, metode: 'Transfer', status: 'Lunas' },
  { id: '4', namaPasien: 'Irwan Setiawan', total: 550000, metode: 'Tunai', status: 'Lunas' },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function KasirDashboard() {
  const { user } = useAuth();

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <DashboardLayout title={`Selamat Datang, ${user?.nama}`} subtitle={today}>
      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pending Payments */}
        <div className="lg:col-span-2">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Menunggu Pembayaran</CardTitle>
                <p className="text-sm text-muted-foreground">Pasien yang sudah selesai diperiksa</p>
              </div>
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                {pendingPayments.length} antrian
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-4 transition-all hover:shadow-card-hover"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">
                        {payment.nomorAntrian}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{payment.namaPasien}</p>
                        <p className="text-sm text-muted-foreground">Jam {payment.waktu}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-lg font-semibold text-foreground">
                        {formatCurrency(payment.total)}
                      </p>
                      <Button size="sm">Proses Bayar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Transaksi Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between pb-4 border-b border-border/50 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-foreground">{transaction.namaPasien}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {transaction.metode}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        transaction.status === 'Lunas'
                          ? 'bg-success/10 text-success border-success/30'
                          : 'bg-warning/10 text-warning border-warning/30'
                      )}
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
                <p className="font-semibold text-foreground">{formatCurrency(transaction.total)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
