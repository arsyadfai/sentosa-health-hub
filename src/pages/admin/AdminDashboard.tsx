import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QueueCard } from '@/components/dashboard/QueueCard';
import { Users, UserCog, ClipboardList, CreditCard, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const diagnosisColors = [
  'hsl(199, 98%, 39%)',
  'hsl(142, 76%, 36%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 72%, 51%)',
  'hsl(215, 15%, 45%)',
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  // Fetch total patients
  const { data: totalPasien = 0 } = useQuery({
    queryKey: ['stats-pasien'],
    queryFn: async () => {
      const { count } = await supabase.from('pasien').select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  // Fetch total doctors
  const { data: totalDokter = 0 } = useQuery({
    queryKey: ['stats-dokter'],
    queryFn: async () => {
      const { count } = await supabase.from('dokter').select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  // Fetch today's queue
  const { data: antrianToday = [] } = useQuery({
    queryKey: ['stats-antrian-today', today],
    queryFn: async () => {
      const { data } = await supabase
        .from('antrian')
        .select(`*, pasien:pasien_id(nama, no_rm), dokter:dokter_id(nama)`)
        .eq('tanggal', today)
        .order('no_antrian');
      return data || [];
    },
  });

  // Fetch today's revenue
  const { data: revenueToday = 0 } = useQuery({
    queryKey: ['stats-revenue-today', today],
    queryFn: async () => {
      const { data } = await supabase
        .from('billing')
        .select('total')
        .eq('status', 'lunas')
        .gte('tanggal_bayar', `${today}T00:00:00`)
        .lte('tanggal_bayar', `${today}T23:59:59`);
      return data?.reduce((sum, b) => sum + Number(b.total), 0) || 0;
    },
  });

  // Fetch weekly visit data
  const { data: weeklyData = [] } = useQuery({
    queryKey: ['stats-weekly'],
    queryFn: async () => {
      const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const result = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const { count } = await supabase
          .from('antrian')
          .select('*', { count: 'exact', head: true })
          .eq('tanggal', dateStr);
        
        result.push({
          day: days[date.getDay()],
          pasien: count || 0,
        });
      }
      
      return result;
    },
  });

  // Fetch diagnosis distribution
  const { data: diagnosisData = [] } = useQuery({
    queryKey: ['stats-diagnosis'],
    queryFn: async () => {
      const { data } = await supabase
        .from('rekam_medis')
        .select('diagnosa')
        .not('diagnosa', 'is', null);
      
      const diagnosisCounts: Record<string, number> = {};
      data?.forEach(rm => {
        const diagnosa = rm.diagnosa || 'Lainnya';
        diagnosisCounts[diagnosa] = (diagnosisCounts[diagnosa] || 0) + 1;
      });
      
      const sorted = Object.entries(diagnosisCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);
      
      return sorted.map(([name, value], index) => ({
        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
        value,
        color: diagnosisColors[index] || diagnosisColors[4],
      }));
    },
  });

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

  const waitingCount = antrianToday.filter((a: any) => a.status === 'menunggu').length;

  const stats = [
    { title: 'Total Pasien', value: totalPasien, icon: Users, variant: 'primary' as const },
    { title: 'Dokter Aktif', value: totalDokter, icon: UserCog, variant: 'info' as const },
    { title: 'Antrian Hari Ini', value: antrianToday.length, icon: ClipboardList, variant: 'warning' as const, subtitle: `${waitingCount} menunggu` },
    { title: 'Pendapatan Hari Ini', value: formatCurrency(revenueToday), icon: CreditCard, variant: 'success' as const },
  ];

  const currentQueue = antrianToday
    .filter((a: any) => ['menunggu', 'dipanggil', 'diperiksa'].includes(a.status))
    .slice(0, 3)
    .map((a: any) => ({
      nomorAntrian: `A-${String(a.no_antrian).padStart(3, '0')}`,
      namaPasien: a.pasien?.nama || 'Unknown',
      keluhan: a.keluhan || '-',
      waktu: new Date(a.waktu_daftar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status: a.status === 'menunggu' ? 'Menunggu' as const : 
              a.status === 'dipanggil' ? 'Menunggu' as const : 'Diperiksa' as const,
    }));

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <DashboardLayout title="Dashboard Admin" subtitle={todayFormatted}>
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Weekly Chart */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Kunjungan Pasien Mingguan</CardTitle>
              <p className="text-sm text-muted-foreground">7 hari terakhir</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-success">
              <TrendingUp className="h-4 w-4" />
              <span>{antrianToday.length} hari ini</span>
            </div>
          </CardHeader>
          <CardContent>
            {weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="pasien" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center">
                <Skeleton className="w-full h-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diagnosis Pie Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Distribusi Diagnosa</CardTitle>
            <p className="text-sm text-muted-foreground">Semua waktu</p>
          </CardHeader>
          <CardContent>
            {diagnosisData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={diagnosisData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {diagnosisData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {diagnosisData.slice(0, 4).map((item: any) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                <p>Belum ada data diagnosa</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Queue Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Antrian Terkini</h2>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate('/admin/antrian')}>
            <Calendar className="h-4 w-4" />
            Lihat Semua
          </Button>
        </div>
        {currentQueue.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {currentQueue.map((queue: any) => (
              <QueueCard key={queue.nomorAntrian} {...queue} />
            ))}
          </div>
        ) : (
          <Card className="shadow-card">
            <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
              <p>Tidak ada antrian aktif saat ini</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}