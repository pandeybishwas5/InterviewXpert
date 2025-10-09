from django.contrib import admin
from .models import Interview

@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display = ["id", "job_title", "created_at", "uploaded_file", "extracted_audio"]
