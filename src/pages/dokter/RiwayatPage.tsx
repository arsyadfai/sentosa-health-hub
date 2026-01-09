import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
import { Search, FileText, Eye, History } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RekamMedis {
  id: string;
  tanggal: string;
  tekanan_darah: string | null;
  berat_badan: number | null;
  tinggi_badan: number | null;
  suhu_tubuh: number | null;
  diagnosa: string | null;
  tindakan: string | null;
  resep: string | null;
  catatan: string | null;
  pasien?: { nama: string; no_rm: string };
  dokter?: { nama: string };
}

export default function RiwayatPage() {
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<RekamMedis | null>(null);

  const { data: rekamMedisList = [], isLoading } = useQuery({
    queryKey: ['rekam-medis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rekam_medis')
        .select(`
          *,
          pasien:pasien_id(nama, no_rm),
          dokter:dokter_id(nama)
        `)
        .order('tanggal', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as RekamMedis[];
    },
  });

  const filteredRecords = rekamMedisList.filter(
    (r) =>
      r.pasien?.nama.toLowerCase().includes(search.toLowerCase()) ||
      r.pasien?.no_rm.toLowerCase().includes(search.toLowerCase()) ||
      r.diagnosa?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Riwayat Pasien" subtitle="Rekam medis pasien">
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Riwayat Rekam Medis</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari pasien atau diagnosa..."
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
          ) : filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mb-4 opacity-50" />
              <p>Belum ada riwayat rekam medis</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Pasien</TableHead>
                  <TableHead>Diagnosa</TableHead>
                  <TableHead>Dokter</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {new Date(record.tanggal).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{record.pasien?.nama}</p>
                        <p className="text-xs text-muted-foreground">{record.pasien?.no_rm}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {record.diagnosa || '-'}
                    </TableCell>
                    <TableCell>{record.dokter?.nama}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedRecord(record)}
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
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detail Rekam Medis
            </DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-6">
              {/* Patient & Date Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Pasien</p>
                  <p className="font-medium">{selectedRecord.pasien?.nama}</p>
                  <Badge variant="outline" className="mt-1">{selectedRecord.pasien?.no_rm}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal Pemeriksaan</p>
                  <p className="font-medium">
                    {new Date(selectedRecord.tanggal).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Dokter: {selectedRecord.dokter?.nama}</p>
                </div>
              </div>

              <Separator />

              {/* Vital Signs */}
              <div>
                <h4 className="font-medium mb-3">Tanda Vital</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Tekanan Darah</p>
                    <p className="font-medium">{selectedRecord.tekanan_darah || '-'}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Berat Badan</p>
                    <p className="font-medium">{selectedRecord.berat_badan ? `${selectedRecord.berat_badan} kg` : '-'}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Tinggi Badan</p>
                    <p className="font-medium">{selectedRecord.tinggi_badan ? `${selectedRecord.tinggi_badan} cm` : '-'}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Suhu Tubuh</p>
                    <p className="font-medium">{selectedRecord.suhu_tubuh ? `${selectedRecord.suhu_tubuh}°C` : '-'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Diagnosis & Treatment */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Diagnosa</p>
                  <p className="font-medium">{selectedRecord.diagnosa || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tindakan</p>
                  <p className="font-medium">{selectedRecord.tindakan || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Resep Obat</p>
                  <p className="font-medium whitespace-pre-wrap">{selectedRecord.resep || '-'}</p>
                </div>
                {selectedRecord.catatan && (
                  <div>
                    <p className="text-sm text-muted-foreground">Catatan</p>
                    <p className="font-medium">{selectedRecord.catatan}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
