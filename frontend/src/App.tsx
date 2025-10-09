import { useState, useEffect } from "react";
import axios from "axios";
import {
  createInterview as apiCreateInterview,
  deleteInterview as apiDeleteInterview,
  uploadFile as apiUploadFile,
  transcribeAudio as apiTranscribeAudio,
  getFeedback as apiGetFeedback,
} from "./services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, Trash2, PlusCircle, HomeIcon } from "lucide-react";

// Type definitions
interface Interview {
  id: number;
  job_title: string;
  transcript?: string;
}

interface TranscriptSegment {
  speaker: string;
  text: string;
}

function App() {
  const [jobTitle, setJobTitle] = useState("");
  const [interview, setInterview] = useState<Interview | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [tokensUsed, setTokensUsed] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  // Fetch all interviews on load
  useEffect(() => {
    axios
      .get("/api/interviews/")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setInterviews(res.data);
        } else {
          console.error("Expected array but got:", res.data);
          setInterviews([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch interviews:", err);
        setInterviews([]);
      });
  }, []);

 const handleCreateInterview = async (e?: React.FormEvent) => {
  e?.preventDefault();
  setError(null);

  try {
    const res = await apiCreateInterview(jobTitle || "New Interview");
    if (res?.data) {
      setInterview(res.data);
      setInterviews((prev) => [...prev, res.data]);
      setTranscript([]);
      setFeedback(null);
      setTokensUsed(null);
      setFile(null);
      setJobTitle("");
      setShowLanding(false);
    } else {
      setError("Invalid response from server");
    }
  } catch (err: any) {
    setError(err.message || "Failed to create interview");
  }
};

// -----------------------------
// Upload File
// -----------------------------
const handleUploadFile = async () => {
  if (!file || !interview) return;
  setError(null);
  setUploadProgress(0);
  setUploading(true);

  try {
    await apiUploadFile(interview.id, file, (percent) => {
      setUploadProgress(percent);
    });
    alert("File uploaded successfully!");
  } catch (err: any) {
    setError(err.message || "Failed to upload file");
  } finally {
    setUploadProgress(0);
    setUploading(false);
  }
};

// -----------------------------
// Transcribe Audio
// -----------------------------
const handleTranscribe = async () => {
  if (!interview) return;
  setError(null);
  setLoading(true);

  try {
    const res = await apiTranscribeAudio(interview.id);
    if (Array.isArray(res.data.transcript)) {
      setTranscript(res.data.transcript);
    } else {
      setTranscript([]);
    }
  } catch (err: any) {
    setError(err.message || "Failed to transcribe audio");
  } finally {
    setLoading(false);
  }
};

// -----------------------------
// Get AI Feedback
// -----------------------------
const handleGetFeedback = async () => {
  if (!interview) return;
  setError(null);
  setLoading(true);

  try {
    const res = await apiGetFeedback(interview.id);
    if (res.data.feedback) setFeedback(res.data.feedback);
    if (res.data.usage?.total_tokens) setTokensUsed(res.data.usage.total_tokens);
  } catch (err: any) {
    setError(err.message || "Failed to get feedback");
  } finally {
    setLoading(false);
  }
};

// -----------------------------
// Delete Interview
// -----------------------------
const handleDeleteInterview = async (id: number) => {
  try {
    await apiDeleteInterview(id);
    setInterviews((prev) => prev.filter((i) => i.id !== id));
    if (interview?.id === id) {
      setInterview(null);
      setTranscript([]);
      setFeedback(null);
      setShowLanding(true);
    }
  } catch (err) {
    console.error(err);
    setError("Failed to delete interview");
  }
};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full border-b bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
          <h1 className="text-2xl font-bold text-gray-900">Interview Coach AI</h1>
          <Button
            variant="default"
            onClick={() => {
              setInterview(null);
              setShowLanding(true);
            }}
          ><HomeIcon />
            Homepage
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Landing / Hero Section */}
        {showLanding && (
          <section className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-lg p-12 mb-12 shadow-lg text-center">
            <h2 className="text-4xl font-bold mb-4">Ace Your Interviews with AI</h2>
            <p className="text-lg mb-6">
              Upload your interview recordings and get AI-powered transcript analysis and personalized feedback instantly.
            </p>
            <div className="flex justify-center gap-4">
              <Input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Enter job title"
                className="max-w-sm"
              />
              <Button 
                className="text-green-500 bg-white hover:bg-gray-100 flex items-center gap-2"
                onClick={handleCreateInterview} size="lg"><PlusCircle />
                Start Interview
              </Button>
            </div>
          </section>
        )}

        <Tabs defaultValue="dashboard">
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="workspace" disabled={!interview}>
              Workspace
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard">
            <Card>
              <CardHeader>
                <CardTitle>Manage Interviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.isArray(interviews) &&
                    interviews.map((i) => (
                      <Card
                        key={i.id}
                        className="hover:shadow-lg transition cursor-pointer"
                        onClick={() => {
                          setInterview(i);
                          setShowLanding(false);
                        }}
                      >
                        <CardHeader className="flex flex-row justify-between items-center">
                          <CardTitle>{i.job_title}</CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteInterview(i.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600">
                            {i.transcript ? "Transcript available" : "No transcript yet"}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workspace */}
          <TabsContent value="workspace">
            {interview && (
              <Card>
                <CardHeader>
                  <CardTitle>{interview.job_title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Upload */}
                  <div className="flex flex-col gap-4 mb-6">
                    <input
                      type="file"
                      accept="audio/*,video/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setFile(e.target.files[0]);
                      }}
                    />
                    <Button onClick={handleUploadFile} disabled={!file || uploading}>
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading... {uploadProgress}%
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload File
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 mb-6">
                    <Button onClick={handleTranscribe} disabled={loading}>
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Transcribe
                    </Button>
                    <Button onClick={handleGetFeedback} disabled={loading}>
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Get Feedback
                    </Button>
                  </div>

                  {/* Transcript */}
                  {transcript.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Transcript</h3>
                      <div className="bg-gray-100 p-4 rounded-lg space-y-2 max-h-64 overflow-y-auto">
                        {transcript.map((seg, idx) => (
                          <p key={idx}>
                            <strong>{seg.speaker}:</strong> {seg.text}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  {feedback && (
                    <div>
                      <h3 className="font-semibold mb-2">AI Feedback</h3>
                      <div className="bg-gray-100 p-4 rounded-lg whitespace-pre-wrap">{feedback}</div>
                      {tokensUsed && (
                        <p className="text-sm text-gray-500 mt-2">Tokens used: {tokensUsed}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App;
