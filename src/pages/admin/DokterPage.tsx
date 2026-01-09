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
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Edit, Trash2, Stethoscope } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Dokter {
  id: string;
  user_id: string | null;
  nama: string;
  spesialisasi: string | null;
  no_sip: string | null;
  no_telepon: string | null;
  jadwal_praktek: string | null;
  biaya_konsultasi: number | null;
  created_at: string;
}

export default function DokterPage() {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editingDokter, setEditingDokter] = useState<Dokter | null>(null);
  const queryClient = useQueryClient();

  const { data: dokterList = [], isLoading } = useQuery({
    queryKey: ['dokter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dokter')
        .select('*')
        .order('nama', { ascending: true });
      if (error) throw error;
      return data as Dokter[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newDokter: Omit<Dokter, 'id' | 'created_at' | 'user_id'>) => {
      const { data, error } = await supabase.from('dokter').insert(newDokter).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dokter'] });
      toast.success('Dokter berhasil ditambahkan');
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Dokter> & { id: string }) => {
      const { error } = await supabase.from('dokter').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dokter'] });
      toast.success('Data dokter berhasil diperbarui');
      setIsOpen(false);
      setEditingDokter(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('dokter').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dokter'] });
      toast.success('Dokter berhasil dihapus');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      nama: formData.get('nama') as string,
      spesialisasi: formData.get('spesialisasi') as string || null,
      no_sip: formData.get('no_sip') as string || null,
      no_telepon: formData.get('no_telepon') as string || null,
      jadwal_praktek: formData.get('jadwal_praktek') as string || null,
      biaya_konsultasi: parseFloat(formData.get('biaya_konsultasi') as string) || 50000,
    };

    if (editingDokter) {
      updateMutation.mutate({ id: editingDokter.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredDokter = dokterList.filter(
    (d) =>
      d.nama.toLowerCase().includes(search.toLowerCase()) ||
      d.spesialisasi?.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'Rp 50.000';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout title="Kelola Dokter" subtitle="Manajemen data dokter klinik">
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Daftar Dokter</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari dokter..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Dialog open={isOpen} onOpenChange={(open) => {
              setIsOpen(open);
              if (!open) setEditingDokter(null);
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Tambah Dokter
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingDokter ? 'Edit Dokter' : 'Tambah Dokter Baru'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nama">Nama Dokter</Label>
                      <Input
                        id="nama"
                        name="nama"
                        defaultValue={editingDokter?.nama}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="spesialisasi">Spesialisasi</Label>
                      <Input
                        id="spesialisasi"
                        name="spesialisasi"
                        placeholder="Umum, Anak, dll"
                        defaultValue={editingDokter?.spesialisasi || ''}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="no_sip">No. SIP</Label>
                      <Input
                        id="no_sip"
                        name="no_sip"
                        defaultValue={editingDokter?.no_sip || ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="no_telepon">No. Telepon</Label>
                      <Input
                        id="no_telepon"
                        name="no_telepon"
                        defaultValue={editingDokter?.no_telepon || ''}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="biaya_konsultasi">Biaya Konsultasi</Label>
                    <Input
                      id="biaya_konsultasi"
                      name="biaya_konsultasi"
                      type="number"
                      defaultValue={editingDokter?.biaya_konsultasi || 50000}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jadwal_praktek">Jadwal Praktek</Label>
                    <Textarea
                      id="jadwal_praktek"
                      name="jadwal_praktek"
                      placeholder="Senin-Jumat: 08:00-16:00"
                      defaultValue={editingDokter?.jadwal_praktek || ''}
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingDokter ? 'Simpan Perubahan' : 'Tambah Dokter'}
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
          ) : filteredDokter.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Stethoscope className="h-12 w-12 mb-4 opacity-50" />
              <p>Belum ada data dokter</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Spesialisasi</TableHead>
                  <TableHead>No. SIP</TableHead>
                  <TableHead>No. Telepon</TableHead>
                  <TableHead>Biaya Konsultasi</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDokter.map((dokter) => (
                  <TableRow key={dokter.id}>
                    <TableCell className="font-medium">{dokter.nama}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{dokter.spesialisasi || 'Umum'}</Badge>
                    </TableCell>
                    <TableCell>{dokter.no_sip || '-'}</TableCell>
                    <TableCell>{dokter.no_telepon || '-'}</TableCell>
                    <TableCell>{formatCurrency(dokter.biaya_konsultasi)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingDokter(dokter);
                            setIsOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm('Yakin ingin menghapus dokter ini?')) {
                              deleteMutation.mutate(dokter.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
