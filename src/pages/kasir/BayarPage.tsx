import { useSearchParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, CreditCard, Receipt, CheckCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function BayarPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const billingId = searchParams.get('billing_id');
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    metode_pembayaran: '',
    catatan: '',
    biaya_tindakan: '',
    biaya_obat: '',
  });

  const { data: billing, isLoading } = useQuery({
    queryKey: ['billing-detail', billingId],
    queryFn: async () => {
      if (!billingId) return null;
      const { data, error } = await supabase
        .from('billing')
        .select(`
          *,
          pasien:pasien_id(*),
          antrian:antrian_id(no_antrian, keluhan, dokter:dokter_id(nama))
        `)
        .eq('id', billingId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!billingId,
  });

  const payMutation = useMutation({
    mutationFn: async () => {
      if (!billing) throw new Error('Data tagihan tidak ditemukan');

      const biayaTindakan = parseFloat(formData.biaya_tindakan) || 0;
      const biayaObat = parseFloat(formData.biaya_obat) || 0;
      const total = Number(billing.biaya_konsultasi) + biayaTindakan + biayaObat;

      const { error } = await supabase
        .from('billing')
        .update({
          biaya_tindakan: biayaTindakan,
          biaya_obat: biayaObat,
          total,
          status: 'lunas',
          metode_pembayaran: formData.metode_pembayaran as any,
          tanggal_bayar: new Date().toISOString(),
          kasir_id: user?.id,
          catatan: formData.catatan || null,
        })
        .eq('id', billing.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing'] });
      queryClient.invalidateQueries({ queryKey: ['tagihan'] });
      toast.success('Pembayaran berhasil!');
      navigate('/kasir/tagihan');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTotal = () => {
    if (!billing) return 0;
    const biayaTindakan = parseFloat(formData.biaya_tindakan) || 0;
    const biayaObat = parseFloat(formData.biaya_obat) || 0;
    return Number(billing.biaya_konsultasi) + biayaTindakan + biayaObat;
  };

  if (!billingId) {
    return (
      <DashboardLayout title="Pembayaran" subtitle="Proses pembayaran pasien">
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Receipt className="h-12 w-12 mb-4 opacity-50" />
            <p>Pilih tagihan dari halaman Tagihan untuk memproses pembayaran</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/kasir/tagihan')}>
              Lihat Tagihan
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Pembayaran">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!billing) {
    return (
      <DashboardLayout title="Pembayaran">
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p>Data tagihan tidak ditemukan</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/kasir/tagihan')}>
              Kembali
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Proses Pembayaran" subtitle={billing.no_invoice}>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate('/kasir/tagihan')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">Form Pembayaran</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Patient & Invoice Info */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Informasi Tagihan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">No. Invoice</p>
              <Badge variant="outline" className="mt-1">{billing.no_invoice}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pasien</p>
              <p className="font-medium">{billing.pasien?.nama}</p>
              <p className="text-sm text-muted-foreground">{billing.pasien?.no_rm}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">No. Antrian</p>
              <p className="font-medium">{billing.antrian?.no_antrian}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dokter</p>
              <p className="font-medium">{billing.antrian?.dokter?.nama}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Keluhan</p>
              <p className="text-sm">{billing.antrian?.keluhan || '-'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Rincian Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!formData.metode_pembayaran) {
                  toast.error('Pilih metode pembayaran');
                  return;
                }
                payMutation.mutate();
              }}
              className="space-y-6"
            >
              {/* Cost Details */}
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>Biaya Konsultasi</span>
                  <span className="font-medium">{formatCurrency(Number(billing.biaya_konsultasi))}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="biaya_tindakan">Biaya Tindakan</Label>
                    <Input
                      id="biaya_tindakan"
                      type="number"
                      placeholder="0"
                      value={formData.biaya_tindakan}
                      onChange={(e) => setFormData({ ...formData, biaya_tindakan: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="biaya_obat">Biaya Obat</Label>
                    <Input
                      id="biaya_obat"
                      type="number"
                      placeholder="0"
                      value={formData.biaya_obat}
                      onChange={(e) => setFormData({ ...formData, biaya_obat: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
                <span className="font-semibold text-lg">Total Pembayaran</span>
                <span className="font-bold text-2xl text-primary">{formatCurrency(calculateTotal())}</span>
              </div>

              <Separator />

              {/* Payment Method */}
              <div className="space-y-2">
                <Label htmlFor="metode_pembayaran">Metode Pembayaran</Label>
                <Select
                  value={formData.metode_pembayaran}
                  onValueChange={(value) => setFormData({ ...formData, metode_pembayaran: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih metode pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tunai">Tunai</SelectItem>
                    <SelectItem value="transfer">Transfer Bank</SelectItem>
                    <SelectItem value="kartu_debit">Kartu Debit</SelectItem>
                    <SelectItem value="kartu_kredit">Kartu Kredit</SelectItem>
                    <SelectItem value="bpjs">BPJS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="catatan">Catatan (Opsional)</Label>
                <Textarea
                  id="catatan"
                  placeholder="Catatan tambahan..."
                  rows={2}
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => navigate('/kasir/tagihan')}>
                  Batal
                </Button>
                <Button type="submit" disabled={payMutation.isPending} className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Konfirmasi Pembayaran
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
