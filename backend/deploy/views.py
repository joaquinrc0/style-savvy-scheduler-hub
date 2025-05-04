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
        # TODO: Cambiar por el path del repo
        repo_dir = settings.PROJECT_DIR
        # 1) Pull del repo
        # TODO: Uncomment
        print("Pulling latest changes from repository...")
        # subprocess.run(
        #     ["git", "-C", repo_dir, "pull"],
        #     check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE
        # )
        # 2) Rebuild & restart solo el servicio 'web'
        print("Rebuilding and restarting web service...")
        
        # subprocess.run(
        #     ["docker compose", "-f", os.path.join(repo_dir, "docker-compose.yml"),
        #      "up", "-d", "--build", "web"],
        #     check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE
        # )
    except subprocess.CalledProcessError as e:
        # Loguea e informa error
        # Aquí podrías escribir e.stderr a un fichero
        return HttpResponse(f"Error deploying:\n{e.stderr.decode()}", status=500)

    return HttpResponse("Deployed", status=204)
