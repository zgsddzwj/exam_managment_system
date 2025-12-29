from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Task, TestCase
from .serializers import (
    TaskSerializer,
    TaskDetailSerializer,
    TaskCreateSerializer,
)
from classes.models import Class
from users.permissions import IsTeacherOrAdmin

User = get_user_model()


class TaskListCreateView(generics.ListCreateAPIView):
    """任务列表和创建视图"""
    
    permission_classes = [IsTeacherOrAdmin]
    
    def get_serializer_class(self):
        if self.request.method == "POST":
            return TaskCreateSerializer
        return TaskSerializer
    
    def get_queryset(self):
        user = self.request.user
        class_id = self.request.query_params.get("class_id")
        
        queryset = Task.objects.all()
        
        if class_id:
            queryset = queryset.filter(class_obj_id=class_id)
        
        if not user.is_admin:
            # 教师只能看到自己创建的班级的任务
            queryset = queryset.filter(class_obj__teacher=user)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    """任务详情视图"""
    
    serializer_class = TaskDetailSerializer
    permission_classes = [IsTeacherOrAdmin]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Task.objects.all()
        return Task.objects.filter(class_obj__teacher=user)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def student_task_list(request):
    """学生获取任务列表"""
    user = request.user
    
    if not user.is_student:
        return Response({"error": "只有学生可以访问"}, status=status.HTTP_403_FORBIDDEN)
    
    # 获取学生加入的所有班级
    classes = user.joined_classes.all()
    
    # 获取这些班级的所有任务
    tasks = Task.objects.filter(class_obj__in=classes, is_active=True)
    
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def student_task_detail(request, task_id):
    """学生获取任务详情（不包含隐藏的测试用例）"""
    user = request.user
    
    if not user.is_student:
        return Response({"error": "只有学生可以访问"}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        task = Task.objects.get(id=task_id, is_active=True)
    except Task.DoesNotExist:
        return Response({"error": "任务不存在"}, status=status.HTTP_404_NOT_FOUND)
    
    # 检查学生是否在该班级
    if not user.joined_classes.filter(id=task.class_obj.id).exists():
        return Response({"error": "您没有权限访问此任务"}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = TaskDetailSerializer(task)
    data = serializer.data
    
    # 过滤掉隐藏的测试用例
    data["test_cases"] = [
        tc for tc in data["test_cases"]
        if not tc["is_hidden"]
    ]
    
    return Response(data)
