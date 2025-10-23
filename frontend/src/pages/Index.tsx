import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { InterviewCard, Interview, InterviewStatus } from '@/components/InterviewCard';
import { InterviewDetail } from '@/components/InterviewDetail';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

// Mock data for demonstration
const mockInterviews: Interview[] = [
  {
    id: '1',
    name: 'Software Engineer Interview - Google',
    type: 'video',
    status: 'completed',
    uploadedAt: new Date('2024-01-15'),
    duration: '45:30',
  },
  {
    id: '2',
    name: 'Product Manager Phone Screen',
    type: 'audio',
    status: 'completed',
    uploadedAt: new Date('2024-01-18'),
    duration: '32:15',
  },
  {
    id: '3',
    name: 'Technical Assessment - Amazon',
    type: 'video',
    status: 'analyzing',
    uploadedAt: new Date('2024-01-20'),
    duration: '52:00',
  },
];

const mockFeedbacks = [
  {
    question: "Can you explain the difference between var, let, and const in JavaScript?",
    userAnswer: "var is function scoped, let and const are block scoped. const cannot be reassigned.",
    feedback: "Good explanation! You covered the key differences. Consider mentioning hoisting behavior and the temporal dead zone for let and const.",
    suggestedAnswer: "var is function-scoped and hoisted with initialization. let and const are block-scoped and hoisted without initialization (temporal dead zone). const prevents reassignment but allows object mutation. var can be redeclared, while let and const cannot.",
    score: 8,
  },
  {
    question: "What is your experience with React hooks?",
    userAnswer: "I've used useState and useEffect in my projects to manage state and side effects.",
    feedback: "You mentioned the most common hooks. To strengthen your answer, discuss useCallback, useMemo for optimization, or custom hooks you've created.",
    suggestedAnswer: "I have extensive experience with React hooks including useState for state management, useEffect for side effects, useCallback and useMemo for performance optimization, and useContext for state sharing. I've also created custom hooks to encapsulate reusable logic, such as useDebounce and useFetch for API calls.",
    score: 6,
  },
  {
    question: "Describe a challenging bug you fixed recently.",
    userAnswer: "There was a memory leak in our application caused by not cleaning up event listeners.",
    feedback: "Great start! Enhance your answer by explaining how you identified the issue, the steps you took to fix it, and what you learned.",
    suggestedAnswer: "I discovered a memory leak in our React application where event listeners weren't being cleaned up. I used Chrome DevTools to profile memory usage and identified components not removing listeners on unmount. I fixed it by implementing proper cleanup in useEffect return functions and created a custom hook to ensure consistent cleanup across the codebase. This improved our app's performance by 40% in long sessions.",
    score: 7,
  },
];

const Index = () => {
  const [interviews, setInterviews] = useState<Interview[]>(mockInterviews);
  const [selectedInterview, setSelectedInterview] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    const newInterview: Interview = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type.startsWith('audio/') ? 'audio' : 'video',
      status: 'uploaded',
      uploadedAt: new Date(),
    };
    
    setInterviews([newInterview, ...interviews]);
    toast.success('File uploaded successfully!', {
      description: 'AI analysis will begin shortly.',
    });

    // Simulate analysis
    setTimeout(() => {
      setInterviews(prev => 
        prev.map(i => i.id === newInterview.id ? { ...i, status: 'analyzing' as InterviewStatus } : i)
      );
    }, 2000);

    setTimeout(() => {
      setInterviews(prev => 
        prev.map(i => i.id === newInterview.id ? { ...i, status: 'completed' as InterviewStatus } : i)
      );
      toast.success('Analysis complete!', {
        description: 'Your interview feedback is ready.',
      });
    }, 5000);
  };

  if (selectedInterview) {
    const interview = interviews.find(i => i.id === selectedInterview);
    return (
      <div className="min-h-screen gradient-subtle">
        <div className="container mx-auto px-4 py-8">
          <InterviewDetail
            interviewName={interview?.name || ''}
            feedbacks={mockFeedbacks}
            onBack={() => setSelectedInterview(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-subtle">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
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

        {/* Upload Section */}
        <div className="max-w-3xl mx-auto">
          <FileUpload onFileSelect={handleFileSelect} />
        </div>

        {/* Interviews List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Interviews</h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {interviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                onClick={() => interview.status === 'completed' && setSelectedInterview(interview.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
