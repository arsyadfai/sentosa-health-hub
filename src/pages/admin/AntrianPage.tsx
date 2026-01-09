import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, ClipboardList, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Antrian {
  id: string;
  no_antrian: number;
  tanggal: string;
  pasien_id: string;
  dokter_id: string;
  keluhan: string | null;
  status: 'menunggu' | 'dipanggil' | 'diperiksa' | 'selesai' | 'batal';
  waktu_daftar: string;
  pasien?: { nama: string; no_rm: string };
  dokter?: { nama: string; spesialisasi: string | null };
}

interface Pasien {
  id: string;
  nama: string;
  no_rm: string;
}

interface Dokter {
  id: string;
  nama: string;
  spesialisasi: string | null;
}

export default function AntrianPage() {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: antrianList = [], isLoading } = useQuery({
    queryKey: ['antrian', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('antrian')
        .select(`
          *,
          pasien:pasien_id(nama, no_rm),
          dokter:dokter_id(nama, spesialisasi)
        `)
        .eq('tanggal', today)
        .order('no_antrian', { ascending: true });
      if (error) throw error;
      return data as Antrian[];
    },
  });

  const { data: pasienList = [] } = useQuery({
    queryKey: ['pasien-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pasien').select('id, nama, no_rm').order('nama');
      if (error) throw error;
      return data as Pasien[];
    },
  });

  const { data: dokterList = [] } = useQuery({
    queryKey: ['dokter-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('dokter').select('id, nama, spesialisasi').order('nama');
      if (error) throw error;
      return data as Dokter[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newAntrian: { pasien_id: string; dokter_id: string; keluhan: string }) => {
      // Get next queue number
      const { data: nextNum } = await supabase.rpc('get_next_antrian_number', {
        p_tanggal: today,
        p_dokter_id: newAntrian.dokter_id,
      });

      const { data, error } = await supabase
        .from('antrian')
        .insert({
          ...newAntrian,
          no_antrian: nextNum || 1,
          tanggal: today,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['antrian'] });
      toast.success('Antrian berhasil didaftarkan');
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: Record<string, unknown> = { status };
      if (status === 'dipanggil') updates.waktu_panggil = new Date().toISOString();
      if (status === 'selesai') updates.waktu_selesai = new Date().toISOString();

      const { error } = await supabase.from('antrian').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['antrian'] });
      toast.success('Status antrian diperbarui');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      pasien_id: formData.get('pasien_id') as string,
      dokter_id: formData.get('dokter_id') as string,
      keluhan: formData.get('keluhan') as string,
    });
  };

  const getStatusBadge = (status: Antrian['status']) => {
    const variants: Record<Antrian['status'], { className: string; label: string }> = {
      menunggu: { className: 'bg-warning/10 text-warning border-warning/30', label: 'Menunggu' },
      dipanggil: { className: 'bg-info/10 text-info border-info/30', label: 'Dipanggil' },
      diperiksa: { className: 'bg-primary/10 text-primary border-primary/30', label: 'Diperiksa' },
      selesai: { className: 'bg-success/10 text-success border-success/30', label: 'Selesai' },
      batal: { className: 'bg-destructive/10 text-destructive border-destructive/30', label: 'Batal' },
    };
    const { className, label } = variants[status];
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const filteredAntrian = antrianList.filter(
    (a) =>
      a.pasien?.nama.toLowerCase().includes(search.toLowerCase()) ||
      a.pasien?.no_rm.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Daftar Antrian" subtitle={`Antrian hari ini - ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}`}>
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Antrian Pasien</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari pasien..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Daftarkan Pasien
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Daftarkan Antrian Baru</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pasien_id">Pilih Pasien</Label>
                    <Select name="pasien_id" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Cari pasien..." />
                      </SelectTrigger>
                      <SelectContent>
                        {pasienList.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.no_rm} - {p.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dokter_id">Pilih Dokter</Label>
                    <Select name="dokter_id" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih dokter..." />
                      </SelectTrigger>
                      <SelectContent>
                        {dokterList.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.nama} - {d.spesialisasi || 'Umum'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="keluhan">Keluhan</Label>
                    <Textarea
                      id="keluhan"
                      name="keluhan"
                      placeholder="Tuliskan keluhan pasien..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      Daftarkan
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredAntrian.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mb-4 opacity-50" />
              <p>Belum ada antrian hari ini</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">No</TableHead>
                  <TableHead>Pasien</TableHead>
                  <TableHead>Dokter</TableHead>
                  <TableHead>Keluhan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAntrian.map((antrian) => (
                  <TableRow key={antrian.id}>
                    <TableCell>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">
                        {antrian.no_antrian}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{antrian.pasien?.nama}</p>
                        <p className="text-xs text-muted-foreground">{antrian.pasien?.no_rm}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{antrian.dokter?.nama}</p>
                        <p className="text-xs text-muted-foreground">{antrian.dokter?.spesialisasi || 'Umum'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{antrian.keluhan || '-'}</TableCell>
                    <TableCell>{getStatusBadge(antrian.status)}</TableCell>
                    <TableCell className="text-right">
                      {antrian.status === 'menunggu' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          onClick={() => updateStatusMutation.mutate({ id: antrian.id, status: 'batal' })}
                        >
                          <X className="h-4 w-4 mr-1" /> Batalkan
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
