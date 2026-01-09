import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Receipt, Eye, History } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Billing {
  id: string;
  no_invoice: string;
  biaya_konsultasi: number;
  biaya_tindakan: number;
  biaya_obat: number;
  total: number;
  status: 'pending' | 'lunas' | 'batal';
  metode_pembayaran: string | null;
  tanggal_bayar: string | null;
  catatan: string | null;
  created_at: string;
  pasien?: { nama: string; no_rm: string };
}

export default function RiwayatTransaksiPage() {
  const [search, setSearch] = useState('');
  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null);

  const { data: billingList = [], isLoading } = useQuery({
    queryKey: ['billing-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('billing')
        .select(`
          *,
          pasien:pasien_id(nama, no_rm)
        `)
        .eq('status', 'lunas')
        .order('tanggal_bayar', { ascending: false })
        .limit(100);
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

  const getMetodeBadge = (metode: string | null) => {
    const labels: Record<string, string> = {
      tunai: 'Tunai',
      transfer: 'Transfer',
      kartu_debit: 'Kartu Debit',
      kartu_kredit: 'Kartu Kredit',
      bpjs: 'BPJS',
    };
    return <Badge variant="outline">{labels[metode || ''] || metode || '-'}</Badge>;
  };

  const filteredBilling = billingList.filter(
    (b) =>
      b.pasien?.nama.toLowerCase().includes(search.toLowerCase()) ||
      b.no_invoice.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Riwayat Transaksi" subtitle="Daftar transaksi yang sudah selesai">
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Riwayat Pembayaran</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari transaksi..."
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
          ) : filteredBilling.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mb-4 opacity-50" />
              <p>Belum ada riwayat transaksi</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Invoice</TableHead>
                  <TableHead>Pasien</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Tanggal Bayar</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBilling.map((billing) => (
                  <TableRow key={billing.id}>
                    <TableCell className="font-medium">{billing.no_invoice}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{billing.pasien?.nama}</p>
                        <p className="text-xs text-muted-foreground">{billing.pasien?.no_rm}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{formatCurrency(Number(billing.total))}</TableCell>
                    <TableCell>{getMetodeBadge(billing.metode_pembayaran)}</TableCell>
                    <TableCell>
                      {billing.tanggal_bayar
                        ? new Date(billing.tanggal_bayar).toLocaleDateString('id-ID', { dateStyle: 'medium' })
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedBilling(billing)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedBilling} onOpenChange={() => setSelectedBilling(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Detail Transaksi
            </DialogTitle>
          </DialogHeader>
          {selectedBilling && (
            <div className="space-y-4">
              <div className="text-center pb-4 border-b">
                <Badge variant="outline" className="text-lg px-4 py-1">{selectedBilling.no_invoice}</Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedBilling.tanggal_bayar
                    ? new Date(selectedBilling.tanggal_bayar).toLocaleDateString('id-ID', { dateStyle: 'full' })
                    : '-'}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Pasien</p>
                <p className="font-medium">{selectedBilling.pasien?.nama}</p>
                <p className="text-sm text-muted-foreground">{selectedBilling.pasien?.no_rm}</p>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Biaya Konsultasi</span>
                  <span>{formatCurrency(Number(selectedBilling.biaya_konsultasi))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Biaya Tindakan</span>
                  <span>{formatCurrency(Number(selectedBilling.biaya_tindakan))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Biaya Obat</span>
                  <span>{formatCurrency(Number(selectedBilling.biaya_obat))}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(Number(selectedBilling.total))}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Metode Pembayaran</span>
                  {getMetodeBadge(selectedBilling.metode_pembayaran)}
                </div>
              </div>

              {selectedBilling.catatan && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Catatan</p>
                  <p className="text-sm">{selectedBilling.catatan}</p>
                </div>
              )}

              <Badge className="w-full justify-center bg-success/10 text-success border-success/30" variant="outline">
                LUNAS
              </Badge>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
