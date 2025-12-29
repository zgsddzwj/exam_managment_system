from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """用户序列化器"""
    
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "role", "created_at"]
        read_only_fields = ["id", "created_at"]


class RegisterSerializer(serializers.ModelSerializer):
    """注册序列化器"""
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ["username", "email", "password", "password2", "role", "first_name", "last_name"]
        extra_kwargs = {
            "email": {"required": True},
        }
    
    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "两次密码输入不一致"})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop("password2")
        user = User.objects.create_user(**validated_data)
        return user


class UserDetailSerializer(serializers.ModelSerializer):
    """用户详情序列化器"""
    
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "role", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

