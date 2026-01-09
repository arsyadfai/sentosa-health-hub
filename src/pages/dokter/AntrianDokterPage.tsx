import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardList, Phone, Stethoscope } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Antrian {
  id: string;
  no_antrian: number;
  tanggal: string;
  keluhan: string | null;
  status: 'menunggu' | 'dipanggil' | 'diperiksa' | 'selesai' | 'batal';
  waktu_daftar: string;
  pasien?: { 
    id: string;
    nama: string; 
    no_rm: string; 
    tanggal_lahir: string | null;
    jenis_kelamin: string | null;
    no_telepon: string | null;
  };
}

export default function AntrianDokterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: antrianList = [], isLoading } = useQuery({
    queryKey: ['antrian-dokter', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('antrian')
        .select(`
          *,
          pasien:pasien_id(id, nama, no_rm, tanggal_lahir, jenis_kelamin, no_telepon)
        `)
        .eq('tanggal', today)
        .in('status', ['menunggu', 'dipanggil', 'diperiksa'])
        .order('no_antrian', { ascending: true });
      if (error) throw error;
      return data as Antrian[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: Record<string, unknown> = { status };
      if (status === 'dipanggil') updates.waktu_panggil = new Date().toISOString();
      if (status === 'diperiksa') updates.waktu_panggil = new Date().toISOString();

      const { error } = await supabase.from('antrian').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['antrian-dokter'] });
      toast.success('Status antrian diperbarui');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handlePanggil = (antrian: Antrian) => {
    updateStatusMutation.mutate({ id: antrian.id, status: 'dipanggil' });
  };

  const handlePeriksa = (antrian: Antrian) => {
    updateStatusMutation.mutate({ id: antrian.id, status: 'diperiksa' });
    navigate(`/dokter/periksa?antrian_id=${antrian.id}`);
  };

  const getStatusBadge = (status: Antrian['status']) => {
    const variants: Record<string, { className: string; label: string }> = {
      menunggu: { className: 'bg-warning/10 text-warning border-warning/30', label: 'Menunggu' },
      dipanggil: { className: 'bg-info/10 text-info border-info/30', label: 'Dipanggil' },
      diperiksa: { className: 'bg-primary/10 text-primary border-primary/30', label: 'Diperiksa' },
    };
    const { className, label } = variants[status] || {};
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} tahun`;
  };

  const menunggu = antrianList.filter(a => a.status === 'menunggu');
  const dipanggil = antrianList.filter(a => a.status === 'dipanggil');
  const diperiksa = antrianList.filter(a => a.status === 'diperiksa');

  return (
    <DashboardLayout title="Antrian Hari Ini" subtitle={new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : antrianList.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <ClipboardList className="h-12 w-12 mb-4 opacity-50" />
            <p>Tidak ada antrian hari ini</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Currently Being Examined */}
          {diperiksa.length > 0 && (
            <div className="lg:col-span-3">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                Sedang Diperiksa
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {diperiksa.map((antrian) => (
                  <Card key={antrian.id} className="shadow-card border-primary/50 border-2">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl">
                            {antrian.no_antrian}
                          </div>
                          <div>
                            <p className="font-semibold text-lg">{antrian.pasien?.nama}</p>
                            <p className="text-sm text-muted-foreground">{antrian.pasien?.no_rm}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary">{antrian.pasien?.jenis_kelamin || '-'}</Badge>
                              <span className="text-sm text-muted-foreground">{calculateAge(antrian.pasien?.tanggal_lahir || null)}</span>
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(antrian.status)}
                      </div>
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium">Keluhan:</p>
                        <p className="text-sm text-muted-foreground">{antrian.keluhan || 'Tidak ada keluhan tercatat'}</p>
                      </div>
                      <Button className="w-full mt-4" onClick={() => navigate(`/dokter/periksa?antrian_id=${antrian.id}`)}>
                        Lanjutkan Pemeriksaan
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Called */}
          {dipanggil.length > 0 && (
            <div className="lg:col-span-3">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5 text-info" />
                Dipanggil
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dipanggil.map((antrian) => (
                  <Card key={antrian.id} className="shadow-card border-info/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info/10 font-bold text-info">
                            {antrian.no_antrian}
                          </div>
                          <div>
                            <p className="font-medium">{antrian.pasien?.nama}</p>
                            <p className="text-sm text-muted-foreground">{antrian.pasien?.no_rm}</p>
                          </div>
                        </div>
                        {getStatusBadge(antrian.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{antrian.keluhan || '-'}</p>
                      <Button className="w-full" onClick={() => handlePeriksa(antrian)}>
                        Mulai Periksa
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Waiting */}
          {menunggu.length > 0 && (
            <div className="lg:col-span-3">
              <h2 className="text-lg font-semibold mb-4">Menunggu ({menunggu.length})</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {menunggu.map((antrian) => (
                  <Card key={antrian.id} className="shadow-card">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10 font-bold text-warning">
                            {antrian.no_antrian}
                          </div>
                          <div>
                            <p className="font-medium">{antrian.pasien?.nama}</p>
                            <p className="text-sm text-muted-foreground">{antrian.pasien?.no_rm}</p>
                          </div>
                        </div>
                        {getStatusBadge(antrian.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{antrian.keluhan || '-'}</p>
                      <Button variant="outline" className="w-full" onClick={() => handlePanggil(antrian)}>
                        Panggil Pasien
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
