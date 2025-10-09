from django.urls import path
from .views import create_interview, upload_file, transcribe_audio, get_feedback, delete_interview

urlpatterns = [
    path("", create_interview, name="create_interview"),
    path("<int:pk>/upload/", upload_file, name="upload_file"),
    path("<int:pk>/transcribe/", transcribe_audio, name="transcribe_audio"),
    path("<int:pk>/feedback/", get_feedback, name="get_feedback"),
    path("<int:pk>/", delete_interview, name="delete_interview"),
]
