from django.db import models

# Create your models here.
class Interview(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    job_title = models.CharField(max_length=200)
    uploaded_file = models.FileField(upload_to="uploads/", null=True, blank=True)
    extracted_audio = models.FileField(upload_to="uploads/", null=True, blank=True)
    transcript = models.TextField(null=True, blank=True)
    duration = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=50, default="uploaded") 

def __str__(self):
    return f"Interview #{self.id} - {self.job_title}"