from django.db import models

class AdminSettings(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=100, default='dagi')
    password = models.CharField(max_length=255, default='Dagi123')
    profile_name = models.CharField(max_length=200, default='Dagim Belayneh')
    profile_title = models.CharField(max_length=500, default='Computer Science Student | Full-Stack Developer')
    profile_image = models.CharField(max_length=500, default='/profile.jpg')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'admin_settings'

class Project(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    technologies = models.CharField(max_length=500, blank=True, default='')
    image = models.CharField(max_length=500, blank=True, default='')
    github = models.CharField(max_length=500, blank=True, default='')
    live = models.CharField(max_length=500, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'projects'
        ordering = ['-id']

class Message(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200)
    email = models.EmailField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'messages'
        ordering = ['-id']