import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function KasirDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  // Fetch today's billing stats
  const { data: billingToday = [], isLoading } = useQuery({
    queryKey: ['kasir-billing-today', today],
    queryFn: async () => {
      const { data } = await supabase
        .from('billing')
        .select(`
          *,
          pasien:pasien_id(nama, no_rm),
          antrian:antrian_id(no_antrian)
        `)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  // Fetch pending payments
  const { data: pendingPayments = [] } = useQuery({
    queryKey: ['kasir-pending'],
    queryFn: async () => {
      const { data } = await supabase
        .from('billing')
        .select(`
          *,
          pasien:pasien_id(nama, no_rm),
          antrian:antrian_id(no_antrian)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(5);
      return data || [];
    },
  });

  // Fetch recent completed transactions
  const { data: recentTransactions = [] } = useQuery({
    queryKey: ['kasir-recent-transactions'],
    queryFn: async () => {
      const { data } = await supabase
        .from('billing')
        .select(`
          *,
          pasien:pasien_id(nama)
        `)
        .eq('status', 'lunas')
        .order('tanggal_bayar', { ascending: false })
        .limit(4);
      return data || [];
    },
  });

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const revenueToday = billingToday
    .filter((b: any) => b.status === 'lunas')
    .reduce((sum: number, b: any) => sum + Number(b.total), 0);
  
  const lunasCount = billingToday.filter((b: any) => b.status === 'lunas').length;
  const pendingCount = pendingPayments.length;
  const totalTransactions = billingToday.length;

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(1)} Jt`;
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyFull = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPaymentMethodLabel = (method: string | null) => {
    const labels: Record<string, string> = {
      tunai: 'Tunai',
      transfer: 'Transfer',
      kartu_debit: 'Debit',
      kartu_kredit: 'Kredit',
      bpjs: 'BPJS',
    };
    return labels[method || ''] || method || '-';
  };

  const stats = [
    { title: 'Pendapatan Hari Ini', value: formatCurrency(revenueToday), icon: TrendingUp, variant: 'success' as const },
    { title: 'Transaksi Lunas', value: lunasCount, icon: CheckCircle, variant: 'primary' as const },
    { title: 'Menunggu Bayar', value: pendingCount, icon: Clock, variant: 'warning' as const },
    { title: 'Total Transaksi', value: totalTransactions, icon: CreditCard, variant: 'info' as const },
  ];

  return (
    <DashboardLayout title={`Selamat Datang, ${user?.nama || 'Kasir'}`} subtitle={todayFormatted}>
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
                {pendingCount} antrian
              </Badge>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : pendingPayments.length > 0 ? (
                <div className="space-y-3">
                  {pendingPayments.map((payment: any) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between rounded-lg border bg-card p-4 transition-all hover:shadow-card-hover"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">
                          {payment.antrian?.no_antrian || '-'}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{payment.pasien?.nama || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(payment.created_at).toLocaleTimeString('id-ID', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-semibold text-foreground">
                          {formatCurrencyFull(Number(payment.total))}
                        </p>
                        <Button size="sm" onClick={() => navigate(`/kasir/bayar?billing_id=${payment.id}`)}>
                          Proses Bayar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <p>Tidak ada tagihan pending</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Transaksi Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction: any) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between pb-4 border-b border-border/50 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-foreground">{transaction.pasien?.nama || 'Unknown'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {getPaymentMethodLabel(transaction.metode_pembayaran)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          transaction.status === 'lunas'
                            ? 'bg-success/10 text-success border-success/30'
                            : 'bg-warning/10 text-warning border-warning/30'
                        )}
                      >
                        {transaction.status === 'lunas' ? 'Lunas' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                  <p className="font-semibold text-foreground">{formatCurrencyFull(Number(transaction.total))}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Belum ada transaksi
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}