import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Project, Message, AdminSettings

@require_http_methods(["GET"])
def get_projects(request):
    try:
        projects = Project.objects.all().values('id', 'title', 'description', 'technologies', 'image', 'github', 'live')
        return JsonResponse(list(projects), safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_http_methods(["GET"])
def get_settings(request):
    try:
        settings = AdminSettings.objects.filter(id=1).first()
        if settings:
            data = {
                'profile_name': settings.profile_name,
                'profile_title': settings.profile_title,
                'profile_image': settings.profile_image
            }
        else:
            data = {
                'profile_name': 'Dagim Belayneh',
                'profile_title': 'Computer Science Student | Full-Stack Developer',
                'profile_image': '/profile.jpg'
            }
        return JsonResponse(data)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def post_contact(request):
    try:
        data = json.loads(request.body)
        name = data.get('name')
        email = data.get('email')
        message = data.get('message')
        
        if not name or not email or not message:
            return JsonResponse({'error': "All fields are required"}, status=400)
        
        Message.objects.create(name=name, email=email, message=message)
        return JsonResponse({'message': "Message sent successfully!"})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def admin_login(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        admin = AdminSettings.objects.filter(username=username).first()
        
        if admin and admin.password == password:
            admin_data = {
                'id': admin.id,
                'username': admin.username,
                'profile_name': admin.profile_name,
                'profile_title': admin.profile_title,
                'profile_image': admin.profile_image
            }
            return JsonResponse({'success': True, 'admin': admin_data})
        else:
            return JsonResponse({'success': False, 'error': "Invalid credentials"}, status=401)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
def update_settings(request):
    try:
        data = json.loads(request.body)
        settings, created = AdminSettings.objects.get_or_create(id=1)
        
        if 'username' in data:
            settings.username = data['username']
        if 'password' in data:
            settings.password = data['password']
        if 'profile_name' in data:
            settings.profile_name = data['profile_name']
        if 'profile_title' in data:
            settings.profile_title = data['profile_title']
        if 'profile_image' in data:
            settings.profile_image = data['profile_image']
        
        settings.save()
        
        settings_data = {
            'id': settings.id,
            'username': settings.username,
            'profile_name': settings.profile_name,
            'profile_title': settings.profile_title,
            'profile_image': settings.profile_image
        }
        return JsonResponse({'success': True, 'settings': settings_data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_http_methods(["GET"])
def get_messages(request):
    try:
        messages = Message.objects.all().values('id', 'name', 'email', 'message', 'created_at')
        return JsonResponse(list(messages), safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def create_project(request):
    try:
        data = json.loads(request.body)
        
        if not data.get('title') or not data.get('description'):
            return JsonResponse({'error': "Title and description are required"}, status=400)
        
        project = Project.objects.create(
            title=data.get('title'),
            description=data.get('description'),
            technologies=data.get('technologies', ''),
            image=data.get('image', ''),
            github=data.get('github', ''),
            live=data.get('live', '')
        )
        
        project_data = {
            'id': project.id,
            'title': project.title,
            'description': project.description,
            'technologies': project.technologies,
            'image': project.image,
            'github': project.github,
            'live': project.live
        }
        return JsonResponse(project_data, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
def update_project(request, project_id):
    try:
        data = json.loads(request.body)
        
        if not data.get('title') or not data.get('description'):
            return JsonResponse({'error': "Title and description are required"}, status=400)
        
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return JsonResponse({'error': "Project not found"}, status=404)
        
        project.title = data.get('title')
        project.description = data.get('description')
        project.technologies = data.get('technologies', '')
        project.image = data.get('image', '')
        project.github = data.get('github', '')
        project.live = data.get('live', '')
        project.save()
        
        project_data = {
            'id': project.id,
            'title': project.title,
            'description': project.description,
            'technologies': project.technologies,
            'image': project.image,
            'github': project.github,
            'live': project.live
        }
        return JsonResponse(project_data)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_project(request, project_id):
    try:
        deleted, _ = Project.objects.filter(id=project_id).delete()
        if deleted == 0:
            return JsonResponse({'error': "Project not found"}, status=404)
        return JsonResponse({'message': "Project deleted successfully"})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)