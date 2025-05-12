import hmac
import hashlib
import subprocess
import os
import signal
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, HttpResponseBadRequest

BASE_DIR = settings.BASE_DIR  # ahora apunta a "/app" dentro del contenedor

def run_git_cmd(cmd):
    return subprocess.run(
        cmd,
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=BASE_DIR,
        text=True,
    )

@csrf_exempt
def git_push(request):
    if request.method != "POST":
        return HttpResponseBadRequest("Invalid method")

    # Verifica HMAC-SHA256...
    signature = request.headers.get("X-Hub-Signature-256", "")
    mac = hmac.new(
        settings.WEBHOOK_SECRET.encode(),
        msg=request.body,
        digestmod=hashlib.sha256
    )
    if not hmac.compare_digest("sha256="+mac.hexdigest(), signature):
        return HttpResponseBadRequest("Invalid signature")

    try:
        # Configura git safe dir (solo la primera vez.)
        run_git_cmd(["git", "config", "--global", "user.name", "joaquinrc0"])
        run_git_cmd(["git", "config", "--global", "--add", "safe.directory", "*"])

        # Pull de main.
        run_git_cmd(["git", "checkout", "main"])
        pull = run_git_cmd(["git", "pull", "origin", "main"])
        out = pull.stdout
        print(out)

        # Si hay cambios, recarga Gunicorn
        print("Reloading Gunicorn…")

        # Obtiene el PID del proceso maestro de Gunicorn
        pid = subprocess.check_output(
            ["pgrep", "-f", "gunicorn: master"], text=True
        ).strip()

        # Envía la señal HUP al proceso maestro
        os.kill(int(pid), signal.SIGHUP)

        return HttpResponse(status=204)

    except subprocess.CalledProcessError as e:
        error_msg = (
            f"Error deploying:\n"
            f"Command: {' '.join(e.cmd)}\n"
            f"Output: {e.stderr or e.stdout}"
        )
        print(error_msg)
        return HttpResponse(error_msg, status=500)
    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        print(error_msg)
        return HttpResponse(error_msg, status=500)
