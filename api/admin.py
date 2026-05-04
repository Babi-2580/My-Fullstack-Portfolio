from django.contrib import admin
from .models import AdminSettings, Project, Message

admin.site.register(AdminSettings)
admin.site.register(Project)
admin.site.register(Message)