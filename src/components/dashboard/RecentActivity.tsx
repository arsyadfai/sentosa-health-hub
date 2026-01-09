import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'registrasi' | 'pemeriksaan' | 'pembayaran';
  message: string;
  time: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const typeStyles = {
  registrasi: 'bg-info',
  pemeriksaan: 'bg-primary',
  pembayaran: 'bg-success',
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Aktivitas Terbaru</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={cn(
              'flex items-start gap-4',
              index !== activities.length - 1 && 'pb-4 border-b border-border/50'
            )}
          >
            <div
              className={cn(
                'mt-1 h-2 w-2 rounded-full shrink-0',
                typeStyles[activity.type]
              )}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{activity.message}</p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
