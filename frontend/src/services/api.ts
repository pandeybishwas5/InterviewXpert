// src/services/api.ts
import axios from "axios";

const API_BASE = "http://localhost:8000/api/interviews/";

// -----------------------------
// Create Interview
// -----------------------------
export const createInterview = async (jobTitle: string) => {
  return axios.post(API_BASE, { job_title: jobTitle });
};

// -----------------------------
// Get All Interviews
// -----------------------------
export const getInterviews = async () => {
  return axios.get(API_BASE);
};

// -----------------------------
// Delete Interview
// -----------------------------
export const deleteInterview = async (id: number) => {
  return axios.delete(`${API_BASE}${id}/`);
};

// -----------------------------
// Upload File
// -----------------------------
export const uploadFile = async (id: number, file: File, onUploadProgress?: (progress: number) => void) => {
  const formData = new FormData();
  formData.append("file", file);

  return axios.post(`${API_BASE}${id}/upload/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onUploadProgress) {
        const percent = Math.round((e.loaded * 100) / (e.total || 1));
        onUploadProgress(percent);
      }
    },
  });
};

// -----------------------------
// Transcribe Audio
// -----------------------------
export const transcribeAudio = async (id: number) => {
  return axios.post(`${API_BASE}${id}/transcribe/`);
};

// -----------------------------
// Get AI Feedback
// -----------------------------
export const getFeedback = async (id: number) => {
  return axios.post(`${API_BASE}${id}/feedback/`);
};
