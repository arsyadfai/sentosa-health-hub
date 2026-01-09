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
import { Plus, Search, Edit, Trash2, User } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Pasien {
  id: string;
  no_rm: string;
  nama: string;
  nik: string | null;
  tanggal_lahir: string | null;
  jenis_kelamin: string | null;
  alamat: string | null;
  no_telepon: string | null;
  created_at: string;
}

export default function PasienPage() {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editingPasien, setEditingPasien] = useState<Pasien | null>(null);
  const queryClient = useQueryClient();

  const { data: pasienList = [], isLoading } = useQuery({
    queryKey: ['pasien'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pasien')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Pasien[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newPasien: Omit<Pasien, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('pasien').insert(newPasien).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pasien'] });
      toast.success('Pasien berhasil ditambahkan');
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Pasien> & { id: string }) => {
      const { error } = await supabase.from('pasien').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pasien'] });
      toast.success('Data pasien berhasil diperbarui');
      setIsOpen(false);
      setEditingPasien(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pasien').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pasien'] });
      toast.success('Pasien berhasil dihapus');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      no_rm: formData.get('no_rm') as string,
      nama: formData.get('nama') as string,
      nik: formData.get('nik') as string || null,
      tanggal_lahir: formData.get('tanggal_lahir') as string || null,
      jenis_kelamin: formData.get('jenis_kelamin') as string || null,
      alamat: formData.get('alamat') as string || null,
      no_telepon: formData.get('no_telepon') as string || null,
    };

    if (editingPasien) {
      updateMutation.mutate({ id: editingPasien.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredPasien = pasienList.filter(
    (p) =>
      p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.no_rm.toLowerCase().includes(search.toLowerCase())
  );

  const generateNoRM = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RM${year}${month}${random}`;
  };

  return (
    <DashboardLayout title="Kelola Pasien" subtitle="Manajemen data pasien klinik">
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Daftar Pasien</CardTitle>
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
            <Dialog open={isOpen} onOpenChange={(open) => {
              setIsOpen(open);
              if (!open) setEditingPasien(null);
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Tambah Pasien
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingPasien ? 'Edit Pasien' : 'Tambah Pasien Baru'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="no_rm">No. Rekam Medis</Label>
                      <Input
                        id="no_rm"
                        name="no_rm"
                        defaultValue={editingPasien?.no_rm || generateNoRM()}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nama">Nama Lengkap</Label>
                      <Input
                        id="nama"
                        name="nama"
                        defaultValue={editingPasien?.nama}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nik">NIK</Label>
                      <Input
                        id="nik"
                        name="nik"
                        maxLength={16}
                        defaultValue={editingPasien?.nik || ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                      <Input
                        id="tanggal_lahir"
                        name="tanggal_lahir"
                        type="date"
                        defaultValue={editingPasien?.tanggal_lahir || ''}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
                      <Select name="jenis_kelamin" defaultValue={editingPasien?.jenis_kelamin || ''}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis kelamin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                          <SelectItem value="Perempuan">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="no_telepon">No. Telepon</Label>
                      <Input
                        id="no_telepon"
                        name="no_telepon"
                        defaultValue={editingPasien?.no_telepon || ''}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alamat">Alamat</Label>
                    <Textarea
                      id="alamat"
                      name="alamat"
                      defaultValue={editingPasien?.alamat || ''}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingPasien ? 'Simpan Perubahan' : 'Tambah Pasien'}
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
          ) : filteredPasien.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <User className="h-12 w-12 mb-4 opacity-50" />
              <p>Belum ada data pasien</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. RM</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Jenis Kelamin</TableHead>
                  <TableHead>Tanggal Lahir</TableHead>
                  <TableHead>No. Telepon</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPasien.map((pasien) => (
                  <TableRow key={pasien.id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline">{pasien.no_rm}</Badge>
                    </TableCell>
                    <TableCell>{pasien.nama}</TableCell>
                    <TableCell>{pasien.jenis_kelamin || '-'}</TableCell>
                    <TableCell>
                      {pasien.tanggal_lahir
                        ? new Date(pasien.tanggal_lahir).toLocaleDateString('id-ID')
                        : '-'}
                    </TableCell>
                    <TableCell>{pasien.no_telepon || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingPasien(pasien);
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
                            if (confirm('Yakin ingin menghapus pasien ini?')) {
                              deleteMutation.mutate(pasien.id);
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
