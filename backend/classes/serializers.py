from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Class, InvitationCode

User = get_user_model()


class InvitationCodeSerializer(serializers.ModelSerializer):
    """邀请码序列化器"""
    
    class Meta:
        model = InvitationCode
        fields = ["id", "code", "expires_at", "max_uses", "current_uses", "is_active", "created_at"]
        read_only_fields = ["id", "code", "current_uses", "created_at"]


class ClassSerializer(serializers.ModelSerializer):
    """班级序列化器"""
    
    teacher_name = serializers.CharField(source="teacher.username", read_only=True)
    student_count = serializers.SerializerMethodField()
    active_invitation_code = serializers.SerializerMethodField()
    
    class Meta:
        model = Class
        fields = [
            "id", "name", "description", "teacher", "teacher_name",
            "student_count", "active_invitation_code", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "teacher", "created_at", "updated_at"]
    
    def get_student_count(self, obj):
        return obj.students.count()
    
    def get_active_invitation_code(self, obj):
        invitation = obj.invitation_codes.filter(is_active=True).first()
        if invitation:
            return InvitationCodeSerializer(invitation).data
        return None


class ClassDetailSerializer(serializers.ModelSerializer):
    """班级详情序列化器"""
    
    teacher_name = serializers.CharField(source="teacher.username", read_only=True)
    students = serializers.SerializerMethodField()
    invitation_codes = InvitationCodeSerializer(many=True, read_only=True)
    
    class Meta:
        model = Class
        fields = [
            "id", "name", "description", "teacher", "teacher_name",
            "students", "invitation_codes", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "teacher", "created_at", "updated_at"]
    
    def get_students(self, obj):
        from users.serializers import UserSerializer
        return UserSerializer(obj.students.all(), many=True).data


class JoinClassSerializer(serializers.Serializer):
    """加入班级序列化器"""
    
    code = serializers.CharField(max_length=20, required=True)

