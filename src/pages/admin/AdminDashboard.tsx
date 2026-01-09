import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QueueCard } from '@/components/dashboard/QueueCard';
import { Users, UserCog, ClipboardList, CreditCard, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const stats = [
  { title: 'Total Pasien', value: 1247, icon: Users, variant: 'primary' as const, trend: { value: 12, isPositive: true } },
  { title: 'Dokter Aktif', value: 15, icon: UserCog, variant: 'info' as const },
  { title: 'Antrian Hari Ini', value: 42, icon: ClipboardList, variant: 'warning' as const, subtitle: '8 menunggu' },
  { title: 'Pendapatan Hari Ini', value: 'Rp 8.5 Jt', icon: CreditCard, variant: 'success' as const, trend: { value: 8, isPositive: true } },
];

const weeklyData = [
  { day: 'Sen', pasien: 45 },
  { day: 'Sel', pasien: 52 },
  { day: 'Rab', pasien: 38 },
  { day: 'Kam', pasien: 65 },
  { day: 'Jum', pasien: 48 },
  { day: 'Sab', pasien: 72 },
  { day: 'Min', pasien: 25 },
];

const diagnosisData = [
  { name: 'ISPA', value: 35, color: 'hsl(199, 98%, 39%)' },
  { name: 'Hipertensi', value: 25, color: 'hsl(142, 76%, 36%)' },
  { name: 'Diabetes', value: 20, color: 'hsl(38, 92%, 50%)' },
  { name: 'Gastritis', value: 15, color: 'hsl(0, 72%, 51%)' },
  { name: 'Lainnya', value: 5, color: 'hsl(215, 15%, 45%)' },
];

const recentActivities = [
  { id: '1', type: 'registrasi' as const, message: 'Pasien baru: Budi Hartono telah terdaftar', time: '5 menit lalu' },
  { id: '2', type: 'pemeriksaan' as const, message: 'Dr. Sari selesai memeriksa pasien A-023', time: '15 menit lalu' },
  { id: '3', type: 'pembayaran' as const, message: 'Pembayaran Rp 250.000 dari pasien A-021', time: '30 menit lalu' },
  { id: '4', type: 'registrasi' as const, message: 'Antrian A-024 telah didaftarkan', time: '45 menit lalu' },
  { id: '5', type: 'pemeriksaan' as const, message: 'Dr. Ahmad memulai pemeriksaan A-022', time: '1 jam lalu' },
];

const currentQueue = [
  { nomorAntrian: 'A-024', namaPasien: 'Dewi Susanti', keluhan: 'Demam dan batuk sudah 3 hari', waktu: '09:30', status: 'Menunggu' as const },
  { nomorAntrian: 'A-025', namaPasien: 'Rudi Hermawan', keluhan: 'Nyeri perut bagian kanan', waktu: '09:45', status: 'Menunggu' as const },
  { nomorAntrian: 'A-023', namaPasien: 'Siti Aminah', keluhan: 'Kontrol tekanan darah', waktu: '09:15', status: 'Diperiksa' as const },
];

export default function AdminDashboard() {
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <DashboardLayout title="Dashboard Admin" subtitle={today}>
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
              <span>+12%</span>
            </div>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Diagnosis Pie Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Distribusi Diagnosa</CardTitle>
            <p className="text-sm text-muted-foreground">Bulan ini</p>
          </CardHeader>
          <CardContent>
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
                  {diagnosisData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {diagnosisData.slice(0, 4).map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue and Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Current Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Antrian Terkini</h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              Lihat Semua
            </Button>
          </div>
          <div className="space-y-3">
            {currentQueue.map((queue) => (
              <QueueCard key={queue.nomorAntrian} {...queue} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivity activities={recentActivities} />
      </div>
    </DashboardLayout>
  );
}
