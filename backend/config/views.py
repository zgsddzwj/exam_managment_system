from django.http import JsonResponse

def api_root(request):
    """API根路径，返回API信息"""
    return JsonResponse({
        "message": "代码评估系统 API",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/auth/",
            "classes": "/api/classes/",
            "tasks": "/api/tasks/",
            "submissions": "/api/submissions/",
            "admin": "/admin/",
        }
    })

