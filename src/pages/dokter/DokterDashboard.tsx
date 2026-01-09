import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QueueCard } from '@/components/dashboard/QueueCard';
import { useAuth } from '@/contexts/AuthContext';
import { ClipboardList, UserCheck, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const stats = [
  { title: 'Antrian Hari Ini', value: 12, icon: ClipboardList, variant: 'primary' as const },
  { title: 'Sudah Diperiksa', value: 5, icon: UserCheck, variant: 'success' as const },
  { title: 'Menunggu', value: 7, icon: Clock, variant: 'warning' as const },
  { title: 'Selesai', value: 5, icon: CheckCircle, variant: 'info' as const },
];

const todayQueue = [
  { nomorAntrian: 'A-006', namaPasien: 'Ani Wulandari', keluhan: 'Sakit kepala dan pusing', waktu: '10:00', status: 'Menunggu' as const },
  { nomorAntrian: 'A-007', namaPasien: 'Budi Prasetyo', keluhan: 'Demam tinggi sejak 2 hari', waktu: '10:15', status: 'Menunggu' as const },
  { nomorAntrian: 'A-008', namaPasien: 'Citra Dewi', keluhan: 'Batuk berdahak', waktu: '10:30', status: 'Menunggu' as const },
  { nomorAntrian: 'A-005', namaPasien: 'Deni Saputra', keluhan: 'Nyeri sendi lutut', waktu: '09:45', status: 'Diperiksa' as const },
];

const recentPatients = [
  { nama: 'Eka Putri', diagnosa: 'ISPA', waktu: '09:30' },
  { nama: 'Fajar Rahman', diagnosa: 'Gastritis', waktu: '09:00' },
  { nama: 'Gita Sari', diagnosa: 'Hipertensi', waktu: '08:30' },
  { nama: 'Hendra Wijaya', diagnosa: 'Diabetes Type 2', waktu: '08:00' },
];

export default function DokterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

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
        {/* Queue */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Antrian Pasien Hari Ini</h2>
          <div className="space-y-3">
            {todayQueue.map((queue) => (
              <QueueCard
                key={queue.nomorAntrian}
                {...queue}
                onAction={() => navigate('/dokter/periksa')}
                actionLabel={queue.status === 'Menunggu' ? 'Periksa' : 'Lanjutkan'}
              />
            ))}
          </div>
        </div>

        {/* Recent Patients */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Pasien Terakhir Diperiksa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPatients.map((patient, index) => (
              <div
                key={index}
                className="flex items-center justify-between pb-4 border-b border-border/50 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-foreground">{patient.nama}</p>
                  <p className="text-sm text-muted-foreground">{patient.waktu}</p>
                </div>
                <Badge variant="secondary">{patient.diagnosa}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
