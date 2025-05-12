import hmac, hashlib, subprocess, os
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, HttpResponseBadRequest

BASE_DIR = settings.BASE_DIR  # usually the directory with manage.py

def run_git_cmd(cmd):
    return subprocess.run(
        cmd,
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=BASE_DIR,
    )

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

        run_git_cmd(["git", "config", "--global", "user.name", "joaquinrc0"])
        run_git_cmd(["git", "checkout", "main"])
        pull_result = run_git_cmd(["git", "pull", "origin", "main"])
        print(pull_result.stdout.decode())

        # Only rebuild if there were changes
        if "Already up to date" not in pull_result.stdout.decode():
            print("Rebuilding and restarting web service...")
            subprocess.run(
                ["docker", "compose", "up", "-d", "--build", "django"],
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
        else:
            print("No changes to deploy")

    except subprocess.CalledProcessError as e:
        error_msg = f"Error deploying:\nCommand: {e.cmd}\nOutput: {e.stderr.decode()}"
        print(error_msg)
        return HttpResponse(error_msg, status=500)
    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        print(error_msg)
        return HttpResponse(error_msg, status=500)

    return HttpResponse("Deployed", status=204)
