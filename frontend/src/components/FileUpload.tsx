import { useCallback, useState } from 'react';
import { Upload, FileAudio, FileVideo } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={cn(
        "relative border-2 border-dashed rounded-2xl p-12 transition-smooth",
        "hover:border-primary hover:shadow-glow cursor-pointer",
        isDragging ? "border-primary bg-primary/5 shadow-glow" : "border-border bg-card/50"
      )}
    >
      <input
        type="file"
        accept="audio/*,video/*"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="relative">
          <div className="absolute inset-0 gradient-primary rounded-full blur-xl opacity-30 animate-pulse" />
          <div className="relative bg-card rounded-full p-6 shadow-lg">
            <Upload className="w-10 h-10 text-primary" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Drop your interview files here</h3>
          <p className="text-muted-foreground">or click to browse</p>
        </div>
        
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <FileAudio className="w-4 h-4" />
            <span>Audio</span>
          </div>
          <div className="flex items-center gap-2">
            <FileVideo className="w-4 h-4" />
            <span>Video</span>
          </div>
        </div>
      </div>
    </div>
  );
};
