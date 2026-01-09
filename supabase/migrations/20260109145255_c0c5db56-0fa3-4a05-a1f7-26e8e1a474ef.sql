-- Create table for patients (pasien)
CREATE TABLE public.pasien (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    no_rm VARCHAR(20) NOT NULL UNIQUE,
    nama VARCHAR(100) NOT NULL,
    nik VARCHAR(16),
    tanggal_lahir DATE,
    jenis_kelamin VARCHAR(10),
    alamat TEXT,
    no_telepon VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for doctors (dokter)
CREATE TABLE public.dokter (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    nama VARCHAR(100) NOT NULL,
    spesialisasi VARCHAR(100),
    no_sip VARCHAR(50),
    no_telepon VARCHAR(20),
    jadwal_praktek TEXT,
    biaya_konsultasi DECIMAL(12,2) DEFAULT 50000,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create enum for queue status
CREATE TYPE public.status_antrian AS ENUM ('menunggu', 'dipanggil', 'diperiksa', 'selesai', 'batal');

-- Create table for queue (antrian)
CREATE TABLE public.antrian (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    no_antrian INT NOT NULL,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    pasien_id UUID REFERENCES public.pasien(id) ON DELETE CASCADE NOT NULL,
    dokter_id UUID REFERENCES public.dokter(id) ON DELETE CASCADE NOT NULL,
    keluhan TEXT,
    status status_antrian NOT NULL DEFAULT 'menunggu',
    waktu_daftar TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    waktu_panggil TIMESTAMP WITH TIME ZONE,
    waktu_selesai TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(tanggal, no_antrian, dokter_id)
);

-- Create table for medical records (rekam_medis)
CREATE TABLE public.rekam_medis (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    antrian_id UUID REFERENCES public.antrian(id) ON DELETE CASCADE NOT NULL,
    pasien_id UUID REFERENCES public.pasien(id) ON DELETE CASCADE NOT NULL,
    dokter_id UUID REFERENCES public.dokter(id) ON DELETE CASCADE NOT NULL,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    tekanan_darah VARCHAR(20),
    berat_badan DECIMAL(5,2),
    tinggi_badan DECIMAL(5,2),
    suhu_tubuh DECIMAL(4,1),
    diagnosa TEXT,
    tindakan TEXT,
    resep TEXT,
    catatan TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create enum for payment status
CREATE TYPE public.status_pembayaran AS ENUM ('pending', 'lunas', 'batal');

-- Create enum for payment method
CREATE TYPE public.metode_pembayaran AS ENUM ('tunai', 'transfer', 'kartu_debit', 'kartu_kredit', 'bpjs');

-- Create table for billing
CREATE TABLE public.billing (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    antrian_id UUID REFERENCES public.antrian(id) ON DELETE CASCADE NOT NULL,
    pasien_id UUID REFERENCES public.pasien(id) ON DELETE CASCADE NOT NULL,
    no_invoice VARCHAR(30) NOT NULL UNIQUE,
    biaya_konsultasi DECIMAL(12,2) NOT NULL DEFAULT 0,
    biaya_tindakan DECIMAL(12,2) NOT NULL DEFAULT 0,
    biaya_obat DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    status status_pembayaran NOT NULL DEFAULT 'pending',
    metode_pembayaran metode_pembayaran,
    tanggal_bayar TIMESTAMP WITH TIME ZONE,
    kasir_id UUID,
    catatan TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.pasien ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dokter ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.antrian ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rekam_medis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pasien table
CREATE POLICY "Admin can manage all patients" ON public.pasien
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Dokter can view patients" ON public.pasien
    FOR SELECT USING (public.has_role(auth.uid(), 'dokter'));

CREATE POLICY "Kasir can view patients" ON public.pasien
    FOR SELECT USING (public.has_role(auth.uid(), 'kasir'));

-- RLS Policies for dokter table
CREATE POLICY "Admin can manage all doctors" ON public.dokter
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Dokter can view doctors" ON public.dokter
    FOR SELECT USING (public.has_role(auth.uid(), 'dokter'));

CREATE POLICY "Kasir can view doctors" ON public.dokter
    FOR SELECT USING (public.has_role(auth.uid(), 'kasir'));

-- RLS Policies for antrian table
CREATE POLICY "Admin can manage all queues" ON public.antrian
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Dokter can view and update queues" ON public.antrian
    FOR ALL USING (public.has_role(auth.uid(), 'dokter'));

CREATE POLICY "Kasir can view queues" ON public.antrian
    FOR SELECT USING (public.has_role(auth.uid(), 'kasir'));

-- RLS Policies for rekam_medis table
CREATE POLICY "Admin can view medical records" ON public.rekam_medis
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Dokter can manage medical records" ON public.rekam_medis
    FOR ALL USING (public.has_role(auth.uid(), 'dokter'));

CREATE POLICY "Kasir can view medical records" ON public.rekam_medis
    FOR SELECT USING (public.has_role(auth.uid(), 'kasir'));

-- RLS Policies for billing table
CREATE POLICY "Admin can manage all billing" ON public.billing
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Dokter can view billing" ON public.billing
    FOR SELECT USING (public.has_role(auth.uid(), 'dokter'));

CREATE POLICY "Kasir can manage billing" ON public.billing
    FOR ALL USING (public.has_role(auth.uid(), 'kasir'));

-- Create triggers for updated_at
CREATE TRIGGER update_pasien_updated_at
    BEFORE UPDATE ON public.pasien
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dokter_updated_at
    BEFORE UPDATE ON public.dokter
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_antrian_updated_at
    BEFORE UPDATE ON public.antrian
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rekam_medis_updated_at
    BEFORE UPDATE ON public.rekam_medis
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_billing_updated_at
    BEFORE UPDATE ON public.billing
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate next queue number
CREATE OR REPLACE FUNCTION public.get_next_antrian_number(p_tanggal DATE, p_dokter_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    next_number INT;
BEGIN
    SELECT COALESCE(MAX(no_antrian), 0) + 1
    INTO next_number
    FROM public.antrian
    WHERE tanggal = p_tanggal AND dokter_id = p_dokter_id;
    
    RETURN next_number;
END;
$$;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS VARCHAR(30)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    invoice_number VARCHAR(30);
    today_count INT;
BEGIN
    SELECT COUNT(*) + 1 INTO today_count
    FROM public.billing
    WHERE DATE(created_at) = CURRENT_DATE;
    
    invoice_number := 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(today_count::TEXT, 4, '0');
    
    RETURN invoice_number;
END;
$$;