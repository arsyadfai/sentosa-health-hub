import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditCard, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface Billing {
  id: string;
  no_invoice: string;
  biaya_konsultasi: number;
  biaya_tindakan: number;
  biaya_obat: number;
  total: number;
  status: 'pending' | 'lunas' | 'batal';
  created_at: string;
  pasien?: { nama: string; no_rm: string };
  antrian?: { no_antrian: number };
}

export default function TagihanPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: tagihanList = [], isLoading } = useQuery({
    queryKey: ['tagihan-pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('billing')
        .select(`
          *,
          pasien:pasien_id(nama, no_rm),
          antrian:antrian_id(no_antrian)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Billing[];
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredTagihan = tagihanList.filter(
    (t) =>
      t.pasien?.nama.toLowerCase().includes(search.toLowerCase()) ||
      t.no_invoice.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Tagihan" subtitle="Daftar tagihan yang belum dibayar">
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Tagihan Pending</CardTitle>
            <p className="text-sm text-muted-foreground">{filteredTagihan.length} tagihan menunggu pembayaran</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari tagihan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredTagihan.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CreditCard className="h-12 w-12 mb-4 opacity-50" />
              <p>Tidak ada tagihan pending</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTagihan.map((tagihan) => (
                <div
                  key={tagihan.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-4 transition-all hover:shadow-card-hover"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">
                      {tagihan.antrian?.no_antrian || '-'}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{tagihan.pasien?.nama}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{tagihan.no_invoice}</Badge>
                        <span className="text-xs text-muted-foreground">{tagihan.pasien?.no_rm}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Tagihan</p>
                      <p className="text-xl font-bold text-foreground">{formatCurrency(Number(tagihan.total))}</p>
                    </div>
                    <Button onClick={() => navigate(`/kasir/bayar?billing_id=${tagihan.id}`)}>
                      Proses Bayar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
