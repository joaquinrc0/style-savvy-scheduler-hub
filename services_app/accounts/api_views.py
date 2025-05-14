from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
import json
from .models import Invitation
from .forms import RegisterForm
from uuid import UUID
from django.shortcuts import redirect

@csrf_exempt
@require_POST
def api_login(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        if not email or not password:
            return JsonResponse({'success': False, 'error': 'Email and password are required.'}, status=400)
        # Get user by email
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Invalid credentials'}, status=400)
        user = authenticate(request, username=user_obj.username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'error': 'Invalid credentials'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@login_required
def api_user(request):
    return JsonResponse({'isAuthenticated': True, 'username': request.user.username})

@csrf_exempt
@require_POST
def api_invite_register(request, token):
    # 1) Validar formato UUID
    try:
        token_uuid = UUID(token, version=4)
    except ValueError:
        return JsonResponse({'success': False, 'error': 'Invalid token format'}, status=400)

    # 2) Recuperar invitación
    try:
        invite = Invitation.objects.get(token=token_uuid)
    except Invitation.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Invitation not found'}, status=404)

    # 3) Si ya fue usada
    if invite.used:
        return JsonResponse({'success': False, 'error': 'Invitation already used'}, status=403)

    # 4) Flujo de registro
    try:
        data = json.loads(request.body)
        form = RegisterForm(data)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password'])
            user.save()
            invite.used = True
            invite.save()
            login(request, user)
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'errors': form.errors}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
def api_logout(request):
    logout(request)
    return JsonResponse({'success': True})
