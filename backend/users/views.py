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
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "用户不存在"}, status=status.HTTP_404_NOT_FOUND)
    
    role = request.data.get("role")
    if role not in ["admin", "teacher", "student"]:
        return Response({"error": "无效的角色"}, status=status.HTTP_400_BAD_REQUEST)
    
    user.role = role
    user.save()
    
    serializer = UserSerializer(user)
    return Response(serializer.data)
