import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Calendar, Users, CreditCard, Stethoscope } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function LaporanPage() {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: summary = { pasien: 0, antrian: 0, billing: 0, pendapatan: 0 } } = useQuery({
    queryKey: ['laporan-summary', startDate, endDate],
    queryFn: async () => {
      const [pasienRes, antrianRes, billingRes] = await Promise.all([
        supabase.from('pasien').select('id', { count: 'exact' }).gte('created_at', startDate).lte('created_at', endDate + 'T23:59:59'),
        supabase.from('antrian').select('id', { count: 'exact' }).gte('tanggal', startDate).lte('tanggal', endDate),
        supabase.from('billing').select('total, status').gte('created_at', startDate).lte('created_at', endDate + 'T23:59:59'),
      ]);

      const pendapatan = billingRes.data
        ?.filter((b) => b.status === 'lunas')
        .reduce((sum, b) => sum + (Number(b.total) || 0), 0) || 0;

      return {
        pasien: pasienRes.count || 0,
        antrian: antrianRes.count || 0,
        billing: billingRes.data?.length || 0,
        pendapatan,
      };
    },
  });

  const { data: antrianData = [] } = useQuery({
    queryKey: ['laporan-antrian', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('antrian')
        .select(`
          *,
          pasien:pasien_id(nama, no_rm),
          dokter:dokter_id(nama)
        `)
        .gte('tanggal', startDate)
        .lte('tanggal', endDate)
        .order('tanggal', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: billingData = [] } = useQuery({
    queryKey: ['laporan-billing', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('billing')
        .select(`
          *,
          pasien:pasien_id(nama, no_rm)
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate + 'T23:59:59')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      menunggu: 'bg-warning/10 text-warning border-warning/30',
      selesai: 'bg-success/10 text-success border-success/30',
      batal: 'bg-destructive/10 text-destructive border-destructive/30',
      pending: 'bg-warning/10 text-warning border-warning/30',
      lunas: 'bg-success/10 text-success border-success/30',
    };
    return <Badge variant="outline" className={variants[status] || ''}>{status}</Badge>;
  };

  return (
    <DashboardLayout title="Laporan" subtitle="Laporan dan statistik klinik">
      {/* Date Filter */}
      <Card className="mb-6 shadow-card">
        <CardContent className="pt-6">
          <div className="flex items-end gap-4">
            <div className="space-y-2">
              <Label>Tanggal Mulai</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tanggal Akhir</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pasien Baru</p>
                <p className="text-2xl font-bold">{summary.pasien}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info/10">
                <Calendar className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Kunjungan</p>
                <p className="text-2xl font-bold">{summary.antrian}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                <FileText className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Transaksi</p>
                <p className="text-2xl font-bold">{summary.billing}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <CreditCard className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pendapatan</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.pendapatan)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <Tabs defaultValue="kunjungan" className="space-y-4">
        <TabsList>
          <TabsTrigger value="kunjungan">Laporan Kunjungan</TabsTrigger>
          <TabsTrigger value="keuangan">Laporan Keuangan</TabsTrigger>
        </TabsList>

        <TabsContent value="kunjungan">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Data Kunjungan</CardTitle>
            </CardHeader>
            <CardContent>
              {antrianData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Stethoscope className="h-12 w-12 mb-4 opacity-50" />
                  <p>Tidak ada data kunjungan</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>No. Antrian</TableHead>
                      <TableHead>Pasien</TableHead>
                      <TableHead>Dokter</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {antrianData.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>{new Date(item.tanggal).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell>{item.no_antrian}</TableCell>
                        <TableCell>{item.pasien?.nama}</TableCell>
                        <TableCell>{item.dokter?.nama}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keuangan">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Data Transaksi</CardTitle>
            </CardHeader>
            <CardContent>
              {billingData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mb-4 opacity-50" />
                  <p>Tidak ada data transaksi</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. Invoice</TableHead>
                      <TableHead>Pasien</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingData.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.no_invoice}</TableCell>
                        <TableCell>{item.pasien?.nama}</TableCell>
                        <TableCell>{formatCurrency(Number(item.total))}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>{new Date(item.created_at).toLocaleDateString('id-ID')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
