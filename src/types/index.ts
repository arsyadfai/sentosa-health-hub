export type UserRole = 'admin' | 'dokter' | 'kasir';

export type JenisKelamin = 'Laki-laki' | 'Perempuan';

export type StatusAntrian = 'Menunggu' | 'Diperiksa' | 'Menunggu Pembayaran' | 'Selesai' | 'Batal';

export type MetodePembayaran = 'Tunai' | 'Transfer' | 'QRIS';

export type StatusPembayaran = 'Belum Lunas' | 'Lunas';

export interface Pasien {
  id: string;
  nik: string;
  nama_lengkap: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: JenisKelamin;
  alamat: string;
  no_hp: string;
  created_at: string;
}

export interface Dokter {
  id: string;
  nama_dokter: string;
  spesialisasi: string;
  no_izin_praktek: string;
  jadwal_praktek: string;
}

export interface Antrian {
  id: string;
  nomor_antrian: string;
  pasien_id: string;
  dokter_id: string;
  tanggal_kunjungan: string;
  status: StatusAntrian;
  keluhan_awal: string;
  pasien?: Pasien;
  dokter?: Dokter;
}

export interface RekamMedis {
  id: string;
  antrian_id: string;
  tensi_darah: string;
  berat_badan: number;
  diagnosa: string;
  tindakan: string;
  resep_obat: string;
  catatan_dokter: string;
}

export interface Billing {
  id: string;
  antrian_id: string;
  biaya_konsultasi: number;
  biaya_tindakan: number;
  biaya_obat: number;
  total_tagihan: number;
  metode_pembayaran: MetodePembayaran;
  status_pembayaran: StatusPembayaran;
  waktu_bayar: string | null;
  antrian?: Antrian;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  nama: string;
}
