from django.urls import path
from . import views

urlpatterns = [
    path('projects', views.get_projects, name='get_projects'),
    path('settings', views.get_settings, name='get_settings'),
    path('contact', views.post_contact, name='post_contact'),
    path('admin/login', views.admin_login, name='admin_login'),
    path('admin/settings', views.update_settings, name='update_settings'),
    path('admin/messages', views.get_messages, name='get_messages'),
    path('admin/projects', views.create_project, name='create_project'),
    path('admin/projects/<int:project_id>', views.update_project, name='update_project'),
    path('admin/projects/<int:project_id>/delete', views.delete_project, name='delete_project'),
]