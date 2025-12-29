from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Class, InvitationCode
from .serializers import (
    ClassSerializer,
    ClassDetailSerializer,
    InvitationCodeSerializer,
    JoinClassSerializer,
)
from .permissions import IsTeacherOrAdmin

User = get_user_model()


class ClassListCreateView(generics.ListCreateAPIView):
    """班级列表和创建视图"""
    
    serializer_class = ClassSerializer
    permission_classes = [IsTeacherOrAdmin]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Class.objects.all()
        return Class.objects.filter(teacher=user)
    
    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)


class ClassDetailView(generics.RetrieveUpdateDestroyAPIView):
    """班级详情视图"""
    
    serializer_class = ClassDetailSerializer
    permission_classes = [IsTeacherOrAdmin]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Class.objects.all()
        return Class.objects.filter(teacher=user)


@api_view(["POST"])
@permission_classes([IsTeacherOrAdmin])
def create_invitation_code(request, class_id):
    """创建邀请码"""
    try:
        class_obj = Class.objects.get(id=class_id)
    except Class.DoesNotExist:
        return Response({"error": "班级不存在"}, status=status.HTTP_404_NOT_FOUND)
    
    # 检查权限
    if not request.user.is_admin and class_obj.teacher != request.user:
        return Response({"error": "无权限"}, status=status.HTTP_403_FORBIDDEN)
    
    # 生成邀请码
    code = InvitationCode.generate_code()
    invitation = InvitationCode.objects.create(
        code=code,
        class_obj=class_obj,
        max_uses=request.data.get("max_uses", 0),
    )
    
    serializer = InvitationCodeSerializer(invitation)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def join_class(request):
    """学生通过邀请码加入班级"""
    if not request.user.is_student:
        return Response({"error": "只有学生可以加入班级"}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = JoinClassSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    code = serializer.validated_data["code"]
    
    try:
        invitation = InvitationCode.objects.get(code=code)
    except InvitationCode.DoesNotExist:
        return Response({"error": "邀请码不存在"}, status=status.HTTP_404_NOT_FOUND)
    
    can_use, message = invitation.can_use()
    if not can_use:
        return Response({"error": message}, status=status.HTTP_400_BAD_REQUEST)
    
    # 检查是否已经加入
    if invitation.class_obj.students.filter(id=request.user.id).exists():
        return Response({"error": "您已经加入该班级"}, status=status.HTTP_400_BAD_REQUEST)
    
    # 加入班级
    invitation.class_obj.students.add(request.user)
    invitation.use()
    
    return Response({
        "message": "成功加入班级",
        "class": ClassSerializer(invitation.class_obj).data
    }, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def my_classes(request):
    """获取当前用户相关的班级"""
    user = request.user
    
    if user.is_teacher or user.is_admin:
        # 教师和管理员：获取创建的班级
        classes = Class.objects.filter(teacher=user)
    else:
        # 学生：获取加入的班级
        classes = user.joined_classes.all()
    
    serializer = ClassSerializer(classes, many=True)
    return Response(serializer.data)
