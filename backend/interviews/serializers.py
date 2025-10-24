from rest_framework import serializers
from .models import Interview


class InterviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interview
        fields = ["id", "job_title", "transcript", "extracted_audio", "created_at", "duration", "status"]
        read_only_fields = ["id", "transcript", "extracted_audio", "created_at"]