from django.db import models
from django.contrib.auth.models import User

class Reminder(models.Model):
    PRIORITY_CHOICES = [
        ('Important', 'Important'),
        ('Less Important', 'Less Important'),
        ('Upcoming', 'Upcoming'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    date = models.DateField()
    time = models.TimeField()
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Upcoming')

    def __str__(self):
        return self.title

class StudyGroup(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    creator = models.ForeignKey(User, related_name='created_groups', on_delete=models.CASCADE)
    members = models.ManyToManyField(User, related_name='study_groups')

    def __str__(self):
        return self.name
    
class Resource(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    file = models.FileField(upload_to='resources/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    
class Event(models.Model):
    title = models.CharField(max_length=200)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    description = models.TextField(blank=True)

    def __str__(self):
        return self.title

class Task(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=50)
    category = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

