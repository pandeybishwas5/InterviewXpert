import { useEffect, useState } from "react";
import { ArrowLeft, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as api from "@/services/api";

interface Feedback {
  question: string;
  userAnswer: string;
  feedback: string;
  suggestedAnswer: string;
  score: number;
}

interface InterviewDetailProps {
  interviewId: string;
  interviewName: string;
  onBack: () => void;
}

export const InterviewDetail = ({ interviewId, interviewName, onBack }: InterviewDetailProps) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const res = await api.getFeedback(interviewId);

        
        // Assuming backend returns structured feedback as array
        // Transform if necessary
        const data: Feedback[] = res.data.feedback || [];
        setFeedbacks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [interviewId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
        <p className="text-sm">Analyzing and generating feedback...</p>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} size="icon">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{interviewName}</h1>
          <p className="text-muted-foreground">AI Analysis & Feedback</p>
        </div>
      </div>

      <div className="space-y-4">
        {feedbacks.length === 0 ? (
          <p className="text-muted-foreground text-center">No feedback available yet.</p>
        ) : (
          feedbacks.map((feedback, index) => (
            <Card key={index} className="p-6 gradient-card">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        Question {index + 1}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          feedback.score >= 8
                            ? "bg-success/10 text-success border-success/20"
                            : feedback.score >= 6
                            ? "bg-warning/10 text-warning border-warning/20"
                            : "bg-destructive/10 text-destructive border-destructive/20"
                        }
                      >
                        Score: {feedback.score}/10
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feedback.question}</h3>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Your Answer</p>
                    <p className="text-foreground">{feedback.userAnswer}</p>
                  </div>

                  <div className="p-4 rounded-xl gradient-primary text-primary-foreground">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4" />
                      <p className="text-sm font-medium">AI Feedback</p>
                    </div>
                    <p>{feedback.feedback}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <p className="text-sm font-medium text-success">Suggested Answer</p>
                    </div>
                    <p className="text-foreground">{feedback.suggestedAnswer}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
