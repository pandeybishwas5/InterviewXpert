import { FileAudio, FileVideo, Clock, CheckCircle, Loader2, Trash2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type InterviewStatus = 'uploaded' | 'analyzing' | 'completed';

export interface Interview {
  id: string;
  name: string | React.ReactNode;
  type: 'audio' | 'video';
  status: InterviewStatus;
  uploadedAt?: Date | string;
  duration?: number;
}

interface InterviewCardProps {
  interview: Interview;
  onClick: () => void;
  onDelete: (id: string) => void;
}

const statusConfig: Record<
  InterviewStatus,
  { label: string; icon: any; className: string }
> = {
  uploaded: {
    label: 'Uploaded',
    icon: Clock,
    className: 'bg-secondary/20 text-secondary-foreground border border-secondary/30',
  },
  analyzing: {
    label: 'Analyzing',
    icon: Loader2,
    className: 'bg-amber-100/10 text-amber-400 border border-amber-400/30 animate-pulse',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    className: 'bg-emerald-100/10 text-emerald-400 border border-emerald-400/30',
  },
};

export const InterviewCard = ({ interview, onClick, onDelete }: InterviewCardProps) => {
  const config = statusConfig[interview.status] || {
    label: 'Unknown',
    icon: AlertCircle,
    className: 'bg-gray-100/10 text-gray-400 border border-gray-400/30',
  };

  const StatusIcon = config.icon;
  const FileIcon = interview.type === 'audio' ? FileAudio : FileVideo;
  const isDisabled = interview.status !== 'completed';

  // Safely format date
  let formattedDate = 'Unknown date';
  if (interview.uploadedAt) {
    try {
      const dateObj =
        interview.uploadedAt instanceof Date
          ? interview.uploadedAt
          : new Date(interview.uploadedAt);
      if (!isNaN(dateObj.getTime())) {
        formattedDate = dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch {}
  }

  return (
    <Card
      onClick={!isDisabled ? onClick : undefined}
      className={cn(
        'relative p-5 transition-all duration-300 rounded-2xl shadow-sm border border-border/40 backdrop-blur-sm bg-card/60',
        'hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50 gradient-card',
        isDisabled && 'opacity-60 cursor-not-allowed',
        interview.status === 'analyzing' && 'animate-pulse'
      )}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: icon + info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="p-3 rounded-xl bg-primary/10 flex-shrink-0">
            <FileIcon className="w-6 h-6 text-primary" />
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-lg truncate leading-tight">{interview.name}</h3>
            <p className="text-sm text-muted-foreground">
              {formattedDate}
              {interview.duration && ` • ${Math.floor(interview.duration / 60)}m ${Math.floor(interview.duration % 60)}s`}
            </p>
          </div>
        </div>

        {/* Right: status + delete */}
        <div className="flex items-center gap-2 self-center">
          <Badge
            variant="outline"
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-colors h-6',
              config.className
            )}
          >
            <StatusIcon
              className={cn('w-3.5 h-3.5', interview.status === 'analyzing' && 'animate-spin')}
            />
            {config.label}
          </Badge>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(interview.id);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
