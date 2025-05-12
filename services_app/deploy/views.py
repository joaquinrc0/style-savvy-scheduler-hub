import hmac, hashlib, subprocess, os
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, HttpResponseBadRequest

@csrf_exempt
def git_push(request):
    # Solo aceptamos POST
    if request.method != "POST":
        return HttpResponseBadRequest("Invalid method")

    # Verificamos firma HMAC-SHA256
    signature = request.headers.get("X-Hub-Signature-256", "")
    mac = hmac.new(
        settings.WEBHOOK_SECRET.encode(),
        msg=request.body,
        digestmod=hashlib.sha256
    )
    expected = "sha256=" + mac.hexdigest()
    if not hmac.compare_digest(expected, signature):
        return HttpResponseBadRequest("Invalid signature")

    # Ejecutamos git pull y docker-compose
    try:
        
        # TODO: Poner git aqui, subir todo a una nueva rama y hacer merge con la main. Proxima vez que se haga un push, 
        # se actualiza todo aqui
        print("Pulling latest changes from repository...")
        # 1) Traer cambios de origin/main
        subprocess.run(
            ["git", "pull", "origin", "main"],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )

        print("Rebuilding and restarting web service...")
        # 2) Reconstruir y reiniciar únicamente el servicio 'django'
        subprocess.run(
            ["docker", "compose", "up", "-d", "--build", "django"],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )

    except subprocess.CalledProcessError as e:
        # Loguea e informa error
        # Aquí podrías escribir e.stderr a un fichero
        return HttpResponse(f"Error deploying:\n{e.stderr.decode()}", status=500)

    return HttpResponse("Deployed", status=204)
