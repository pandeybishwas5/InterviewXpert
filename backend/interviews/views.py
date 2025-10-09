import traceback
from io import BytesIO
import tempfile

from django.core.files.base import ContentFile
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from pydub import AudioSegment
import openai
from google.cloud import speech
from google.oauth2 import service_account

from .models import Interview
from .serializers import InterviewCreateSerializer

# Optional: MoviePy for video-to-audio
try:
    from moviepy.editor import VideoFileClip
except ImportError:
    VideoFileClip = None

# OpenAI setup
openai.api_key = settings.OPENAI_API_KEY

# Google Speech setup
credentials = service_account.Credentials.from_service_account_file(
    settings.SPEECH_CREDENTIALS_PATH
)
speech_client = speech.SpeechClient(credentials=credentials)


# -----------------------------
# Create Interview
# -----------------------------
@api_view(["GET", "POST"])
def create_interview(request):
    if request.method == "GET":
        # Return all interviews
        interviews = Interview.objects.all().order_by("-created_at")
        serializer = InterviewCreateSerializer(interviews, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        # Create a new interview
        serializer = InterviewCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["DELETE"])
def delete_interview(request, pk):
    try:
        interview = Interview.objects.get(pk=pk)
        interview.delete()
        return Response(status=204)
    except Interview.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

# -----------------------------
# Upload File
# -----------------------------
@api_view(["POST"])
def upload_file(request, pk):
    """
    Upload an audio/video file, convert to mono WAV,
    and save the WAV file to Google Cloud Storage.
    """
    interview = get_object_or_404(Interview, pk=pk)

    uploaded_file = request.FILES.get("file")
    if not uploaded_file:
        return Response({"error": "No file uploaded"}, status=400)

    try:
        file_ext = uploaded_file.name.split('.')[-1].lower()
        audio_io = BytesIO()

        # --- Handle video input ---
        if VideoFileClip and file_ext in ("mp4", "mov", "mkv", "avi"):
            with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_ext}") as tmp:
                tmp.write(uploaded_file.read())
                tmp.flush()
                clip = VideoFileClip(tmp.name)
                audio_tmp_path = tmp.name + ".wav"
                clip.audio.write_audiofile(audio_tmp_path, fps=44100, nbytes=2, logger=None)
                clip.close()
                with open(audio_tmp_path, "rb") as f:
                    audio_io.write(f.read())
        else:
            audio_io.write(uploaded_file.read())

        audio_io.seek(0)

        # --- Convert to mono WAV ---
        audio_segment = AudioSegment.from_file(audio_io)
        if audio_segment.channels > 1:
            audio_segment = audio_segment.set_channels(1)

        final_audio_io = BytesIO()
        audio_segment.export(final_audio_io, format="wav")
        final_audio_io.seek(0)

        # --- Save to GCS ---
        gcs_path = f"interviews/{pk}/interview.wav"
        interview.extracted_audio.save(gcs_path, ContentFile(final_audio_io.getvalue()))
        interview.save()

        return Response({"message": "File uploaded and processed successfully!"})

    except Exception as e:
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)


# -----------------------------
# Transcribe Audio
# -----------------------------
@api_view(["POST"])
def transcribe_audio(request, pk):
    interview = get_object_or_404(Interview, pk=pk)

    if not interview.extracted_audio:
        return Response({"error": "No extracted audio available"}, status=400)

    try:
        # GCS URI
        gcs_uri = f"gs://{settings.GS_BUCKET_NAME}/{interview.extracted_audio.name}"

        audio = speech.RecognitionAudio(uri=gcs_uri)
        diarization_config = speech.SpeakerDiarizationConfig(
            enable_speaker_diarization=True,
            min_speaker_count=2,
            max_speaker_count=2,
        )

        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            language_code="en-US",
            diarization_config=diarization_config,
            enable_automatic_punctuation=True,
            model="video",
        )

        # Long-running transcription
        operation = speech_client.long_running_recognize(config=config, audio=audio)
        response = operation.result(timeout=1800)

        transcript_data = []
        sentence = ""
        current_speaker = None

        for result in response.results:
            words_info = result.alternatives[0].words
            for word in words_info:
                if current_speaker is None:
                    current_speaker = word.speaker_tag

                if word.speaker_tag != current_speaker:
                    role = "Interviewer" if current_speaker == 1 else "Candidate"
                    if sentence.strip():
                        transcript_data.append({"speaker": role, "text": sentence.strip()})
                    sentence = ""
                    current_speaker = word.speaker_tag

                sentence += " " + word.word

            if sentence.strip():
                role = "Interviewer" if current_speaker == 1 else "Candidate"
                transcript_data.append({"speaker": role, "text": sentence.strip()})
                sentence = ""

        # Save transcript
        interview.transcript = "\n".join([f"{seg['speaker']}: {seg['text']}" for seg in transcript_data])
        interview.save()

        return Response({"transcript": transcript_data})

    except Exception as e:
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)


# -----------------------------
# Get Feedback from LLM
# -----------------------------
@api_view(["POST"])
def get_feedback(request, pk):
    interview = get_object_or_404(Interview, pk=pk)

    if not interview.transcript:
        return Response({"error": "Transcript not available"}, status=400)

    try:
        prompt = f"""
You are an expert interview coach.
The candidate applied for: {interview.job_title}
Here is the interview transcript:

{interview.transcript}

Provide:
1. Feedback on candidate responses.
2. Improved answers for questions the candidate missed or answered poorly.
Format the response clearly with bullets or paragraphs.
"""

        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000,
        )

        feedback_text = response.choices[0].message.content.strip()
        return Response({"feedback": feedback_text})

    except Exception as e:
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)


# -----------------------------
# Get Transcript
# -----------------------------
@api_view(["GET"])
def get_transcript(request, pk):
    interview = get_object_or_404(Interview, pk=pk)
    return Response({
        "job_title": interview.job_title,
        "transcript": interview.transcript,
    })
