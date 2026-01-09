export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      antrian: {
        Row: {
          created_at: string
          dokter_id: string
          id: string
          keluhan: string | null
          no_antrian: number
          pasien_id: string
          status: Database["public"]["Enums"]["status_antrian"]
          tanggal: string
          updated_at: string
          waktu_daftar: string
          waktu_panggil: string | null
          waktu_selesai: string | null
        }
        Insert: {
          created_at?: string
          dokter_id: string
          id?: string
          keluhan?: string | null
          no_antrian: number
          pasien_id: string
          status?: Database["public"]["Enums"]["status_antrian"]
          tanggal?: string
          updated_at?: string
          waktu_daftar?: string
          waktu_panggil?: string | null
          waktu_selesai?: string | null
        }
        Update: {
          created_at?: string
          dokter_id?: string
          id?: string
          keluhan?: string | null
          no_antrian?: number
          pasien_id?: string
          status?: Database["public"]["Enums"]["status_antrian"]
          tanggal?: string
          updated_at?: string
          waktu_daftar?: string
          waktu_panggil?: string | null
          waktu_selesai?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "antrian_dokter_id_fkey"
            columns: ["dokter_id"]
            isOneToOne: false
            referencedRelation: "dokter"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "antrian_pasien_id_fkey"
            columns: ["pasien_id"]
            isOneToOne: false
            referencedRelation: "pasien"
            referencedColumns: ["id"]
          },
        ]
      }
      billing: {
        Row: {
          antrian_id: string
          biaya_konsultasi: number
          biaya_obat: number
          biaya_tindakan: number
          catatan: string | null
          created_at: string
          id: string
          kasir_id: string | null
          metode_pembayaran:
            | Database["public"]["Enums"]["metode_pembayaran"]
            | null
          no_invoice: string
          pasien_id: string
          status: Database["public"]["Enums"]["status_pembayaran"]
          tanggal_bayar: string | null
          total: number
          updated_at: string
        }
        Insert: {
          antrian_id: string
          biaya_konsultasi?: number
          biaya_obat?: number
          biaya_tindakan?: number
          catatan?: string | null
          created_at?: string
          id?: string
          kasir_id?: string | null
          metode_pembayaran?:
            | Database["public"]["Enums"]["metode_pembayaran"]
            | null
          no_invoice: string
          pasien_id: string
          status?: Database["public"]["Enums"]["status_pembayaran"]
          tanggal_bayar?: string | null
          total?: number
          updated_at?: string
        }
        Update: {
          antrian_id?: string
          biaya_konsultasi?: number
          biaya_obat?: number
          biaya_tindakan?: number
          catatan?: string | null
          created_at?: string
          id?: string
          kasir_id?: string | null
          metode_pembayaran?:
            | Database["public"]["Enums"]["metode_pembayaran"]
            | null
          no_invoice?: string
          pasien_id?: string
          status?: Database["public"]["Enums"]["status_pembayaran"]
          tanggal_bayar?: string | null
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_antrian_id_fkey"
            columns: ["antrian_id"]
            isOneToOne: false
            referencedRelation: "antrian"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_pasien_id_fkey"
            columns: ["pasien_id"]
            isOneToOne: false
            referencedRelation: "pasien"
            referencedColumns: ["id"]
          },
        ]
      }
      dokter: {
        Row: {
          biaya_konsultasi: number | null
          created_at: string
          id: string
          jadwal_praktek: string | null
          nama: string
          no_sip: string | null
          no_telepon: string | null
          spesialisasi: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          biaya_konsultasi?: number | null
          created_at?: string
          id?: string
          jadwal_praktek?: string | null
          nama: string
          no_sip?: string | null
          no_telepon?: string | null
          spesialisasi?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          biaya_konsultasi?: number | null
          created_at?: string
          id?: string
          jadwal_praktek?: string | null
          nama?: string
          no_sip?: string | null
          no_telepon?: string | null
          spesialisasi?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pasien: {
        Row: {
          alamat: string | null
          created_at: string
          id: string
          jenis_kelamin: string | null
          nama: string
          nik: string | null
          no_rm: string
          no_telepon: string | null
          tanggal_lahir: string | null
          updated_at: string
        }
        Insert: {
          alamat?: string | null
          created_at?: string
          id?: string
          jenis_kelamin?: string | null
          nama: string
          nik?: string | null
          no_rm: string
          no_telepon?: string | null
          tanggal_lahir?: string | null
          updated_at?: string
        }
        Update: {
          alamat?: string | null
          created_at?: string
          id?: string
          jenis_kelamin?: string | null
          nama?: string
          nik?: string | null
          no_rm?: string
          no_telepon?: string | null
          tanggal_lahir?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          nama: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nama: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nama?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rekam_medis: {
        Row: {
          antrian_id: string
          berat_badan: number | null
          catatan: string | null
          created_at: string
          diagnosa: string | null
          dokter_id: string
          id: string
          pasien_id: string
          resep: string | null
          suhu_tubuh: number | null
          tanggal: string
          tekanan_darah: string | null
          tindakan: string | null
          tinggi_badan: number | null
          updated_at: string
        }
        Insert: {
          antrian_id: string
          berat_badan?: number | null
          catatan?: string | null
          created_at?: string
          diagnosa?: string | null
          dokter_id: string
          id?: string
          pasien_id: string
          resep?: string | null
          suhu_tubuh?: number | null
          tanggal?: string
          tekanan_darah?: string | null
          tindakan?: string | null
          tinggi_badan?: number | null
          updated_at?: string
        }
        Update: {
          antrian_id?: string
          berat_badan?: number | null
          catatan?: string | null
          created_at?: string
          diagnosa?: string | null
          dokter_id?: string
          id?: string
          pasien_id?: string
          resep?: string | null
          suhu_tubuh?: number | null
          tanggal?: string
          tekanan_darah?: string | null
          tindakan?: string | null
          tinggi_badan?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rekam_medis_antrian_id_fkey"
            columns: ["antrian_id"]
            isOneToOne: false
            referencedRelation: "antrian"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rekam_medis_dokter_id_fkey"
            columns: ["dokter_id"]
            isOneToOne: false
            referencedRelation: "dokter"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rekam_medis_pasien_id_fkey"
            columns: ["pasien_id"]
            isOneToOne: false
            referencedRelation: "pasien"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invoice_number: { Args: never; Returns: string }
      get_next_antrian_number: {
        Args: { p_dokter_id: string; p_tanggal: string }
        Returns: number
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "dokter" | "kasir"
      metode_pembayaran:
        | "tunai"
        | "transfer"
        | "kartu_debit"
        | "kartu_kredit"
        | "bpjs"
      status_antrian:
        | "menunggu"
        | "dipanggil"
        | "diperiksa"
        | "selesai"
        | "batal"
      status_pembayaran: "pending" | "lunas" | "batal"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "dokter", "kasir"],
      metode_pembayaran: [
        "tunai",
        "transfer",
        "kartu_debit",
        "kartu_kredit",
        "bpjs",
      ],
      status_antrian: [
        "menunggu",
        "dipanggil",
        "diperiksa",
        "selesai",
        "batal",
      ],
      status_pembayaran: ["pending", "lunas", "batal"],
    },
  },
} as const
