import { cn } from '@/lib/utils';
import { StatusAntrian } from '@/types';
import { Clock, User, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface QueueCardProps {
  id?: string;
  nomorAntrian: string;
  namaPasien: string;
  keluhan: string;
  waktu: string;
  status: StatusAntrian;
  onAction?: () => void;
  actionLabel?: string;
}

const statusStyles: Record<StatusAntrian, { bg: string; text: string }> = {
  Menunggu: { bg: 'bg-warning/10', text: 'text-warning' },
  Diperiksa: { bg: 'bg-info/10', text: 'text-info' },
  'Menunggu Pembayaran': { bg: 'bg-primary/10', text: 'text-primary' },
  Selesai: { bg: 'bg-success/10', text: 'text-success' },
  Batal: { bg: 'bg-destructive/10', text: 'text-destructive' },
};

export function QueueCard({
  nomorAntrian,
  namaPasien,
  keluhan,
  waktu,
  status,
  onAction,
  actionLabel,
}: QueueCardProps) {
  const statusStyle = statusStyles[status];

  return (
    <div className="rounded-xl border bg-card p-4 shadow-card transition-all duration-200 hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground">
            {nomorAntrian}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">{namaPasien}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">{keluhan}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{waktu}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant="outline" className={cn('font-medium', statusStyle.bg, statusStyle.text)}>
            {status}
          </Badge>
          {onAction && actionLabel && (
            <Button size="sm" onClick={onAction} className="gap-1">
              <Stethoscope className="h-4 w-4" />
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
