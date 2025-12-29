from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    UserDetailSerializer,
)
from .permissions import IsAdmin, IsTeacherOrAdmin

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """用户注册视图"""
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # 生成JWT token
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    """获取当前用户信息"""
    serializer = UserDetailSerializer(request.user)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAdmin])
def user_list(request):
    """获取所有用户列表（仅管理员）"""
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(["PATCH"])
@permission_classes([IsAdmin])
def update_user_role(request, user_id):
    """更新用户角色（仅管理员）"""
    try:
        target_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "用户不存在"}, status=status.HTTP_404_NOT_FOUND)
    
    # 不能修改自己的角色
    if target_user.id == request.user.id:
        return Response({"error": "不能修改自己的角色"}, status=status.HTTP_400_BAD_REQUEST)
    
    role = request.data.get("role")
    if role not in ["admin", "teacher", "student"]:
        return Response({"error": "无效的角色"}, status=status.HTTP_400_BAD_REQUEST)
    
    # 如果是将其他管理员改为非管理员，需要确保至少还有一个管理员
    if target_user.is_admin and role != "admin":
        admin_count = User.objects.filter(role="admin").count()
        if admin_count <= 1:
            return Response(
                {"error": "系统中至少需要保留一个管理员，请先指定其他管理员后再修改此用户的角色"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    target_user.role = role
    target_user.save()
    
    serializer = UserSerializer(target_user)
    return Response(serializer.data)


@api_view(["PATCH"])
@permission_classes([IsAdmin])
def update_user(request, user_id):
    """更新用户信息（仅管理员）"""
    try:
        target_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "用户不存在"}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = UserDetailSerializer(target_user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    
    # 如果尝试修改角色，需要通过update_user_role接口
    if "role" in request.data:
        return Response(
            {"error": "请使用角色更新接口修改用户角色"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer.save()
    return Response(serializer.data)


@api_view(["DELETE"])
@permission_classes([IsAdmin])
def delete_user(request, user_id):
    """删除用户（仅管理员）"""
    try:
        target_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "用户不存在"}, status=status.HTTP_404_NOT_FOUND)
    
    # 不能删除自己
    if target_user.id == request.user.id:
        return Response({"error": "不能删除自己的账号"}, status=status.HTTP_400_BAD_REQUEST)
    
    # 不能删除管理员，只能通过转让角色后再删除
    if target_user.is_admin:
        return Response(
            {"error": "不能直接删除管理员，请先将管理员角色转给其他用户"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    target_user.delete()
    return Response({"message": "用户删除成功"}, status=status.HTTP_200_OK)
