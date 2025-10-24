import { useState, useEffect } from "react";
import { FileUpload } from "@/components/FileUpload";
import { InterviewCard, Interview, InterviewStatus } from "@/components/InterviewCard";
import { InterviewDetail } from "@/components/InterviewDetail";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";
import * as api from "@/services/api";

const Index = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<string | null>(null);
  const [showAll, setShowAll] = useState<boolean>(false);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const res = await api.getInterviews();
      const formatted = res.data.map((i: any) => ({
        id: i.id.toString(),
        name: i.job_title,
        type: i.extracted_audio ? "audio" : "video",
        status: i.status as InterviewStatus,
        duration: i.duration,
        uploadedAt: new Date(i.created_at),
      }));
      setInterviews(formatted);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch interviews");
    }
  };

  const handleFileSelect = async (file: File, jobTitle: string) => {
    if (!jobTitle.trim()) {
      toast.error("Please enter a job title before uploading.");
      return;
    }

    try {
      const createRes = await api.createInterview(jobTitle);
      const interviewId = createRes.data.id;

      // Optimistic UI
      setInterviews((prev) => [
        {
          id: interviewId,
          name: jobTitle,
          type: file.type.startsWith("audio/") ? "audio" : "video",
          status: "uploaded",
          uploadedAt: new Date(),
        },
        ...prev,
      ]);

      toast.success("File added! Uploading...");

      // Upload file
      await api.uploadFile(interviewId, file);
      toast.success("File uploaded successfully!");

      // Set status to analyzing
      setInterviews((prev) =>
        prev.map((i) =>
          i.id === interviewId ? { ...i, status: "analyzing" as InterviewStatus } : i
        )
      );

      // Transcribe
      await api.transcribeAudio(interviewId);
      toast.success("Transcription completed!");

      // Set status to completed
      setInterviews((prev) =>
        prev.map((i) =>
          i.id === interviewId ? { ...i, status: "completed" as InterviewStatus } : i
        )
      );

      setSelectedInterview(interviewId);

      fetchInterviews();
    } catch (err) {
      console.error(err);
      toast.error("Error processing interview file");
    }
  };

  const handleDeleteInterview = async (id: string) => {
    try {
      await api.deleteInterview(id);
      setInterviews((prev) => prev.filter((i) => i.id !== id));
      toast.success("Interview deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete interview");
    }
  };

  if (selectedInterview) {
    const interview = interviews.find((i) => i.id === selectedInterview);
    return (
      <div className="min-h-screen gradient-subtle">
        <div className="container mx-auto px-4 py-8">
          <InterviewDetail
            interviewId={selectedInterview}
            interviewName={String(interview?.name || "")}
            onBack={() => setSelectedInterview(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-subtle">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4 py-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered Interview Analysis</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Interview Feedback Pro
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your interview recordings and get instant AI-powered feedback with suggested improvements
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <FileUpload onFileSelect={handleFileSelect} />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
  <h2 className="text-2xl font-bold">Your Interviews</h2>
  <Button
    variant="outline"
    size="sm"
    onClick={() => setShowAll((prev) => !prev)}
  >
    {showAll ? "View Less" : "View All"}
  </Button>
</div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(showAll ? interviews : interviews.slice(0, 3)).map((interview) => (
            <InterviewCard
              key={interview.id}
              interview={{
                ...interview,
                name:
                  interview.status === "analyzing" ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {interview.name}
                    </span>
                  ) : (
                    interview.name
                  ),
              }}
              onClick={() =>
                interview.status === "completed" && setSelectedInterview(interview.id)
              }
              onDelete={handleDeleteInterview}
            />
          ))}
        </div>

        </div>
      </div>
    </div>
  );
};

export default Index;
