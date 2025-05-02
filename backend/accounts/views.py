from uuid import UUID
from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.contrib.auth.views import LoginView, LogoutView
from .models import Invitation
from .forms import RegisterForm

class CustomLoginView(LoginView):
    template_name = 'accounts/login.html'

class CustomLogoutView(LogoutView):
    pass

def invite_register(request, token):
    # 1) Validar formato UUID
    try:
        token_uuid = UUID(token, version=4)
    except ValueError:
        return render(request, 'accounts/unauthorized.html', status=400)

    # 2) Recuperar invitación
    try:
        invite = Invitation.objects.get(token=token_uuid)
    except Invitation.DoesNotExist:
        return render(request, 'accounts/unauthorized.html', status=404)

    # 3) Si ya fue usada
    if invite.used:
        return render(request, 'accounts/unauthorized.html', status=403)

    # 4) Flujo de registro
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password'])
            user.save()
            invite.used = True
            invite.save()
            login(request, user)
            return redirect('/')
    else:
        form = RegisterForm(initial={'email': invite.email})

    return render(request, 'accounts/register.html', {'form': form})
