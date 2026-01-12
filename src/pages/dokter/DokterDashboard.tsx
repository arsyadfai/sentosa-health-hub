import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QueueCard } from '@/components/dashboard/QueueCard';
import { useAuth } from '@/contexts/AuthContext';
import { ClipboardList, UserCheck, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function DokterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  // Fetch today's queue for this doctor (or all if not linked)
  const { data: antrianToday = [], isLoading } = useQuery({
    queryKey: ['dokter-antrian-today', today],
    queryFn: async () => {
      const { data } = await supabase
        .from('antrian')
        .select(`
          *,
          pasien:pasien_id(id, nama, no_rm)
        `)
        .eq('tanggal', today)
        .order('no_antrian');
      return data || [];
    },
  });

  // Fetch recent completed examinations
  const { data: recentPatients = [] } = useQuery({
    queryKey: ['dokter-recent-patients'],
    queryFn: async () => {
      const { data } = await supabase
        .from('rekam_medis')
        .select(`
          id,
          diagnosa,
          created_at,
          pasien:pasien_id(nama)
        `)
        .order('created_at', { ascending: false })
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

  const totalToday = antrianToday.length;
  const selesai = antrianToday.filter((a: any) => a.status === 'selesai').length;
  const menunggu = antrianToday.filter((a: any) => ['menunggu', 'dipanggil'].includes(a.status)).length;
  const diperiksa = antrianToday.filter((a: any) => a.status === 'diperiksa').length;

  const stats = [
    { title: 'Antrian Hari Ini', value: totalToday, icon: ClipboardList, variant: 'primary' as const },
    { title: 'Sudah Diperiksa', value: selesai, icon: UserCheck, variant: 'success' as const },
    { title: 'Menunggu', value: menunggu, icon: Clock, variant: 'warning' as const },
    { title: 'Sedang Diperiksa', value: diperiksa, icon: CheckCircle, variant: 'info' as const },
  ];

  const activeQueue = antrianToday
    .filter((a: any) => ['menunggu', 'dipanggil', 'diperiksa'].includes(a.status))
    .map((a: any) => ({
      id: a.id,
      nomorAntrian: `A-${String(a.no_antrian).padStart(3, '0')}`,
      namaPasien: a.pasien?.nama || 'Unknown',
      keluhan: a.keluhan || '-',
      waktu: new Date(a.waktu_daftar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status: a.status === 'diperiksa' ? 'Diperiksa' as const : 'Menunggu' as const,
      antrianId: a.id,
    }));

  return (
    <DashboardLayout title={`Selamat Datang, ${user?.nama || 'Dokter'}`} subtitle={todayFormatted}>
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
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : activeQueue.length > 0 ? (
            <div className="space-y-3">
              {activeQueue.map((queue: any) => (
                <QueueCard
                  key={queue.id}
                  {...queue}
                  onAction={() => navigate(`/dokter/periksa?antrian_id=${queue.antrianId}`)}
                  actionLabel={queue.status === 'Menunggu' ? 'Periksa' : 'Lanjutkan'}
                />
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

        {/* Recent Patients */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Pasien Terakhir Diperiksa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPatients.length > 0 ? (
              recentPatients.map((patient: any) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between pb-4 border-b border-border/50 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-foreground">{patient.pasien?.nama || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(patient.created_at).toLocaleTimeString('id-ID', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <Badge variant="secondary">{patient.diagnosa || 'Belum ada diagnosa'}</Badge>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Belum ada riwayat pemeriksaan
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}