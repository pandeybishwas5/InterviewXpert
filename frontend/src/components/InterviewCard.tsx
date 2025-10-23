import { FileAudio, FileVideo, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type InterviewStatus = 'uploaded' | 'analyzing' | 'completed';

export interface Interview {
  id: string;
  name: string;
  type: 'audio' | 'video';
  status: InterviewStatus;
  uploadedAt: Date;
  duration?: string;
}

interface InterviewCardProps {
  interview: Interview;
  onClick: () => void;
}

const statusConfig = {
  uploaded: {
    label: 'Uploaded',
    icon: Clock,
    className: 'bg-secondary text-secondary-foreground',
  },
  analyzing: {
    label: 'Analyzing',
    icon: Loader2,
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    className: 'bg-success/10 text-success border-success/20',
  },
};

export const InterviewCard = ({ interview, onClick }: InterviewCardProps) => {
  const config = statusConfig[interview.status];
  const StatusIcon = config.icon;
  const FileIcon = interview.type === 'audio' ? FileAudio : FileVideo;

  return (
    <Card
      onClick={onClick}
      className={cn(
        "p-6 cursor-pointer transition-smooth hover:shadow-lg hover:shadow-primary/10",
        "hover:border-primary/50 gradient-card"
      )}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-primary/10">
          <FileIcon className="w-6 h-6 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate mb-1">{interview.name}</h3>
          <p className="text-sm text-muted-foreground">
            {interview.uploadedAt.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
            {interview.duration && ` • ${interview.duration}`}
          </p>
        </div>
        
        <Badge variant="outline" className={cn("transition-smooth", config.className)}>
          <StatusIcon className={cn("w-3 h-3 mr-1", interview.status === 'analyzing' && "animate-spin")} />
          {config.label}
        </Badge>
      </div>
    </Card>
  );
};
