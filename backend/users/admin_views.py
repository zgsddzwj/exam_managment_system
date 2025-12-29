"""管理员统计视图"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from classes.models import Class
from tasks.models import Task
from submissions.models import Submission
from .permissions import IsAdmin

User = get_user_model()


@api_view(["GET"])
@permission_classes([IsAdmin])
def system_stats(request):
    """获取系统统计信息"""
    stats = {
        "total_users": User.objects.count(),
        "total_admins": User.objects.filter(role="admin").count(),
        "total_teachers": User.objects.filter(role="teacher").count(),
        "total_students": User.objects.filter(role="student").count(),
        "total_classes": Class.objects.count(),
        "total_tasks": Task.objects.count(),
        "total_submissions": Submission.objects.count(),
        "active_tasks": Task.objects.filter(is_active=True).count(),
    }
    
    return Response(stats)

