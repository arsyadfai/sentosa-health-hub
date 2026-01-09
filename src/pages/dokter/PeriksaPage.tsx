import { useSearchParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Save, ArrowLeft, FileText } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';

export default function PeriksaPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const antrianId = searchParams.get('antrian_id');

  const [formData, setFormData] = useState({
    tekanan_darah: '',
    berat_badan: '',
    tinggi_badan: '',
    suhu_tubuh: '',
    diagnosa: '',
    tindakan: '',
    resep: '',
    catatan: '',
  });

  const { data: antrian, isLoading } = useQuery({
    queryKey: ['antrian-detail', antrianId],
    queryFn: async () => {
      if (!antrianId) return null;
      const { data, error } = await supabase
        .from('antrian')
        .select(`
          *,
          pasien:pasien_id(*),
          dokter:dokter_id(*)
        `)
        .eq('id', antrianId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!antrianId,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!antrian) throw new Error('Data antrian tidak ditemukan');

      // Create medical record
      const { error: rmError } = await supabase.from('rekam_medis').insert({
        antrian_id: antrian.id,
        pasien_id: antrian.pasien_id,
        dokter_id: antrian.dokter_id,
        tekanan_darah: formData.tekanan_darah || null,
        berat_badan: formData.berat_badan ? parseFloat(formData.berat_badan) : null,
        tinggi_badan: formData.tinggi_badan ? parseFloat(formData.tinggi_badan) : null,
        suhu_tubuh: formData.suhu_tubuh ? parseFloat(formData.suhu_tubuh) : null,
        diagnosa: formData.diagnosa || null,
        tindakan: formData.tindakan || null,
        resep: formData.resep || null,
        catatan: formData.catatan || null,
      });
      if (rmError) throw rmError;

      // Update queue status
      const { error: antrianError } = await supabase
        .from('antrian')
        .update({ status: 'selesai', waktu_selesai: new Date().toISOString() })
        .eq('id', antrian.id);
      if (antrianError) throw antrianError;

      // Generate invoice number
      const { data: invoiceNum } = await supabase.rpc('generate_invoice_number');

      // Create billing record
      const biayaKonsultasi = antrian.dokter?.biaya_konsultasi || 50000;
      const { error: billingError } = await supabase.from('billing').insert({
        antrian_id: antrian.id,
        pasien_id: antrian.pasien_id,
        no_invoice: invoiceNum || `INV-${Date.now()}`,
        biaya_konsultasi: biayaKonsultasi,
        biaya_tindakan: 0,
        biaya_obat: 0,
        total: biayaKonsultasi,
        status: 'pending',
      });
      if (billingError) throw billingError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['antrian'] });
      toast.success('Pemeriksaan selesai dan tagihan dibuat');
      navigate('/dokter/antrian');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

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

  if (!antrianId) {
    return (
      <DashboardLayout title="Periksa Pasien" subtitle="Pilih pasien dari antrian untuk diperiksa">
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mb-4 opacity-50" />
            <p>Pilih pasien dari halaman antrian untuk memulai pemeriksaan</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/dokter/antrian')}>
              Lihat Antrian
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Periksa Pasien">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!antrian) {
    return (
      <DashboardLayout title="Periksa Pasien">
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p>Data antrian tidak ditemukan</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/dokter/antrian')}>
              Kembali ke Antrian
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Periksa Pasien" subtitle={`Antrian #${antrian.no_antrian}`}>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate('/dokter/antrian')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">Form Pemeriksaan</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Patient Info */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Pasien
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nama</p>
              <p className="font-medium">{antrian.pasien?.nama}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">No. Rekam Medis</p>
              <Badge variant="outline">{antrian.pasien?.no_rm}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Jenis Kelamin</p>
                <p className="font-medium">{antrian.pasien?.jenis_kelamin || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Usia</p>
                <p className="font-medium">{calculateAge(antrian.pasien?.tanggal_lahir)}</p>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Keluhan</p>
              <p className="font-medium">{antrian.keluhan || 'Tidak ada keluhan tercatat'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Examination Form */}
        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Form Pemeriksaan</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate();
              }}
              className="space-y-6"
            >
              {/* Vital Signs */}
              <div>
                <h3 className="font-medium mb-4">Tanda Vital</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tekanan_darah">Tekanan Darah</Label>
                    <Input
                      id="tekanan_darah"
                      placeholder="120/80"
                      value={formData.tekanan_darah}
                      onChange={(e) => setFormData({ ...formData, tekanan_darah: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="berat_badan">Berat Badan (kg)</Label>
                    <Input
                      id="berat_badan"
                      type="number"
                      step="0.1"
                      placeholder="70"
                      value={formData.berat_badan}
                      onChange={(e) => setFormData({ ...formData, berat_badan: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tinggi_badan">Tinggi Badan (cm)</Label>
                    <Input
                      id="tinggi_badan"
                      type="number"
                      step="0.1"
                      placeholder="170"
                      value={formData.tinggi_badan}
                      onChange={(e) => setFormData({ ...formData, tinggi_badan: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="suhu_tubuh">Suhu Tubuh (°C)</Label>
                    <Input
                      id="suhu_tubuh"
                      type="number"
                      step="0.1"
                      placeholder="36.5"
                      value={formData.suhu_tubuh}
                      onChange={(e) => setFormData({ ...formData, suhu_tubuh: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Diagnosis */}
              <div className="space-y-2">
                <Label htmlFor="diagnosa">Diagnosa</Label>
                <Textarea
                  id="diagnosa"
                  placeholder="Tuliskan diagnosa pasien..."
                  rows={3}
                  value={formData.diagnosa}
                  onChange={(e) => setFormData({ ...formData, diagnosa: e.target.value })}
                />
              </div>

              {/* Treatment */}
              <div className="space-y-2">
                <Label htmlFor="tindakan">Tindakan</Label>
                <Textarea
                  id="tindakan"
                  placeholder="Tuliskan tindakan yang dilakukan..."
                  rows={2}
                  value={formData.tindakan}
                  onChange={(e) => setFormData({ ...formData, tindakan: e.target.value })}
                />
              </div>

              {/* Prescription */}
              <div className="space-y-2">
                <Label htmlFor="resep">Resep Obat</Label>
                <Textarea
                  id="resep"
                  placeholder="Tuliskan resep obat..."
                  rows={3}
                  value={formData.resep}
                  onChange={(e) => setFormData({ ...formData, resep: e.target.value })}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="catatan">Catatan Tambahan</Label>
                <Textarea
                  id="catatan"
                  placeholder="Catatan tambahan..."
                  rows={2}
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => navigate('/dokter/antrian')}>
                  Batal
                </Button>
                <Button type="submit" disabled={saveMutation.isPending} className="gap-2">
                  <Save className="h-4 w-4" />
                  Simpan & Selesai
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
